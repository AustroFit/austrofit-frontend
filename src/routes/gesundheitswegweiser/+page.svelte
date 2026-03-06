<script>
  import { onMount } from 'svelte';
  import { getAccessToken } from '$lib/utils/auth';
  import ArtikelKarte from '$lib/components/gesundheitswegweiser/ArtikelKarte.svelte';
  import KategorieFilter from '$lib/components/gesundheitswegweiser/KategorieFilter.svelte';
  import SuchFeld from '$lib/components/gesundheitswegweiser/SuchFeld.svelte';

  const { data } = $props();

  const PAGE_SIZE = 10;

  let searchTerm = $state('');
  let shown = $state(PAGE_SIZE);

  /**
   * Quiz statuses keyed by quiz ID, fetched client-side for logged-in users.
   * @type {Record<number, { status: 'open'|'passed'|'repeatable', points_earned?: number }>}
   */
  let quizStatuses = $state({});

  // Client-side filtered articles (search runs on the SSR-filtered set)
  const filteredArticles = $derived(
    searchTerm
      ? data.articles.filter(
          (a) =>
            a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : data.articles
  );

  const displayedArticles = $derived(filteredArticles.slice(0, shown));
  const hasMore = $derived(shown < filteredArticles.length);

  /** @param {string} term */
  function onSearch(term) {
    searchTerm = term;
    shown = PAGE_SIZE; // reset pagination when search changes
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
    if (!token) return;

    const quizIds = Object.values(data.quizzesByArticleId)
      .map((q) => q.id)
      .filter(Boolean);
    if (!quizIds.length) return;

    try {
      const res = await fetch(`/api/quiz-status?quizIds=${quizIds.join(',')}`, {
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
  <title>Gesundheitswegweiser – Tipps für ein gesünderes Leben | AustroFit</title>
  <meta
    name="description"
    content="Evidenzbasierte Gesundheitsartikel zu Bewegung, Ernährung und Prävention. Lerne mehr und verdiene Punkte mit unseren interaktiven Quizzen."
  />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<script type="application/ld+json">${jsonLd}<\/script>`}
</svelte:head>

<!-- ─── Hero ──────────────────────────────────────────────────────────────── -->
<div class="text-white" style="background: #E8272A;">
  <div class="mx-auto max-w-[1140px] px-4 py-10 md:py-14">
    <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-white/70">
      Gesundheitswegweiser
    </p>
    <h1
      class="text-3xl font-bold md:text-4xl"
      style="font-family: var(--font-family-heading);"
    >
      Tipps für ein gesünderes Leben
    </h1>
    <p class="mt-2 max-w-xl text-base text-white/80">
      Evidenzbasierte Gesundheitsartikel für Österreich.
      Quiz lösen und Punkte verdienen.
    </p>
  </div>
</div>

<!-- ─── Sticky filter bar ─────────────────────────────────────────────────── -->
<div class="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
  <div class="mx-auto max-w-[1140px] px-4 py-3">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div class="min-w-0 flex-1">
        <KategorieFilter blocks={data.availableBlocks} activeBlock={data.activeBlock} />
      </div>
      <div class="w-full shrink-0 sm:w-60">
        <SuchFeld {onSearch} />
      </div>
    </div>
  </div>
</div>

<!-- ─── Article grid ──────────────────────────────────────────────────────── -->
<main class="mx-auto max-w-[1140px] px-4 py-8">

  {#if filteredArticles.length === 0}
    <!-- Empty state -->
    <div class="flex flex-col items-center py-20 text-center text-gray-400">
      <svg class="mb-4 h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-base font-medium">Keine Artikel gefunden</p>
      {#if searchTerm}
        <p class="mt-1 text-sm">Versuche einen anderen Suchbegriff.</p>
      {/if}
    </div>

  {:else}
    <!-- Result count -->
    <p class="mb-5 text-sm text-gray-400">
      {filteredArticles.length}
      {filteredArticles.length === 1 ? 'Artikel' : 'Artikel'}
      {data.activeBlock ? `· ${data.availableBlocks.find((b) => b.id === data.activeBlock)?.label ?? ''}` : ''}
    </p>

    <!-- Grid -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each displayedArticles as article (article.id)}
        {@const quiz = data.quizzesByArticleId[article.id] ?? null}
        {@const quizStatus = quiz ? (quizStatuses[quiz.id] ?? null) : null}
        <ArtikelKarte {article} {quiz} {quizStatus} />
      {/each}
    </div>

    <!-- Load more -->
    {#if hasMore}
      <div class="mt-10 text-center">
        <button
          onclick={loadMore}
          class="rounded-full border border-gray-300 px-8 py-2.5 text-sm font-medium text-gray-600
            transition-colors hover:border-gray-400 hover:text-gray-900"
        >
          Mehr laden
          <span class="text-gray-400">({filteredArticles.length - shown} weitere)</span>
        </button>
      </div>
    {/if}
  {/if}
</main>
