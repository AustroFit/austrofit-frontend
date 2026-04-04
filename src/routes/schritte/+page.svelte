<!-- src/routes/schritte/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getValidAccessToken } from '$lib/utils/auth';
  import { qs } from '$lib/utils/qs';
  import CircleRing from '$lib/components/CircleRing.svelte';
  import { toLocalDateString, buildCalendarDays, buildMonthDateRange, isValidDateString } from '$lib/utils/date';
  import { apiUrl } from '$lib/utils/api';

  // ── State ────────────────────────────────────────────────────────────────
  let loading = $state(true);
  let userId = $state('');

  interface DayData { date: string; points: number; steps?: number; }
  let monthData = $state<DayData[]>([]);

  const now = new Date();
  let viewYear = $state(now.getFullYear());
  let viewMonth = $state(now.getMonth()); // 0-based

  const todayStr = toLocalDateString(now);
  const WEEK_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const;

  // ── Derived ──────────────────────────────────────────────────────────────
  const monthName = $derived(
    new Date(viewYear, viewMonth, 1).toLocaleDateString('de-AT', { month: 'long', year: 'numeric' })
  );

  const isCurrentMonth = $derived(
    viewYear === now.getFullYear() && viewMonth === now.getMonth()
  );

  /** Calendar grid: null = empty leading cell, string = YYYY-MM-DD */
  const calendarDays = $derived(buildCalendarDays(viewYear, viewMonth));

  const totalMonthPoints = $derived(monthData.reduce((sum, d) => sum + d.points, 0));
  const totalMonthSteps  = $derived(monthData.reduce((sum, d) => sum + (d.steps ?? 0), 0));
  const activeDays = $derived(monthData.filter(d => d.points > 0).length);
  const goalDays = $derived(monthData.filter(d => d.points >= 40).length);

  const STEP_GOAL = 7000;

  // ── Helpers ───────────────────────────────────────────────────────────────
  function getDayData(date: string | null): DayData {
    if (!date) return { date: '', points: 0 };
    return monthData.find(d => d.date === date) ?? { date, points: 0 };
  }

  async function loadMonthData() {
    if (!userId) return;
    loading = true;
    const token = await getValidAccessToken();
    if (!token) { goto('/login'); return; }

    const { dateFrom, dateTo } = buildMonthDateRange(viewYear, viewMonth + 1);

    const res = await fetch(
      apiUrl(`/api/ledger-entries?${qs({
        user: userId,
        source_types: 'schritte,step',
        occurred_at_from: `${dateFrom}T00:00:00`,
        occurred_at_to: `${dateTo}T23:59:59`,
        limit: '31'
      })}`),
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.ok) {
      const body = await res.json();
      const byDate: Record<string, { points: number; steps: number }> = {};
      for (const e of (body.data ?? [])) {
        const d = String(e.source_ref ?? '');
        if (isValidDateString(d)) {
          if (!byDate[d]) byDate[d] = { points: 0, steps: 0 };
          byDate[d].points += e.points_delta ?? 0;
          byDate[d].steps  += Number(e.meta?.steps ?? 0);
        }
      }
      monthData = Object.entries(byDate).map(([date, v]) => ({ date, points: v.points, steps: v.steps }));
    }
    loading = false;
  }

  function prevMonth() {
    if (viewMonth === 0) { viewMonth = 11; viewYear--; } else viewMonth--;
    void loadMonthData();
  }

  function nextMonth() {
    if (isCurrentMonth) return;
    if (viewMonth === 11) { viewMonth = 0; viewYear++; } else viewMonth++;
    void loadMonthData();
  }

  // ── Load ─────────────────────────────────────────────────────────────────
  onMount(async () => {
    const token = await getValidAccessToken();
    if (!token) { goto('/login'); return; }
    const profileRes = await fetch(apiUrl('/api/profile'), {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!profileRes.ok) { goto('/login'); return; }
    const profileData = await profileRes.json();
    userId = profileData?.data?.id ?? '';
    if (!userId) { goto('/login'); return; }
    await loadMonthData();
  });
</script>

<svelte:head><title>Schritte – AustroFit</title></svelte:head>

<main class="min-h-screen bg-gray-50 pb-24">

  <!-- Header -->
  <div class="bg-darkblue text-white">
    <div class="mx-auto max-w-2xl px-4 pt-8 pb-14 flex items-center gap-3">
      <a
        href="/dashboard"
        class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors text-sm"
      >←</a>
      <h1 class="text-xl font-bold font-heading">Schritte Verlauf</h1>
    </div>
  </div>

  <div class="mx-auto max-w-2xl px-4 -mt-8 flex flex-col gap-4">

    <!-- Monatskalender -->
    <div class="rounded-[var(--radius-card)] bg-white border border-black/10 shadow-sm p-5">

      <!-- Monats-Navigation -->
      <div class="flex items-center justify-between mb-5">
        <button
          onclick={prevMonth}
          class="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 text-gray-600 hover:bg-gray-50 transition-colors"
          aria-label="Vorheriger Monat"
        >←</button>
        <h2 class="text-base font-bold font-heading text-heading capitalize">{monthName}</h2>
        <button
          onclick={nextMonth}
          class="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 text-gray-600 hover:bg-gray-50 transition-colors
            {isCurrentMonth ? 'opacity-30 pointer-events-none' : ''}"
          aria-label="Nächster Monat"
        >→</button>
      </div>

      <!-- Wochentag-Header -->
      <div class="grid grid-cols-7 mb-1">
        {#each WEEK_LABELS as label}
          <div class="text-center text-[11px] font-semibold text-gray-400 py-1">{label}</div>
        {/each}
      </div>

      <!-- Kalender-Grid -->
      {#if loading}
        <div class="h-56 flex items-center justify-center text-sm text-gray-400">Lädt…</div>
      {:else}
        <div class="grid grid-cols-7 gap-y-1">
          {#each calendarDays as date}
            {#if date === null}
              <div></div>
            {:else}
              {@const day = getDayData(date)}
              {@const pts = day.points}
              {@const steps = day.steps ?? 0}
              {@const isGoal = pts >= 40}
              {@const isToday = date === todayStr}
              {@const dayNum = parseInt(date.split('-')[2])}
              {@const ringPercent = Math.round((pts / 40) * 100)}
              <div class="flex flex-col items-center gap-0.5 py-0.5">
                <CircleRing percent={ringPercent} {isToday} label={String(dayNum)} />
                {#if steps > 0}
                  <span class="text-[9px] font-bold leading-tight {isGoal ? 'text-primary' : 'text-secondary'}">{steps.toLocaleString('de-AT')}</span>
                {:else if pts > 0}
                  <span class="text-[9px] font-bold leading-tight text-secondary">{pts}P</span>
                {:else}
                  <span class="text-[9px] leading-tight text-transparent select-none">–</span>
                {/if}
              </div>
            {/if}
          {/each}
        </div>
      {/if}
    </div>

    <!-- Monats-Zusammenfassung -->
    {#if !loading && (activeDays > 0)}
      <div class="rounded-[var(--radius-card)] bg-white border border-black/10 shadow-sm p-5">
        <div class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          {monthName} – Zusammenfassung
        </div>
        <div class="grid grid-cols-2 gap-3 mb-3">
          <div class="flex flex-col items-center gap-0.5 rounded-xl bg-gray-50 py-3">
            <span class="text-xl font-bold font-heading text-heading">{totalMonthSteps.toLocaleString('de-AT')}</span>
            <span class="text-[10px] text-gray-400 font-medium">Schritte gesamt</span>
          </div>
          <div class="flex flex-col items-center gap-0.5 rounded-xl bg-gray-50 py-3">
            <span class="text-xl font-bold font-heading text-secondary">{totalMonthPoints.toLocaleString('de-AT')}P</span>
            <span class="text-[10px] text-gray-400 font-medium">Punkte gesamt</span>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col items-center gap-0.5 rounded-xl bg-gray-50 py-3">
            <span class="text-xl font-bold font-heading text-primary">{goalDays}</span>
            <span class="text-[10px] text-gray-400 font-medium">Tagesziel ({STEP_GOAL.toLocaleString('de-AT')} Schritte)</span>
          </div>
          <div class="flex flex-col items-center gap-0.5 rounded-xl bg-gray-50 py-3">
            <span class="text-xl font-bold font-heading text-heading">{activeDays}</span>
            <span class="text-[10px] text-gray-400 font-medium">Aktive Tage</span>
          </div>
        </div>
      </div>
    {/if}

  </div>
</main>
