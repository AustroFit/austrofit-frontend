<script>
  import { BLOCK_STYLES } from '$lib/data/blockStyles';

  /**
   * @typedef {{ id: number, eligiblePoints: number }} QuizInfo
   * @typedef {{ status: 'open' | 'passed' | 'repeatable', points_earned?: number }} QuizStatus
   */

  /** @type {{ article: any, quiz?: QuizInfo|null, quizStatus?: QuizStatus|null, isLoggedIn?: boolean }} */
  const { article, quiz = null, quizStatus = null, isLoggedIn = false } = $props();

  const blockStyle = $derived(article.block ? BLOCK_STYLES[article.block] : null);
  const isCompleted = $derived(
    quizStatus?.status === 'passed' || quizStatus?.status === 'repeatable'
  );
</script>

<a
  href="/gesundheitswegweiser/{article.slug}"
  class="group flex items-center gap-3 rounded-[var(--radius-card)] border p-3 shadow-[var(--shadow-s)] transition-shadow hover:shadow-md
    {isCompleted ? 'border-gray-200/80 bg-card-bg' : 'border-gray-200 bg-white'}"
>
  <!-- Bild (links) -->
  {#if article.imageUrl}
    <div class="shrink-0 h-20 w-20 overflow-hidden rounded-lg">
      <img
        src={article.imageUrl}
        alt={article.title}
        class="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  {:else}
    <div class="shrink-0 h-20 w-20 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300" aria-hidden="true">
      <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
  {/if}

  <!-- Inhalt (rechts) -->
  <div class="flex-1 min-w-0 flex flex-col gap-1">
    <!-- Überschrift -->
    <h2 class="text-sm font-semibold leading-snug text-heading line-clamp-2 group-hover:underline underline-offset-2">
      {article.title}
    </h2>

    <!-- Teaser -->
    {#if article.description}
      <p class="text-xs leading-relaxed text-body/70 line-clamp-2">
        {article.description}
      </p>
    {/if}

    <!-- Lesezeit + Chips (selbe Zeile) -->
    <div class="mt-auto flex items-center justify-between gap-2 pt-1">
      <!-- Links: Lesezeit + Quiz-gelöst -->
      <div class="flex items-center gap-2 text-xs text-body/60">
        <span class="flex items-center gap-1 shrink-0">
          <svg class="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {article.readingMinutes} Min.
        </span>

        {#if isCompleted}
          <span class="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border border-black/15 bg-white px-2 py-0.5 font-medium text-body">
            <svg class="h-3 w-3 text-primary" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            Quiz gelöst
          </span>
        {/if}
      </div>

      <!-- Rechts: Kategorie-Chip -->
      {#if blockStyle}
        <span
          class="shrink-0 rounded-[var(--radius-pill)] border px-2 py-0.5 text-xs font-medium"
          style="background-color: {blockStyle.bg}; color: {blockStyle.text}; border-color: {blockStyle.text}20;"
        >
          {blockStyle.label}
        </span>
      {/if}
    </div>
  </div>
</a>
