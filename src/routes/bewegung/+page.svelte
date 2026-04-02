<!-- src/routes/bewegung/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getValidAccessToken } from '$lib/utils/auth';
  import { qs } from '$lib/utils/qs';
  import CircleRing from '$lib/components/CircleRing.svelte';

  // ── State ────────────────────────────────────────────────────────────────
  let loading = $state(true);

  interface DayData { date: string; minutes: number; }
  let monthData = $state<DayData[]>([]);

  // Targets: loaded once from cardio summary (for daily goal calculation)
  let targets = $state<{ start: number; full: number }>({ start: 50, full: 150 });
  const dailyGoal = $derived(Math.round(targets.full / 7)); // ≈ 21 min

  const now = new Date();
  let viewYear  = $state(now.getFullYear());
  let viewMonth = $state(now.getMonth()); // 0-based

  const todayStr = now.toISOString().split('T')[0];
  const WEEK_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const;

  // ── Derived ──────────────────────────────────────────────────────────────
  const monthName = $derived(
    new Date(viewYear, viewMonth, 1).toLocaleDateString('de-AT', { month: 'long', year: 'numeric' })
  );

  const isCurrentMonth = $derived(
    viewYear === now.getFullYear() && viewMonth === now.getMonth()
  );

  /** Calendar grid: null = empty leading cell, string = YYYY-MM-DD */
  const calendarDays = $derived.by<(string | null)[]>(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const startDow = (firstDay.getDay() + 6) % 7; // ISO week: Mon=0 … Sun=6
    const days: (string | null)[] = Array(startDow).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(
        `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      );
    }
    return days;
  });

  const totalMonthMinutes = $derived(monthData.reduce((sum, d) => sum + d.minutes, 0));
  const activeDays  = $derived(monthData.filter(d => d.minutes > 0).length);
  const goalDays    = $derived(monthData.filter(d => d.minutes >= dailyGoal).length);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function getDayMinutes(date: string | null): number {
    if (!date) return 0;
    return monthData.find(d => d.date === date)?.minutes ?? 0;
  }

  async function loadMonthData() {
    loading = true;
    const token = await getValidAccessToken();
    if (!token) { goto('/login'); return; }

    const res = await fetch(
      `/api/cardio/history?${qs({
        year:  String(viewYear),
        month: String(viewMonth + 1)
      })}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.ok) {
      const body = await res.json();
      monthData = (body.dailyMinutes ?? []) as DayData[];
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

    // Load targets + month data in parallel
    const [, summaryRes] = await Promise.all([
      loadMonthData(),
      fetch('/api/cardio/summary', { headers: { Authorization: `Bearer ${token}` } })
    ]);
    if (summaryRes.ok) {
      const sd = await summaryRes.json();
      if (sd.targets) targets = sd.targets;
    }
  });
</script>

<svelte:head><title>Bewegung – AustroFit</title></svelte:head>

<main class="min-h-screen bg-gray-50 pb-24">

  <!-- Header -->
  <div class="bg-darkblue text-white">
    <div class="mx-auto max-w-2xl px-4 pt-8 pb-14 flex items-center gap-3">
      <a
        href="/dashboard"
        class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors text-sm"
      >←</a>
      <h1 class="text-xl font-bold font-heading">Bewegung Verlauf</h1>
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
              {@const mins = getDayMinutes(date)}
              {@const isGoal  = mins >= dailyGoal}
              {@const isToday = date === todayStr}
              {@const dayNum  = parseInt(date.split('-')[2])}
              {@const ringPercent = Math.min(100, Math.round((mins / (dailyGoal || 1)) * 100))}
              {@const ringColor = isGoal ? 'primary' : 'secondary'}
              <div class="flex flex-col items-center gap-0.5 py-0.5">
                <CircleRing percent={ringPercent} color={ringColor} {isToday} label={String(dayNum)} />
                {#if mins > 0}
                  <span class="text-[9px] font-bold leading-tight {isGoal ? 'text-primary' : 'text-secondary'}">{mins}m</span>
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
    {#if !loading && activeDays > 0}
      <div class="rounded-[var(--radius-card)] bg-white border border-black/10 shadow-sm p-5">
        <div class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          {monthName} – Zusammenfassung
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div class="flex flex-col items-center gap-0.5 rounded-xl bg-gray-50 py-3">
            <span class="text-xl font-bold font-heading text-secondary">{totalMonthMinutes} min</span>
            <span class="text-[10px] text-gray-400 font-medium">Äquivalenz-Min.</span>
          </div>
          <div class="flex flex-col items-center gap-0.5 rounded-xl bg-gray-50 py-3">
            <span class="text-xl font-bold font-heading text-primary">{goalDays}</span>
            <span class="text-[10px] text-gray-400 font-medium">Tagesziel ({dailyGoal} min)</span>
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
