<script>
  /**
   * @typedef {{ id: number, eligiblePoints: number }} QuizInfo
   * @typedef {{ status: 'open' | 'passed' | 'repeatable', points_earned?: number }} QuizStatus
   */

  /** @type {{ article: any, quiz?: QuizInfo|null, quizStatus?: QuizStatus|null }} */
  const { article, quiz = null, quizStatus = null } = $props();

  /** @type {Record<string, { bg: string, text: string, label: string }>} */
  const BLOCK_STYLES = {
    vk:   { bg: '#EFF6FF', text: '#1D4ED8', label: 'Volkskrankheiten' },
    pv:   { bg: '#F5F3FF', text: '#6D28D9', label: 'Prävention & Vorsorge' },
    ls:   { bg: '#ECFDF5', text: '#065F46', label: 'Lebensstil' },
    kw:   { bg: '#FFFBEB', text: '#92400E', label: 'Krankheitswissen' },
    mh:   { bg: '#FDF2F8', text: '#9D174D', label: 'Mental Health' },
    sys:  { bg: '#F9FAFB', text: '#374151', label: 'Gesundheitssystem' },
    myth: { bg: '#FFF1F2', text: '#9F1239', label: 'Mythen & Faktencheck' },
  };

  const blockStyle = $derived(article.block ? BLOCK_STYLES[article.block] : null);
  const isCompleted = $derived(
    quizStatus?.status === 'passed' || quizStatus?.status === 'repeatable'
  );
</script>

<a
  href="/gesundheitswegweiser/{article.slug}"
  class="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
>
  <!-- Badges row -->
  <div class="mb-3 flex flex-wrap items-center gap-2">
    {#if blockStyle}
      <span
        class="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
        style="background:{blockStyle.bg}; color:{blockStyle.text};"
      >
        {blockStyle.label}
      </span>
    {/if}
    {#if isCompleted}
      <span class="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
        <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        Quiz gelöst
      </span>
    {/if}
  </div>

  <!-- Image -->
  {#if article.imageUrl}
    <img
      src={article.imageUrl}
      alt={article.title}
      class="mb-3 -mx-5 w-[calc(100%+2.5rem)] h-40 object-cover"
    />
  {/if}

  <!-- Title -->
  <h2 class="mb-2 flex-1 text-base font-semibold leading-snug text-gray-900 line-clamp-2 group-hover:underline underline-offset-2">
    {article.title}
  </h2>

  <!-- Description -->
  {#if article.description}
    <p class="mb-4 text-sm leading-relaxed text-gray-500 line-clamp-2">
      {article.description}
    </p>
  {/if}

  <!-- Footer: reading time + quiz hint -->
  <div class="mt-auto flex items-center gap-4 text-xs text-gray-400">
    <span class="flex items-center gap-1">
      <!-- clock icon -->
      <svg class="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {article.readingMinutes} Min.
    </span>

    {#if quiz}
      <span class="flex items-center gap-1 font-medium" style="color: #4CAF50;">
        <!-- trophy icon -->
        <svg class="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Quiz → {quiz.eligiblePoints}P
      </span>
    {/if}
  </div>
</a>
