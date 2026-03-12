<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { getAccessToken } from '$lib/utils/auth';
  import { track, identifyUser } from '$lib/utils/mixpanel';
  import { getLevelInfo, LEVEL_DEFS } from '$lib/utils/level';
  import { calculatePoints } from '$lib/utils/streak';
  import { getBadgeDefs } from '$lib/utils/badges';
  import type { BadgeDef } from '$lib/utils/badges';
  import { qs } from '$lib/utils/qs';
  import LevelFortschritt from '$lib/components/profil/LevelFortschritt.svelte';
  import BuchungsZeile from '$lib/components/profil/BuchungsZeile.svelte';
  import type { LedgerEntry } from '$lib/components/profil/BuchungsZeile.svelte';
  import HealthPermissionPrompt from '$lib/components/dashboard/HealthPermissionPrompt.svelte';
  import PWAInstallBanner from '$lib/components/dashboard/PWAInstallBanner.svelte';
  import ManuelleSchrittEingabe from '$lib/components/dashboard/ManuelleSchrittEingabe.svelte';
  import SyncToast from '$lib/components/SyncToast.svelte';
  import SchrittSyncButton from '$lib/components/SchrittSyncButton.svelte';
  import { syncSteps, shouldSync, checkPendingSyncFlag, clearPendingSyncFlag } from '$lib/services/stepSync';
  import type { SyncResult } from '$lib/services/stepSync';

  // ── State ─────────────────────────────────────────────────────────────────
  let loading = $state(true);
  let errorMsg = $state('');

  // User
  let firstName = $state('');
  let userId = $state('');
  let totalPoints = $state(0);
  let earnedPoints = $state(0);
  let longestStreak = $state(0);

  // First-visit bonus badge (shown for 7 days after registration, based on ledger)
  let showOnboardingBadge = $state(false);
  const ONBOARDING_POINTS = 20;

  // Steps / day goal
  let stepsToday = $state(0);
  const STEP_GOAL = 7000;
  const stepPercent = $derived(Math.min(100, Math.round((stepsToday / STEP_GOAL) * 100)));
  const todayPoints = $derived(calculatePoints(stepsToday));
  const bonusSteps = $derived(stepsToday > STEP_GOAL ? stepsToday - STEP_GOAL : 0);

  // Streak
  let streakDays = $state(0);

  // Level
  const levelInfo = $derived(getLevelInfo(earnedPoints));

  // Badges
  let quizPassCount = $state(0);
  let hasSchritte = $state(false);
  let hasEinloesung = $state(false);

  const badges = $derived<BadgeDef[]>(
    getBadgeDefs({ hasSchritte, quizPassCount, longestStreak, earnedPoints, hasEinloesung })
  );

  // Recent activity
  let recentEntries = $state<LedgerEntry[]>([]);

  // Open quizzes
  interface OpenQuiz {
    quizId: number;
    title: string;
    slug: string | null;
  }
  let openQuizzes = $state<OpenQuiz[]>([]);

  // Challenge & offer
  interface Challenge {
    id: number;
    titel: string;
    beschreibung: string | null;
    punkte_wert: number | null;
    aktiv_bis: string | null;
  }
  interface Angebot {
    id: number;
    titel: string;
    punkte_kosten: number | null;
    gueltig_bis: string | null;
    partner_id: { name: string; kategorie: string | null } | null;
  }

  let challenge = $state<Challenge | null>(null);
  let angebot = $state<Angebot | null>(null);

  // Overlays / panels
  let showHealthPrompt = $state(false);
  let showTestMode = $state(false);
  let showPWABanner = $state(false);

  // Sync state
  let showSyncToast = $state(false);
  let syncToastPunkte = $state(0);
  let isNativePlatform = $state(false);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function formatDate(iso: string | null) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('de-AT', { day: 'numeric', month: 'long' });
  }

  async function loadStepsFromHealth() {
    try {
      const { getStepsForDate } = await import('$lib/services/health');
      const today = new Date().toISOString().split('T')[0];
      stepsToday = (await getStepsForDate(today)) ?? 0;
    } catch {
      /* health plugin not available – leave steps at 0 */
    }
  }

  async function refreshDashboardData() {
    if (!userId) return;
    const token = getAccessToken();
    const authHeader = { Authorization: `Bearer ${token}` };
    const [ledgerRes, earnedRes, entriesRes, profileRes] = await Promise.all([
      fetch(`/api/ledger-total?${qs({ user: userId })}`),
      fetch(`/api/ledger-total?${qs({ user: userId, positive_only: 'true' })}`),
      fetch(`/api/ledger-entries?${qs({ user: userId, limit: '3' })}`),
      fetch('/api/profile', { headers: authHeader })
    ]);
    if (ledgerRes.ok) totalPoints = Number((await ledgerRes.json()).total ?? 0);
    if (earnedRes.ok) earnedPoints = Number((await earnedRes.json()).total ?? 0);
    if (entriesRes.ok) recentEntries = (await entriesRes.json()).data ?? [];
    if (profileRes.ok) {
      const profileData = await profileRes.json();
      streakDays    = Number(profileData?.data?.streak_days    ?? 0);
      longestStreak = Number(profileData?.data?.longest_streak ?? 0);
    }
    await loadStepsFromHealth();
  }

  function handleSyncToastHide() {
    showSyncToast = false;
  }

  function onSchrittSyncComplete(result: SyncResult) {
    void refreshDashboardData();
  }

  // ── Load ──────────────────────────────────────────────────────────────────
  onMount(async () => {
    const token = getAccessToken();
    if (!token) {
      goto('/login');
      return;
    }

    const authHeader = { Authorization: `Bearer ${token}` };

    try {
      // 1) User identity + profile
      const [meRes, profileRes] = await Promise.all([
        fetch('/api/me', { headers: authHeader }),
        fetch('/api/profile', { headers: authHeader })
      ]);

      if (!meRes.ok) { goto('/login'); return; }
      const me = await meRes.json();
      userId = me?.data?.id ?? '';
      firstName = me?.data?.first_name ?? '';
      if (!userId) { goto('/login'); return; }

      // Analytics: Re-identify bei Rückkehr-Sessions + Dashboard-View tracken
      identifyUser(userId);
      const firstVisit = !localStorage.getItem('austrofit_dashboard_visited');
      if (firstVisit) localStorage.setItem('austrofit_dashboard_visited', '1');
      track('dashboard_viewed', { first_visit: firstVisit });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        streakDays    = Number(profileData?.data?.streak_days    ?? 0);
        longestStreak = Number(profileData?.data?.longest_streak ?? 0);
      }

      // 2) Punkte + Badge-Quelldaten + Letzte Aktivität parallel
      const [ledgerRes, earnedRes, challengeRes, angebotRes, quizzesRes,
             eduRes, schrittRes, einloeseRes, entriesRes, onboardingRes] = await Promise.all([
        fetch(`/api/ledger-total?${qs({ user: userId })}`),
        fetch(`/api/ledger-total?${qs({ user: userId, positive_only: 'true' })}`),
        fetch(`/api/challenges?${qs({
          'filter[status][_eq]': 'published',
          'filter[aktiv_bis][_gte]': '$NOW',
          fields: 'id,titel,beschreibung,punkte_wert,aktiv_bis',
          limit: '1',
          sort: '-date_created'
        })}`),
        fetch(`/api/angebote?${qs({
          'filter[status][_eq]': 'published',
          'filter[gueltig_bis][_gte]': '$NOW',
          fields: 'id,titel,punkte_kosten,gueltig_bis,partner_id.name,partner_id.kategorie',
          limit: '1',
          sort: '-date_created'
        })}`),
        fetch(`/api/quizzes?${qs({
          'filter[status][_in]': 'published,in_review',
          fields: 'id,article_id.title,article_id.slug',
          limit: '100'
        })}`),
        fetch(`/api/ledger-entries?${qs({ user: userId, source_type: 'education', limit: '1' })}`),
        fetch(`/api/ledger-entries?${qs({ user: userId, source_type: 'schritte',  limit: '1' })}`),
        fetch(`/api/ledger-entries?${qs({ user: userId, source_type: 'einloesung',limit: '1' })}`),
        fetch(`/api/ledger-entries?${qs({ user: userId, limit: '3' })}`),
        fetch(`/api/ledger-entries?${qs({ user: userId, source_type: 'onboarding', limit: '1' })}`)
      ]);

      if (ledgerRes.ok)   totalPoints  = Number((await ledgerRes.json()).total  ?? 0);
      if (earnedRes.ok)   earnedPoints = Number((await earnedRes.json()).total  ?? 0);
      if (challengeRes.ok) {
        const cj = await challengeRes.json();
        challenge = cj?.data?.[0] ?? null;
      }
      if (angebotRes.ok) {
        const aj = await angebotRes.json();
        angebot = aj?.data?.[0] ?? null;
      }
      if (eduRes.ok)      quizPassCount = Number((await eduRes.json()).total    ?? 0);
      if (schrittRes.ok)  hasSchritte   = Number((await schrittRes.json()).total ?? 0) > 0;
      if (einloeseRes.ok) hasEinloesung = Number((await einloeseRes.json()).total ?? 0) > 0;
      if (entriesRes.ok)  recentEntries = (await entriesRes.json()).data ?? [];
      if (onboardingRes.ok) {
        const oj = await onboardingRes.json();
        const onboardingEntry = oj?.data?.[0];
        if (onboardingEntry) {
          const ts = new Date(onboardingEntry.occurred_at ?? onboardingEntry.created_at ?? 0).getTime();
          showOnboardingBadge = Date.now() - ts < 7 * 24 * 60 * 60 * 1000;
        }
      }

      // 3) Offene Quizze
      if (quizzesRes.ok) {
        const quizzesData = await quizzesRes.json();
        const quizzes: any[] = quizzesData?.data ?? [];
        if (quizzes.length > 0) {
          const quizIds = quizzes.map((q: any) => q.id);
          const statusRes = await fetch(`/api/quiz-status?quizIds=${quizIds.join(',')}`, {
            headers: authHeader
          });
          const statusMap: Record<string, any> = statusRes.ok ? await statusRes.json() : {};
          openQuizzes = quizzes
            .filter((q: any) => {
              const s = statusMap[String(q.id)]?.status ?? 'open';
              return s === 'open' || s === 'repeatable';
            })
            .slice(0, 5)
            .map((q: any) => ({
              quizId: q.id,
              title: q.article_id?.title ?? 'Quiz',
              slug: q.article_id?.slug ?? null
            }));
        }
      }
    } catch (e: any) {
      errorMsg = e?.message ?? 'Fehler beim Laden des Dashboards.';
    } finally {
      loading = false;
    }

    if (!browser) return;

    // ── Health / steps logic ──────────────────────────────────────────────
    const testMode = localStorage.getItem('austrofit_test_mode') === 'true';

    if (testMode) {
      showTestMode = true;
    } else {
      const healthCached = localStorage.getItem('austrofit_health_permission');
      if (healthCached === 'granted') {
        loadStepsFromHealth();
      } else if (healthCached !== 'later' && healthCached !== 'denied') {
        showHealthPrompt = true;
      }
    }

    // ── Detect native platform ────────────────────────────────────────────
    try {
      const { Capacitor } = await import('@capacitor/core');
      isNativePlatform = Capacitor.isNativePlatform();
    } catch { /* Capacitor not available in browser */ }

    // ── Trigger A: automatic step sync ───────────────────────────────────
    if (isNativePlatform && !testMode) {
      // Check if service worker requested a background sync
      const hasPending = await checkPendingSyncFlag().catch(() => false);
      if (hasPending) {
        await clearPendingSyncFlag().catch(() => {});
        // Sync only today (SW-triggered, ignores 15-min throttle)
        syncSteps({ days: 1, mode: 'automatic' })
          .then((r) => {
            if (r.punkte_total > 0) { syncToastPunkte = r.punkte_total; showSyncToast = true; }
            if (r.synced > 0) void refreshDashboardData();
          })
          .catch((e) => console.warn('[dashboard] SW-triggered sync failed:', e));
      } else if (shouldSync()) {
        // Regular throttled sync – last 7 days
        syncSteps({ days: 7, mode: 'automatic' })
          .then((r) => {
            if (r.punkte_total > 0) { syncToastPunkte = r.punkte_total; showSyncToast = true; }
            if (r.synced > 0) void refreshDashboardData();
          })
          .catch((e) => console.warn('[dashboard] auto sync failed:', e));
      }
    }
  });

  // ── Health prompt callbacks ───────────────────────────────────────────────

  function onPermissionGranted() {
    showHealthPrompt = false;
    loadStepsFromHealth();
    maybeShowPWABanner();
  }

  function onTestModeSelected() {
    showTestMode = true;
    showHealthPrompt = false;
    maybeShowPWABanner();
  }

  function onHealthDismiss() {
    showHealthPrompt = false;
    maybeShowPWABanner();
  }

  function maybeShowPWABanner() {
    if (browser && !localStorage.getItem('austrofit_pwa_banner_dismissed')) {
      showPWABanner = true;
    }
  }
</script>

<svelte:head><title>Dashboard – AustroFit</title></svelte:head>

<main class="min-h-[calc(100vh-75px)] bg-gray-50 pb-24">
  {#if loading}
    <div class="flex items-center justify-center py-32">
      <div class="flex flex-col items-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600"></div>
        <p class="text-sm text-gray-500">Dashboard wird geladen…</p>
      </div>
    </div>

  {:else if errorMsg}
    <div class="mx-auto max-w-lg px-4 py-16">
      <div class="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        {errorMsg}
      </div>
    </div>

  {:else}

    <!-- ── Page header ───────────────────────────────────────────────────── -->
    <div class="text-white" style="background:#4CAF50;">
      <div class="mx-auto max-w-2xl px-4 pt-8 pb-16">
        <p class="text-sm font-medium opacity-80">
          {new Date().toLocaleDateString('de-AT', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}
        </p>
        <h1 class="mt-1 text-3xl font-bold" style="font-family: 'Jost', sans-serif;">
          {#if firstName}Hallo, {firstName}! 👋{:else}Willkommen! 👋{/if}
        </h1>
        <p class="mt-1 text-sm opacity-80">Bereit, heute aktiv zu werden?</p>
      </div>
    </div>

    <!-- ── Cards (overlap the header) ───────────────────────────────────── -->
    <div class="mx-auto max-w-2xl px-4 -mt-10 flex flex-col gap-4">

      <!-- Punkte & Level card -->
      <div class="rounded-2xl bg-white border border-black/10 shadow-sm p-6">
        <div class="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
          Punkte &amp; Level
        </div>
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-5xl font-bold leading-none" style="font-family: 'Jost', sans-serif; color:#4CAF50;">
              {totalPoints.toLocaleString('de-AT')}
            </div>
            <div class="mt-1 text-sm text-gray-500">
              verfügbare Punkte
              {#if earnedPoints !== totalPoints}
                <span class="text-gray-400">· {earnedPoints.toLocaleString('de-AT')} verdient</span>
              {/if}
            </div>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="font-semibold">Level {levelInfo.current.level}</span>
              <span class="text-sm text-gray-500">{levelInfo.current.name}</span>
            </div>
          </div>

          {#if showOnboardingBadge}
            <div class="shrink-0 rounded-2xl p-4 text-center" style="background:#4CAF501A;">
              <div class="text-2xl font-bold" style="color:#4CAF50;">+{ONBOARDING_POINTS}</div>
              <div class="text-xs font-semibold mt-0.5" style="color:#4CAF50;">Willkommensbonus</div>
            </div>
          {/if}
        </div>

        <div class="mt-4">
          <LevelFortschritt punkte={earnedPoints} />
        </div>

        <div class="mt-4 pt-4 border-t border-black/5">
          <a
            href="/profil/punkte"
            class="text-sm font-medium underline underline-offset-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Punkte-Detail &amp; Badges ansehen →
          </a>
        </div>
      </div>

      <!-- Daily step goal -->
      <div class="rounded-2xl bg-white border border-black/10 shadow-sm p-6">
        <div class="flex items-center justify-between gap-4 mb-3">
          <div>
            <div class="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Tagesziel Schritte
              {#if showTestMode}
                <span class="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-amber-700 normal-case font-semibold">Test</span>
              {/if}
            </div>
            {#if stepsToday >= STEP_GOAL}
              <div class="mt-1 font-semibold text-lg text-emerald-600">
                {stepsToday.toLocaleString('de-AT')} Schritte ✓
              </div>
              {#if bonusSteps > 0}
                <div class="text-xs text-gray-500 mt-0.5">
                  +{bonusSteps.toLocaleString('de-AT')} Bonusschritte · {todayPoints}P heute
                </div>
              {/if}
            {:else}
              <div class="mt-1 font-semibold text-lg">
                {stepsToday.toLocaleString('de-AT')} / {STEP_GOAL.toLocaleString('de-AT')}
              </div>
            {/if}
          </div>
          <div class="text-3xl">👟</div>
        </div>

        <!-- Progress bar -->
        <div class="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            style="width:{stepPercent}%; background:#4CAF50;"
          ></div>
        </div>
        <div class="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>{stepPercent}% erreicht</span>
          <span>
            {#if stepPercent >= 100}
              🎉 Tagesziel erreicht!
            {:else if showTestMode}
              Trage unten deine Schritte ein
            {:else}
              {(STEP_GOAL - stepsToday).toLocaleString('de-AT')} Schritte bis zum Ziel
            {/if}
          </span>
        </div>

        {#if !showTestMode && stepsToday === 0}
          <p class="mt-3 text-xs text-gray-400">
            Schritte werden nach Verbindung mit Google Health Connect / Apple HealthKit
            automatisch synchronisiert.
          </p>
        {/if}

        {#if isNativePlatform && !showTestMode}
          <div class="mt-4 pt-4 border-t border-black/5">
            <SchrittSyncButton onSyncComplete={onSchrittSyncComplete} />
          </div>
        {/if}
      </div>

      <!-- Test mode: manual step entry card -->
      {#if showTestMode}
        <div class="rounded-2xl bg-white border border-amber-200 shadow-sm p-6">
          <ManuelleSchrittEingabe {userId} onSave={refreshDashboardData} />
        </div>
      {/if}

      <!-- Streak -->
      <div class="rounded-2xl bg-white border border-black/10 shadow-sm p-6">
        <div class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Streak</div>
        {#if streakDays > 0}
          <div class="flex items-center gap-3">
            <div class="text-4xl">🔥</div>
            <div>
              <div class="text-2xl font-bold">{streakDays} Tage</div>
              <div class="text-sm text-gray-500">in Folge aktiv – weiter so!</div>
            </div>
          </div>
          {#if longestStreak > 0}
            <div class="mt-3 text-sm text-gray-400">
              Längster Streak: <span class="font-semibold text-gray-600">{longestStreak} Tage</span>
            </div>
          {/if}
        {:else}
          <div class="flex items-center gap-3">
            <div class="text-3xl opacity-30">🔥</div>
            <div>
              <div class="font-semibold text-gray-600">Noch kein aktiver Streak</div>
              <div class="text-sm text-gray-400">Starte heute deinen ersten Tag!</div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Badges -->
      <div class="rounded-2xl bg-white border border-black/10 shadow-sm p-6">
        <div class="mb-3 flex items-center justify-between">
          <div class="text-xs font-semibold uppercase tracking-widest text-gray-400">Deine Badges</div>
          <a href="/profil/punkte#badges" class="text-xs text-gray-500 underline hover:text-gray-700">
            Alle Badges →
          </a>
        </div>
        <div class="grid grid-cols-5 gap-2">
          {#each badges as badge (badge.id)}
            <div class="flex flex-col items-center gap-1 text-center">
              <div
                class="flex h-12 w-12 items-center justify-center rounded-xl text-2xl
                  {badge.earned ? '' : 'opacity-25 grayscale'}"
                style={badge.earned ? 'background:#4CAF501A;' : 'background:#f3f4f6;'}
              >
                {badge.icon}
              </div>
              <div class="text-xs font-medium leading-tight {badge.earned ? '' : 'text-gray-400'}">
                {badge.name}
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Letzte Aktivität -->
      <div class="rounded-2xl bg-white border border-black/10 shadow-sm p-6">
        <div class="mb-1 flex items-center justify-between">
          <div class="text-xs font-semibold uppercase tracking-widest text-gray-400">Letzte Aktivität</div>
          <a href="/profil/punkte" class="text-xs text-gray-500 underline hover:text-gray-700">
            Alle Buchungen →
          </a>
        </div>
        {#if recentEntries.length > 0}
          <div class="divide-y divide-black/5">
            {#each recentEntries as entry (entry.id)}
              <BuchungsZeile buchung={entry} />
            {/each}
          </div>
        {:else}
          <div class="py-6 text-center text-sm text-gray-400">Noch keine Aktivität.</div>
        {/if}
      </div>

      <!-- Offene Quizze -->
      <div class="rounded-2xl bg-white border border-black/10 shadow-sm p-6">
        <div class="flex items-center justify-between mb-3">
          <div class="text-xs font-semibold uppercase tracking-widest text-gray-400">Offene Quizze</div>
          <a href="/gesundheitswegweiser" class="text-xs text-gray-500 underline hover:text-gray-700">
            Alle Artikel →
          </a>
        </div>
        {#if openQuizzes.length > 0}
          <div class="flex flex-col gap-2">
            {#each openQuizzes as q (q.quizId)}
              <a
                href={q.slug ? `/gesundheitswegweiser/${q.slug}` : '/gesundheitswegweiser'}
                class="flex items-center gap-3 rounded-xl border border-black/10 px-3 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <span class="text-base">📖</span>
                <span class="flex-1 min-w-0 truncate">{q.title}</span>
                <span class="shrink-0 text-xs text-gray-400">→</span>
              </a>
            {/each}
          </div>
        {:else}
          <div class="rounded-xl border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
            Alle Quizze erledigt – prima! 🎉
          </div>
        {/if}
      </div>

      <!-- Empfohlene Challenge -->
      <div class="rounded-2xl bg-white border border-black/10 shadow-sm p-6">
        <div class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Challenge des Tages
        </div>

        {#if challenge}
          <div class="flex items-start gap-4">
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl"
              style="background:#4CAF501A;"
            >
              🏆
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold leading-snug">{challenge.titel}</div>
              {#if challenge.beschreibung}
                <div class="mt-1 text-sm text-gray-500 leading-relaxed">
                  {challenge.beschreibung}
                </div>
              {/if}
              <div class="mt-3 flex flex-wrap items-center gap-3">
                {#if challenge.punkte_wert}
                  <span
                    class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                    style="background:#4CAF501A; color:#4CAF50;"
                  >
                    +{challenge.punkte_wert} Punkte
                  </span>
                {/if}
                {#if challenge.aktiv_bis}
                  <span class="text-xs text-gray-400">Bis {formatDate(challenge.aktiv_bis)}</span>
                {/if}
              </div>
            </div>
          </div>
        {:else}
          <div
            class="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400"
          >
            Keine aktive Challenge – schau bald wieder vorbei!
          </div>
        {/if}
      </div>

      <!-- Partner offer preview -->
      <div class="rounded-2xl bg-white border border-black/10 shadow-sm p-6">
        <div class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Partnerangebot
        </div>

        {#if angebot}
          <div class="flex items-start gap-4">
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl"
            >
              🎁
            </div>
            <div class="flex-1 min-w-0">
              {#if angebot.partner_id?.name}
                <div class="text-xs text-gray-400 mb-1">{angebot.partner_id.name}</div>
              {/if}
              <div class="font-semibold leading-snug">{angebot.titel}</div>
              <div class="mt-3 flex flex-wrap items-center gap-3">
                {#if angebot.punkte_kosten}
                  <span
                    class="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700"
                  >
                    {angebot.punkte_kosten} Punkte
                  </span>
                {/if}
                {#if angebot.gueltig_bis}
                  <span class="text-xs text-gray-400">
                    Gültig bis {formatDate(angebot.gueltig_bis)}
                  </span>
                {/if}
              </div>
              <div class="mt-3">
                <a
                  href="/partner"
                  class="text-sm font-medium underline underline-offset-2 text-gray-600 hover:text-gray-900"
                >
                  Alle Angebote ansehen →
                </a>
              </div>
            </div>
          </div>
        {:else}
          <div
            class="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400"
          >
            Noch keine Partnerangebote verfügbar.
          </div>
        {/if}
      </div>

      <!-- Quick links -->
      <div class="grid grid-cols-2 gap-3">
        <a
          href="/gesundheitswegweiser"
          class="rounded-2xl bg-white border border-black/10 shadow-sm p-5 flex flex-col gap-2 hover:shadow-md transition-shadow"
        >
          <div class="text-2xl">📚</div>
          <div class="font-semibold text-sm">Gesundheitswissen</div>
          <div class="text-xs text-gray-500">Artikel lesen &amp; Punkte sammeln</div>
        </a>
        <a
          href="/profil/punkte"
          class="rounded-2xl bg-white border border-black/10 shadow-sm p-5 flex flex-col gap-2 hover:shadow-md transition-shadow"
        >
          <div class="text-2xl">🏅</div>
          <div class="font-semibold text-sm">Punkte &amp; Badges</div>
          <div class="text-xs text-gray-500">Vollständige Historie</div>
        </a>
      </div>

    </div>
  {/if}
</main>

<!-- Overlays (bottom sheet, z-indexed above content) -->
{#if !loading && !errorMsg}
  {#if showHealthPrompt}
    <HealthPermissionPrompt
      {onPermissionGranted}
      {onTestModeSelected}
      onDismiss={onHealthDismiss}
    />
  {:else if showPWABanner}
    <PWAInstallBanner onDismiss={() => (showPWABanner = false)} />
  {/if}
{/if}

<!-- Sync toast (independent of loading state) -->
<SyncToast punkte={syncToastPunkte} show={showSyncToast} onHide={handleSyncToastHide} />
