<script>
  import { onMount } from 'svelte';
  import Quiz from '$lib/components/singlepage/Quiz.svelte';

  const { data } = $props();
  const item = $derived(data.item);
  const quiz = $derived(data.quiz);

  /** @type {HTMLElement | null} */
  let contentEl = $state(null);

  let speaking = $state(false);

  /** Wählt die beste verfügbare deutsche Stimme aus (bevorzugt natürliche/Google-Stimmen). */
  function getBestGermanVoice() {
    const voices = window.speechSynthesis.getVoices();
    const german = voices.filter((v) => v.lang.startsWith('de'));
    if (!german.length) return null;
    // Priorität: de-AT → de-DE → beliebige deutsche Stimme
    for (const lang of ['de-AT', 'de-DE', 'de']) {
      const match = german.filter((v) => v.lang === lang || v.lang.startsWith(lang));
      if (!match.length) continue;
      // Bevorzuge Google- oder Siri-Stimmen (bessere Qualität), sonst erste Nicht-Default-Stimme
      return (
        match.find((v) => v.name.toLowerCase().includes('google')) ??
        match.find((v) => !v.default) ??
        match[0]
      );
    }
    return german[0];
  }

  function startSpeech() {
    const text = contentEl?.innerText ?? '';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-AT';
    const voice = getBestGermanVoice();
    if (voice) utterance.voice = voice;
    utterance.onend = () => (speaking = false);
    utterance.onerror = () => (speaking = false);
    window.speechSynthesis.speak(utterance);
    speaking = true;
  }

  function toggleSpeech() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      speaking = false;
      return;
    }
    // Voices können async laden – kurz warten falls noch nicht bereit
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', startSpeech, { once: true });
    } else {
      startSpeech();
    }
  }

  onMount(() => {
    if (!contentEl) return;

    // Quellen-Bereich einklappen
    const headings = contentEl.querySelectorAll('h2, h3');
    for (const heading of headings) {
      if (heading.textContent?.trim().toLowerCase() !== 'quellen') continue;
      const details = document.createElement('details');
      details.className = 'quellen-details';
      const summary = document.createElement('summary');
      summary.textContent = 'Quellen';
      details.appendChild(summary);
      let next = heading.nextElementSibling;
      while (next) {
        const sibling = next;
        next = next.nextElementSibling;
        details.appendChild(sibling);
      }
      heading.replaceWith(details);
      break;
    }

    // Hinweis/Disclaimer-Heading → styled Box
    for (const heading of contentEl.querySelectorAll('h2, h3')) {
      const txt = heading.textContent?.trim().toLowerCase() ?? '';
      if (txt !== 'hinweis' && txt !== 'disclaimer') continue;
      const box = document.createElement('div');
      box.className = 'disclaimer-box';
      heading.parentNode?.insertBefore(box, heading);
      box.appendChild(heading);
      let next = box.nextElementSibling;
      while (next && !['H2', 'H3', 'DETAILS'].includes(next.tagName)) {
        const sib = next;
        next = next.nextElementSibling;
        box.appendChild(sib);
      }
      break;
    }
  });

  import { BLOCK_STYLES } from '$lib/data/blockStyles';

  const blockStyle = $derived(item.block ? BLOCK_STYLES[item.block] : null);
  const backUrl = $derived(item.block ? `/gesundheitswegweiser?block=${item.block}` : '/gesundheitswegweiser');
  const backLabel = $derived(item.blockLabel ?? 'Gesundheitswegweiser');
</script>

<svelte:head>
  <title>{item.seoTitle ?? `${item.title} – Gesundheitswegweiser | AustroFit`}</title>
  <meta
    name="description"
    content={item.seoDescription ?? item.description ?? `${item.title} – Gesundheitswissen von AustroFit`}
  />
</svelte:head>

<!-- ─── Hero ──────────────────────────────────────────────────────────────── -->
<section class="bg-darkblue text-white">
  <div class="mx-auto max-w-[var(--max-width-standard)] px-[var(--spacing-container-x)] lg:px-[var(--spacing-container-x-lg)] py-10 lg:py-14">

    <!-- Back link -->
    <a
      href="/gesundheitswegweiser"
      class="mb-4 inline-flex items-center gap-1.5 text-sm opacity-70 hover:opacity-100 transition-opacity"
    >
      ← Gesundheitswegweiser
    </a>

    <!-- Category chips (clickable) – neutrale Farbe auf dunklem Hintergrund -->
    {#if blockStyle}
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <a
          href="/gesundheitswegweiser?block={item.block}"
          class="inline-block rounded-[var(--radius-pill)] bg-white/15 px-3 py-1 text-xs font-semibold text-white/80 transition-opacity hover:opacity-80"
        >{item.blockLabel}</a>
        {#if item.catLabel}
          <span class="text-white/40 text-xs select-none">›</span>
          <span class="inline-block rounded-[var(--radius-pill)] px-3 py-1 text-xs font-medium bg-white/10 text-white/70">
            {item.catLabel}
          </span>
        {/if}
      </div>
    {/if}

    <!-- Title -->
    <h1 class="font-heading text-3xl font-bold md:text-4xl leading-tight mb-4 break-words">
      {item.title}
    </h1>

    <!-- Description -->
    {#if item.description}
      <p class="max-w-2xl text-base text-white/70 leading-relaxed mb-5">
        {item.description}
      </p>
    {/if}

    <!-- Reading time + Vorlesen-Button -->
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-1.5 text-xs text-white/40">
        <svg class="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        {item.readingMinutes} min Lesezeit
      </div>

      <button
        onclick={toggleSpeech}
        class="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
        aria-label={speaking ? 'Vorlesen stoppen' : 'Artikel vorlesen'}
      >
        {#if speaking}
          <svg class="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6h4v12H6zm8 0h4v12h-4z"/>
          </svg>
          Stopp
        {:else}
          <svg class="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          Vorlesen
        {/if}
      </button>
    </div>

  </div>
</section>

<!-- ─── Article image ─────────────────────────────────────────────────────── -->
{#if item.imageUrl}
  <div class="bg-white pt-8 lg:pt-10">
    <div class="mx-auto max-w-[var(--max-width-standard)] px-[var(--spacing-container-x)] lg:px-[var(--spacing-container-x-lg)]">
      <img
        src={item.imageUrl}
        alt={item.title}
        class="w-full max-h-[420px] object-cover rounded-[var(--radius-card)]"
        loading="lazy"
      />
    </div>
  </div>
{/if}

<!-- ─── Content ────────────────────────────────────────────────────────────── -->
<section class="bg-white">
  <div class="mx-auto max-w-3xl px-[var(--spacing-container-x)] lg:px-8 py-10 lg:py-14">
    {#if item.content}
      <div bind:this={contentEl} class="article-content text-body leading-relaxed">
        {@html item.content}
      </div>
    {/if}
  </div>
</section>

<!-- ─── Quiz ──────────────────────────────────────────────────────────────── -->
{#if quiz?.data}
  <section class="bg-light-grey py-6 lg:py-8">
    <div class="mx-auto max-w-3xl px-[var(--spacing-container-x)] lg:px-8">
      <Quiz quiz={quiz.data} meta={{ version: quiz.version, status: quiz.status }} quizId={quiz.id} />
    </div>
  </section>
{/if}

<!-- ─── Back link ─────────────────────────────────────────────────────────── -->
<div class="border-t border-gray-200 bg-white py-8">
  <div class="mx-auto max-w-[var(--max-width-standard)] px-[var(--spacing-container-x)] lg:px-[var(--spacing-container-x-lg)]">
    <a
      href={backUrl}
      class="inline-flex items-center gap-2 text-sm font-medium text-body hover:text-primary transition-colors"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
      </svg>
      Zurück zu {backLabel}
    </a>
  </div>
</div>

<style>
  /* Article typography – mirrors Content.svelte global styles */
  :global(.article-content h2) {
    font-size: 1.5rem;
    line-height: 1.25;
    font-weight: 700;
    margin-top: 2rem;
    margin-bottom: 0.75rem;
    color: var(--color-heading);
  }

  :global(.article-content h3) {
    font-size: 1.2rem;
    line-height: 1.3;
    font-weight: 650;
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--color-heading);
  }

  :global(.article-content p) {
    margin: 0.75rem 0;
  }

  :global(.article-content ul) {
    list-style-type: disc;
    margin: 0.75rem 0 0.75rem 1.5rem;
  }

  :global(.article-content ol) {
    list-style-type: decimal;
    margin: 0.75rem 0 0.75rem 1.5rem;
  }

  :global(.article-content li) {
    margin: 0.35rem 0;
    display: list-item;
  }

  :global(.article-content a) {
    color: var(--color-primary);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  :global(.article-content blockquote) {
    border-left: 4px solid var(--color-primary-light);
    padding-left: 1rem;
    margin: 1rem 0;
    opacity: 0.95;
  }

  /* Quellen-Bereich: eingeklappt */
  :global(.article-content .quellen-details) {
    margin-top: 2rem;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    padding-top: 0.75rem;
  }

  :global(.article-content .quellen-details summary) {
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    color: var(--color-body);
    list-style: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    user-select: none;
  }

  :global(.article-content .quellen-details summary::-webkit-details-marker) {
    display: none;
  }

  :global(.article-content .quellen-details summary::before) {
    content: '▶';
    font-size: 0.65rem;
    transition: transform 0.2s;
    display: inline-block;
  }

  :global(.article-content .quellen-details[open] summary::before) {
    transform: rotate(90deg);
  }

  /* Quellen-Liste: keine Nummerierung vor [1], [2] etc. */
  :global(.article-content .quellen-details ol) {
    list-style-type: none;
    margin-left: 0;
    padding-left: 0;
  }

  :global(.article-content .quellen-details ul) {
    list-style-type: none;
    margin-left: 0;
    padding-left: 0;
  }

  /* Disclaimer/Hinweis-Box */
  :global(.article-content .disclaimer-box) {
    border: 1px solid #FEF3C7;
    background: #FFFBEB;
    border-radius: 0.5rem;
    padding: 1rem;
    margin: 1.5rem 0;
  }

  :global(.article-content .disclaimer-box h2),
  :global(.article-content .disclaimer-box h3) {
    color: #92400E;
    font-size: 0.875rem;
    font-weight: 700;
    margin: 0 0 0.5rem !important;
  }
</style>
