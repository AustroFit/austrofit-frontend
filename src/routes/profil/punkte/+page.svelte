<!-- src/routes/profil/punkte/+page.svelte -->
<!-- Punkte-Detail: Buchungshistorie, Badge-Sammlung, Level-Roadmap -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getAccessToken } from '$lib/utils/auth';
  import { getLevelInfo, LEVEL_DEFS } from '$lib/utils/level';
  import { getBadgeDefs } from '$lib/utils/badges';
  import type { BadgeDef } from '$lib/utils/badges';
  import { qs } from '$lib/utils/qs';
  import LevelFortschritt from '$lib/components/profil/LevelFortschritt.svelte';
  import PunkteBadge from '$lib/components/profil/PunkteBadge.svelte';
  import BuchungsZeile from '$lib/components/profil/BuchungsZeile.svelte';
  import type { LedgerEntry } from '$lib/components/profil/BuchungsZeile.svelte';

  type FilterKey = 'all' | 'education' | 'schritte' | 'streak' | 'onboarding' | 'einloesung';

  const PAGE_SIZE = 20;

  // ── State ─────────────────────────────────────────────────────────────────
  let loading = $state(true);
  let errorMsg = $state('');

  let userId = $state('');
  let totalPoints = $state(0);
  let earnedPoints = $state(0);
  let longestStreak = $state(0);

  let entries = $state<LedgerEntry[]>([]);
  let totalEntries = $state(0);
  let currentPage = $state(0);
  let loadingMore = $state(false);
  let activeFilter = $state<FilterKey>('all');

  // Badge-Quelldaten
  let quizPassCount = $state(0);
  let hasSchritte = $state(false);
  let hasEinloesung = $state(false);

  // ── Computed ──────────────────────────────────────────────────────────────
  const levelInfo = $derived(getLevelInfo(earnedPoints));
  const hasMore = $derived(entries.length < totalEntries);

  const badges = $derived<BadgeDef[]>(
    getBadgeDefs({ hasSchritte, quizPassCount, longestStreak, earnedPoints, hasEinloesung })
  );

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all',        label: 'Alle' },
    { key: 'education',  label: '📚 Quizze' },
    { key: 'schritte',   label: '👟 Schritte' },
    { key: 'streak',     label: '🔥 Streak' },
    { key: 'onboarding', label: '🎁 Onboarding' },
    { key: 'einloesung', label: '🎫 Einlösung' }
  ];

  // ── Helpers ───────────────────────────────────────────────────────────────
  async function fetchEntries(reset: boolean) {
    const page = reset ? 0 : currentPage + 1;
    const params: Record<string, string> = {
      user: userId,
      limit: String(PAGE_SIZE),
      offset: String(page * PAGE_SIZE)
    };
    if (activeFilter !== 'all') params.source_type = activeFilter;

    loadingMore = true;
    try {
      const res = await fetch(`/api/ledger-entries?${qs(params)}`);
      if (!res.ok) { errorMsg = 'Buchungen konnten nicht geladen werden.'; return; }
      const data = await res.json();
      if (reset) {
        entries = data.data ?? [];
        currentPage = 0;
      } else {
        entries = [...entries, ...(data.data ?? [])];
        currentPage = page;
      }
      totalEntries = data.total ?? 0;
    } finally {
      loadingMore = false;
    }
  }

  function setFilter(key: FilterKey) {
    activeFilter = key;
    fetchEntries(true);
  }

  // ── Load ──────────────────────────────────────────────────────────────────
  onMount(async () => {
    const token = getAccessToken();
    if (!token) { goto('/login?next=/profil/punkte'); return; }
    const authHeader = { Authorization: `Bearer ${token}` };

    try {
      const meRes = await fetch('/api/me', { headers: authHeader });
      if (!meRes.ok) { goto('/login?next=/profil/punkte'); return; }
      const me = await meRes.json();
      const user = me?.data;
      if (!user?.id) { goto('/login?next=/profil/punkte'); return; }

      userId        = user.id;
      longestStreak = Number(user.longest_streak ?? 0);

      // Punkte + Badge-Quelldaten + erste Eintragsseite parallel laden
      const [ledgerRes, earnedRes, eduRes, schrittRes, einloeseRes, entriesRes] = await Promise.all([
        fetch(`/api/ledger-total?${qs({ user: userId })}`),
        fetch(`/api/ledger-total?${qs({ user: userId, positive_only: 'true' })}`),
        fetch(`/api/ledger-entries?${qs({ user: userId, source_type: 'education', limit: '1' })}`),
        fetch(`/api/ledger-entries?${qs({ user: userId, source_type: 'schritte',  limit: '1' })}`),
        fetch(`/api/ledger-entries?${qs({ user: userId, source_type: 'einloesung',limit: '1' })}`),
        fetch(`/api/ledger-entries?${qs({ user: userId, limit: String(PAGE_SIZE)  })}`)
      ]);

      if (ledgerRes.ok)   totalPoints    = Number((await ledgerRes.json()).total ?? 0);
      if (earnedRes.ok)   earnedPoints   = Number((await earnedRes.json()).total ?? 0);
      if (eduRes.ok)      quizPassCount  = Number((await eduRes.json()).total    ?? 0);
      if (schrittRes.ok)  hasSchritte    = Number((await schrittRes.json()).total ?? 0) > 0;
      if (einloeseRes.ok) hasEinloesung  = Number((await einloeseRes.json()).total ?? 0) > 0;
      if (entriesRes.ok) {
        const ed = await entriesRes.json();
        entries      = ed.data  ?? [];
        totalEntries = ed.total ?? 0;
      }
    } catch (e: unknown) {
      errorMsg = e instanceof Error ? e.message : 'Fehler beim Laden.';
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head><title>Punkte &amp; Badges – AustroFit</title></svelte:head>

<main class="min-h-[calc(100vh-75px)] bg-gray-50 pb-24">
  {#if loading}
    <div class="flex items-center justify-center py-32">
      <div class="flex flex-col items-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600"></div>
        <p class="text-sm text-gray-500">Wird geladen…</p>
      </div>
    </div>

  {:else if errorMsg}
    <div class="mx-auto max-w-lg px-4 py-16">
      <div class="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">{errorMsg}</div>
    </div>

  {:else}
    <!-- ── Punkte-Header (kompakt, rot) ──────────────────────────────────── -->
    <div class="text-white" style="background:#2E7D32;">
      <div class="mx-auto max-w-2xl px-4 pt-8 pb-14">
        <a href="/dashboard" class="mb-4 inline-flex items-center gap-1.5 text-sm opacity-80 hover:opacity-100">
          ← Zurück zum Dashboard
        </a>
        <h1 class="text-2xl font-bold" style="font-family: 'Jost', sans-serif;">Punkte &amp; Badges</h1>
      </div>
    </div>

    <div class="mx-auto -mt-8 flex max-w-2xl flex-col gap-6 px-4">

      <!-- ── Punkte-Übersicht ───────────────────────────────────────────── -->
      <div class="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <PunkteBadge punkte={earnedPoints} size="small" />
        <div class="mt-4">
          <LevelFortschritt punkte={earnedPoints} />
        </div>
      </div>

      <!-- ── Buchungs-Historie ──────────────────────────────────────────── -->
      <section>
        <h2 class="mb-3 text-lg font-bold" style="font-family: 'Jost', sans-serif;">Buchungshistorie</h2>

        <!-- Filter-Chips -->
        <div class="mb-4 flex flex-wrap gap-2">
          {#each filters as f}
            <button
              class="rounded-full border px-3 py-1.5 text-sm transition-colors
                {activeFilter === f.key
                  ? 'border-black bg-black text-white'
                  : 'border-black/15 hover:bg-black/5'}"
              onclick={() => setFilter(f.key)}
            >{f.label}</button>
          {/each}
        </div>

        <div class="rounded-2xl border border-black/10 bg-white shadow-sm">
          {#if entries.length === 0}
            <div class="px-6 py-10 text-center text-sm text-gray-400">
              Keine Einträge in dieser Kategorie.
            </div>
          {:else}
            <div class="divide-y divide-black/5 px-6">
              {#each entries as entry (entry.id)}
                <BuchungsZeile buchung={entry} />
              {/each}
            </div>
            {#if hasMore}
              <div class="border-t border-black/5 p-4 text-center">
                <button
                  class="rounded-full border border-black/15 px-5 py-2 text-sm font-medium transition-colors hover:bg-black/5 disabled:opacity-50"
                  onclick={() => fetchEntries(false)}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Wird geladen…' : 'Mehr laden'}
                </button>
              </div>
            {/if}
          {/if}
        </div>
      </section>

      <!-- ── Badge-Sammlung ────────────────────────────────────────────── -->
      <section id="badges">
        <h2 class="mb-3 text-lg font-bold" style="font-family: 'Jost', sans-serif;">Deine Badges</h2>
        <div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {#each badges as badge (badge.id)}
            <div
              class="flex flex-col items-center gap-1.5 rounded-2xl border p-4 text-center transition-all
                {badge.earned
                  ? 'border-black/10 bg-white shadow-sm'
                  : 'border-dashed border-gray-200 bg-gray-50'}"
            >
              <div class="text-3xl {badge.earned ? '' : 'opacity-25 grayscale'}">{badge.icon}</div>
              <div class="text-xs font-semibold leading-tight {badge.earned ? '' : 'text-gray-400'}">
                {badge.name}
              </div>
              {#if badge.earned}
                <div class="text-xs text-gray-500">{badge.beschreibung}</div>
              {:else}
                <div class="text-xs text-gray-400">{badge.hint}</div>
              {/if}
            </div>
          {/each}
        </div>
      </section>

      <!-- ── Level-Roadmap ─────────────────────────────────────────────── -->
      <section>
        <h2 class="mb-3 text-lg font-bold" style="font-family: 'Jost', sans-serif;">Level-Roadmap</h2>
        <div class="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <div class="flex flex-col gap-3">
            {#each LEVEL_DEFS as lvl (lvl.level)}
              {@const isCurrent = lvl.level === levelInfo.current.level}
              {@const isDone = earnedPoints >= lvl.min && !isCurrent}
              <div
                class="flex items-center gap-4 rounded-xl p-3 transition-all
                  {isCurrent ? 'border-2 shadow-sm' : 'border border-black/5'}"
                style={isCurrent ? 'border-color:#2E7D32; background:#2E7D3208;' : ''}
              >
                <!-- Level-Nummer -->
                <div
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold
                    {isCurrent
                      ? 'text-white'
                      : isDone
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-400'}"
                  style={isCurrent ? 'background:#2E7D32;' : ''}
                >
                  {lvl.level}
                </div>
                <!-- Level-Info -->
                <div class="min-w-0 flex-1">
                  <div class="flex items-baseline gap-2">
                    <span class="font-semibold {isCurrent ? '' : isDone ? 'text-emerald-700' : 'text-gray-400'}">
                      {lvl.name}
                    </span>
                    {#if isCurrent}
                      <span
                        class="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                        style="background:#2E7D32;"
                      >Aktuell</span>
                    {:else if isDone}
                      <span class="text-xs text-emerald-600">✓ Erreicht</span>
                    {/if}
                  </div>
                  <div class="text-xs text-gray-400">
                    ab {lvl.min.toLocaleString('de-AT')} Punkte
                  </div>
                </div>
                <!-- Punkte-Zahl (rechts) -->
                {#if isCurrent && levelInfo.next}
                  <div class="shrink-0 text-right text-xs text-gray-500">
                    {(levelInfo.next.min - earnedPoints).toLocaleString('de-AT')} P fehlen
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      </section>

    </div>
  {/if}
</main>
