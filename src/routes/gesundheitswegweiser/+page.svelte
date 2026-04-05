<script>
  import { onMount } from 'svelte';
  import { getAccessToken } from '$lib/utils/auth';
  import ArtikelKarte from '$lib/components/gesundheitswegweiser/ArtikelKarte.svelte';
  import KategorieFilter from '$lib/components/gesundheitswegweiser/KategorieFilter.svelte';
  import SuchFeld from '$lib/components/gesundheitswegweiser/SuchFeld.svelte';
  import { apiUrl } from '$lib/utils/api';
  import { page } from '$app/state';

  const { data } = $props();

  // Block filter is read client-side from URL params (prerendering-safe: starts null on SSR)
  let activeBlock = $state(null);
  $effect(() => {
    const blockIds = data.availableBlocks.map((b) => b.id);
    const param = page.url.searchParams.get('block') || null;
    activeBlock = param && blockIds.includes(param) ? param : null;
  });

  const PAGE_SIZE = 10;

  let searchTerm = $state('');
  let shown = $state(PAGE_SIZE);
  let isLoggedIn = $state(false);

  /** @type {'all' | 'open' | 'completed' | 'soon'} */
  let quizFilter = $state('all');

  /**
   * Quiz statuses keyed by quiz ID, fetched client-side for logged-in users.
   * @type {Record<number, { status: 'open'|'passed'|'repeatable', points_earned?: number }>}
   */
  let quizStatuses = $state({});

  // Client-side filtered articles (block filter + search)
  const blockFiltered = $derived(
    activeBlock ? data.articles.filter((a) => a.block === activeBlock) : data.articles
  );

  const searchFiltered = $derived(
    searchTerm
      ? blockFiltered.filter(
          (a) =>
            a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : blockFiltered
  );

  // Quiz-Status-Filter (nur eingeloggt)
  const filteredArticles = $derived.by(() => {
    if (!isLoggedIn || quizFilter === 'all') return searchFiltered;

    return searchFiltered.filter((a) => {
      const quiz = data.quizzesByArticleId[a.id] ?? null;
      if (!quiz) return false; // kein Quiz → nur in "alle" sichtbar
      const status = quizStatuses[quiz.id];
      if (quizFilter === 'completed') {
        return status?.status === 'passed' || status?.status === 'repeatable';
      }
      if (quizFilter === 'soon') {
        // Bald verfügbar: Quiz bestanden, Cooldown noch aktiv (nicht repeatable)
        return status?.status === 'passed';
      }
      // 'open': hat Quiz, aber nicht bestanden
      return !status || status.status === 'open' || status.status === 'repeatable';
    });
  });

  const displayedArticles = $derived(filteredArticles.slice(0, shown));
  const hasMore = $derived(shown < filteredArticles.length);

  /** @param {string} term */
  function onSearch(term) {
    searchTerm = term;
    shown = PAGE_SIZE;
  }

  function loadMore() {
    shown += PAGE_SIZE;
  }

  // JSON-LD – ItemList schema for SEO
  const jsonLd = $derived(
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Gesundheitswegweiser – AustroFit',
      itemListElement: filteredArticles.map((article, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://www.austrofit.at/gesundheitswegweiser/${article.slug}`,
        name: article.title,
      })),
    })
  );

  // After mount: fetch quiz completion statuses for logged-in users
  onMount(async () => {
    const token = getAccessToken();
    isLoggedIn = !!token;
    if (!token) return;

    const quizIds = Object.values(data.quizzesByArticleId)
      .map((q) => q.id)
      .filter(Boolean);
    if (!quizIds.length) return;

    try {
      const res = await fetch(apiUrl(`/api/quiz-status?quizIds=${quizIds.join(',')}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        quizStatuses = await res.json();
      }
    } catch {
      // Non-fatal – badges just won't appear
    }
  });

  // Reset shown count when SSR data changes (e.g. after block filter navigation)
  $effect(() => {
    data.articles; // track dependency
    shown = PAGE_SIZE;
  });
</script>

<svelte:head>
  <title>Gesundheitswegweiser – Deine Gesundheitskompetenz. Dein Weg. | AustroFit</title>
  <meta
    name="description"
    content="Dein Gesundheitswegweiser für Österreich – fundiertes Wissen zu Bewegung, Ernährung und Prävention, ausschließlich aus seriösen, ÖGPK-geprüften Quellen."
  />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<script type="application/ld+json">${jsonLd}<\/script>`}
</svelte:head>

<!-- ─── Hero ──────────────────────────────────────────────────────────────── -->
<section class="bg-darkblue text-white">
  <div class="mx-auto max-w-[var(--max-width-standard)] px-[var(--spacing-container-x)] lg:px-[var(--spacing-container-x-lg)] py-10 lg:py-14">
    <h1 class="font-heading text-3xl font-bold md:text-4xl leading-tight mb-4">
      Deine Gesundheitskompetenz. Dein Weg.
    </h1>
    <p class="max-w-xl text-base text-white/70 leading-relaxed">
      Dein persönlicher Wegweiser zu verlässlichem Gesundheitswissen. Alle Inhalte basieren
      ausschließlich auf seriösen Gesundheitsquellen nach den Qualitätskriterien der ÖGPK.
    </p>
  </div>
</section>

<!-- ─── Content ───────────────────────────────────────────────────────────── -->
<main class="mx-auto max-w-[var(--max-width-standard)] px-[var(--spacing-container-x)] lg:px-[var(--spacing-container-x-lg)] py-8">

  <!-- Filter + Suche -->
  <div class="mb-6 flex flex-col gap-4">
    <SuchFeld {onSearch} />

    <KategorieFilter blocks={data.availableBlocks} activeBlock={activeBlock} />

    <!-- Quiz-Status-Toggle (nur eingeloggt) -->
    {#if isLoggedIn}
      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {#each [{ key: 'all', label: 'Alle' }, { key: 'open', label: 'Quiz offen' }, { key: 'completed', label: 'Quiz gelöst' }, { key: 'soon', label: 'Bald verfügbar' }] as f (f.key)}
          <button
            onclick={() => { quizFilter = f.key; shown = PAGE_SIZE; }}
            class="shrink-0 rounded-[var(--radius-pill)] border px-4 py-1.5 text-sm font-medium transition-colors
              {quizFilter === f.key
                ? 'bg-primary border-primary text-white'
                : 'border-black/15 bg-white text-body hover:border-primary hover:text-primary'}"
          >
            {f.label}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  {#if filteredArticles.length === 0}
    <!-- Empty state -->
    <div class="flex flex-col items-center py-20 text-center text-body/60">
      <svg class="mb-4 h-12 w-12 text-body/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-base font-medium text-heading">Keine Artikel gefunden</p>
      {#if searchTerm}
        <p class="mt-1 text-sm">Versuche einen anderen Suchbegriff.</p>
      {:else if quizFilter !== 'all'}
        <p class="mt-1 text-sm">Keine Artikel in dieser Kategorie.</p>
        <button
          onclick={() => (quizFilter = 'all')}
          class="mt-3 text-sm text-primary hover:underline"
        >Alle anzeigen</button>
      {/if}
    </div>

  {:else}
    <!-- Result count -->
    <p class="mb-4 text-sm text-body/60">
      {filteredArticles.length}
      {filteredArticles.length === 1 ? 'Artikel' : 'Artikel'}
      {activeBlock ? `· ${data.availableBlocks.find((b) => b.id === activeBlock)?.label ?? ''}` : ''}
    </p>

    <!-- Liste -->
    <div class="flex flex-col gap-3">
      {#each displayedArticles as article (article.id)}
        {@const quiz = data.quizzesByArticleId[article.id] ?? null}
        {@const quizStatus = quiz ? (quizStatuses[quiz.id] ?? null) : null}
        <ArtikelKarte {article} {quiz} {quizStatus} {isLoggedIn} />
      {/each}
    </div>

    <!-- Load more -->
    {#if hasMore}
      <div class="mt-10 text-center">
        <button
          onclick={loadMore}
          class="rounded-[var(--radius-pill)] border border-gray-300 px-8 py-2.5 text-sm font-medium text-body
            transition-colors hover:border-primary hover:text-primary"
        >
          Mehr laden
          <span class="text-body/60">({filteredArticles.length - shown} weitere)</span>
        </button>
      </div>
    {/if}
  {/if}
</main>
