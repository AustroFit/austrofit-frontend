<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { getValidAccessToken } from '$lib/utils/auth';
  import { track, identifyUser } from '$lib/utils/mixpanel';
  import { calculatePoints } from '$lib/utils/streak';
  import { getBadgeDefs } from '$lib/utils/badges';
  import type { BadgeDef } from '$lib/utils/badges';
  import { qs } from '$lib/utils/qs';
  import LevelFortschritt from '$lib/components/profil/LevelFortschritt.svelte';
  import BuchungsZeile from '$lib/components/profil/BuchungsZeile.svelte';
  import type { LedgerEntry } from '$lib/components/profil/BuchungsZeile.svelte';
  import HealthPermissionPrompt from '$lib/components/dashboard/HealthPermissionPrompt.svelte';
  import PWAInstallBanner from '$lib/components/dashboard/PWAInstallBanner.svelte';
  import SyncToast from '$lib/components/SyncToast.svelte';
  import SchrittSyncButton from '$lib/components/SchrittSyncButton.svelte';
  import ManuelleSchrittEingabe from '$lib/components/dashboard/ManuelleSchrittEingabe.svelte';
  import ManuelleCardioEingabe from '$lib/components/dashboard/ManuelleCardioEingabe.svelte';
  import { syncSteps, shouldSync, checkPendingSyncFlag, clearPendingSyncFlag } from '$lib/services/stepSync';
  import type { SyncResult } from '$lib/services/stepSync';
  import { syncCardio, shouldSyncCardio } from '$lib/services/cardioSync';
  import { formatDateMonthOnly } from '$lib/utils/date';

  // ── State ─────────────────────────────────────────────────────────────────
  let loading = $state(true);
  let errorMsg = $state('');

  // User
  let firstName = $state('');
  let userId = $state('');
  let totalPoints = $state(0);
  let earnedPoints = $state(0);
  let longestStreak = $state(0);

  // Steps / day goal
  let stepsToday = $state(0);
  const STEP_GOAL = 7000;
  const stepPercent = $derived(Math.min(100, Math.round((stepsToday / STEP_GOAL) * 100)));
  const todayPoints = $derived(calculatePoints(stepsToday));
  const bonusSteps = $derived(stepsToday > STEP_GOAL ? stepsToday - STEP_GOAL : 0);

  // Points breakdown
  let bewegungsPunkte = $state(0);
  let quizPunkte = $state(0);

  // Cardio week summary
  let cardioEqMinutes = $state(0);
  let cardioPointsTotal = $state(0);
  let cardioTargets = $state<{ start: number; full: number }>({ start: 50, full: 150 });
  let cardioStreakWeeks = $state(0);
  const cardioPercent = $derived(Math.min(100, Math.round((cardioEqMinutes / cardioTargets.full) * 100)));

  // Streak
  let streakDays = $state(0);
  let quizStreakDays = $state(0);

  // Streak next milestones
  const nextStepMilestone = $derived(Math.ceil((streakDays + 1) / 7) * 7);
  const daysToNextStepBonus = $derived(nextStepMilestone - streakDays);
  const nextQuizMilestone = $derived(Math.ceil((quizStreakDays + 1) / 7) * 7);
  const daysToNextQuizMilestone = $derived(nextQuizMilestone - quizStreakDays);

  // Health
  let healthConnected = $state(false);
  let testMode = $state(false);

  // Badges
  let quizPassCount = $state(0);
  let hasSchritte = $state(false);
  let schrittDays = $state(0);
  let hasEinloesung = $state(false);

  interface DirectusBadge {
    id: number;
    name: string;
    typ: string;
    image_url: string | null;
    earned: boolean;
  }
  let directusBadges = $state<DirectusBadge[]>([]);

  const badges = $derived<BadgeDef[]>(
    getBadgeDefs({ hasSchritte, schrittDays, quizPassCount, longestStreak, earnedPoints, hasEinloesung })
  );

  // Dashboard badges: earned in reverse order (newest milestone first), then first unearned
  // Also includes earned Directus (step-route) badges
  const dashboardBadges = $derived.by(() => {
    const earned = [...badges].filter(b => b.earned).reverse();
    const next = badges.find(b => !b.earned);
    const earnedDirectus = directusBadges.filter(b => b.earned);
    return [
      ...earned,
      ...(next ? [{ ...next, _isNext: true }] : []),
      ...earnedDirectus.map(b => ({ ...b, _isDirectus: true }))
    ];
  });

  // System challenges (onboarding) – only show incomplete ones
  interface SystemChallenge {
    id: string;
    icon: string;
    titel: string;
    beschreibung: string;
    href?: string;
    actionType?: 'health';
  }

  const openSystemChallenges = $derived.by<SystemChallenge[]>(() => {
    const list: SystemChallenge[] = [];
    if (quizPassCount < 1) {
      list.push({
        id: 'first-quiz',
        icon: '📚',
        titel: 'Erstes Quiz absolvieren',
        beschreibung: 'Lerne im Gesundheitswegweiser und sammle erste Punkte',
        href: '/gesundheitswegweiser'
      });
    }
    if (!hasSchritte && showNativeFeatures) {
      list.push({
        id: 'first-steps',
        icon: '🏃',
        titel: 'Erste Schritte tracken',
        beschreibung: 'Zeichne deinen ersten Schritt-Tag auf und verdiene Punkte',
        actionType: 'health'
      });
    }
    if (!hasEinloesung) {
      list.push({
        id: 'first-reward',
        icon: '🎁',
        titel: 'Erste Belohnung einlösen',
        beschreibung: 'Löse eine Belohnung bei einem unserer Partner ein',
        href: '/belohnung'
      });
    }
    return list;
  });

  // Track onboarding completion once all system challenges are done
  let onboardingTracked = false;
  $effect(() => {
    if (!loading && openSystemChallenges.length === 0 && userId && !onboardingTracked) {
      onboardingTracked = true;
      track('onboarding_completed', { user_id: userId });
    }
  });

  // Recent activity
  let recentEntries = $state<LedgerEntry[]>([]);

  // Open quizzes
  interface OpenQuiz {
    quizId: number;
    title: string;
    slug: string | null;
  }
  let openQuizzes = $state<OpenQuiz[]>([]);

  // Challenge (Directus)
  interface Challenge {
    id: number;
    titel: string;
    beschreibung: string | null;
    punkte_wert: number | null;
    aktiv_bis: string | null;
  }
  let challenge = $state<Challenge | null>(null);

  // Overlays / panels
  let showHealthPrompt = $state(false);
  let showPWABanner = $state(false);

  // Sync state
  let showSyncToast = $state(false);
  let syncToastPunkte = $state(0);
  let isNativePlatform = $state(false);
  let devNativeMode = $state(false);
  let cardioTestMode = $state(false);
  // showNativeFeatures: real native OR dev toggle – used for UI only, not sync logic
  const showNativeFeatures = $derived(isNativePlatform || devNativeMode);

  // ── Helpers ───────────────────────────────────────────────────────────────
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
    const token = await getValidAccessToken();
    const authHeader = { Authorization: `Bearer ${token}` };
    const [ledgerRes, earnedRes, entriesRes, profileRes, cardioRes, bewegungRes, quizPunkteRes] = await Promise.all([
      fetch(`/api/ledger-total?${qs({ user: userId })}`, { headers: authHeader }),
      fetch(`/api/ledger-total?${qs({ user: userId, positive_only: 'true' })}`, { headers: authHeader }),
      fetch(`/api/ledger-entries?${qs({ user: userId, limit: '3' })}`, { headers: authHeader }),
      fetch('/api/profile', { headers: authHeader }),
      fetch('/api/cardio/summary', { headers: authHeader }),
      fetch(`/api/ledger-total?${qs({ user: userId, source_types: 'schritte,step,cardio', positive_only: 'true' })}`, { headers: authHeader }),
      fetch(`/api/ledger-total?${qs({ user: userId, source_types: 'education', positive_only: 'true' })}`, { headers: authHeader })
    ]);
    if (ledgerRes.ok) totalPoints = Number((await ledgerRes.json()).total ?? 0);
    if (earnedRes.ok) earnedPoints = Number((await earnedRes.json()).total ?? 0);
    if (entriesRes.ok) recentEntries = (await entriesRes.json()).data ?? [];
    if (profileRes.ok) {
      const profileData = await profileRes.json();
      streakDays     = Number(profileData?.data?.streak_days     ?? 0);
      quizStreakDays = Number(profileData?.data?.quiz_streak_days ?? 0);
      longestStreak  = Number(profileData?.data?.longest_streak  ?? 0);
    }
    if (cardioRes.ok) {
      const cd = await cardioRes.json();
      cardioEqMinutes   = Number(cd.equivalentMinutes ?? 0);
      cardioPointsTotal = Number(cd.pointsTotal ?? 0);
      if (cd.targets) cardioTargets = cd.targets;
      cardioStreakWeeks = Number(cd.consecutiveFullWeeks ?? 0);
    }
    if (bewegungRes.ok) bewegungsPunkte = Number((await bewegungRes.json()).total ?? 0);
    if (quizPunkteRes.ok) quizPunkte = Number((await quizPunkteRes.json()).total ?? 0);
    await loadStepsFromHealth();
  }

  function handleSyncToastHide() {
    showSyncToast = false;
  }

  function onSchrittSyncComplete(_result: SyncResult) {
    void refreshDashboardData();
  }

  // ── Load ──────────────────────────────────────────────────────────────────
  onMount(async () => {
    const token = await getValidAccessToken();
    if (!token) {
      goto('/login');
      return;
    }

    const authHeader = { Authorization: `Bearer ${token}` };

    try {
      // 1) Profil (enthält id + first_name) + quizzes parallel – kein separater /api/me nötig
      const [profileRes, quizzesRes] = await Promise.all([
        fetch('/api/profile', { headers: authHeader }),
        fetch(`/api/quizzes?${qs({
          'filter[status][_in]': 'published,in_review',
          fields: 'id,article_id.title,article_id.slug',
          limit: '100'
        })}`)
      ]);

      if (!profileRes.ok) { goto('/login'); return; }
      const profileData = await profileRes.json();
      userId    = profileData?.data?.id         ?? '';
      firstName = profileData?.data?.first_name ?? '';
      if (!userId) { goto('/login'); return; }

      identifyUser(userId);
      const firstVisit = !localStorage.getItem('austrofit_dashboard_visited');
      if (firstVisit) localStorage.setItem('austrofit_dashboard_visited', '1');
      track('dashboard_viewed', { first_visit: firstVisit });

      streakDays     = Number(profileData?.data?.streak_days     ?? 0);
      quizStreakDays = Number(profileData?.data?.quiz_streak_days ?? 0);
      longestStreak  = Number(profileData?.data?.longest_streak  ?? 0);

      // Quiz-IDs für Status-Batch ermitteln
      const allQuizzes: any[] = quizzesRes.ok ? ((await quizzesRes.json())?.data ?? []) : [];
      const quizIds = allQuizzes.map((q: any) => q.id);

      // 2) Alle user-spezifischen Daten + quiz-status in einem Batch
      const [ledgerRes, earnedRes, challengeRes, quizStatusRes, badgesRes, directusBadgesRes, entriesRes, cardioRes, bewegungRes, quizPunkteRes] = await Promise.all([
        fetch(`/api/ledger-total?${qs({ user: userId })}`, { headers: authHeader }),
        fetch(`/api/ledger-total?${qs({ user: userId, positive_only: 'true' })}`, { headers: authHeader }),
        fetch(`/api/challenges?${qs({
          'filter[status][_eq]': 'published',
          'filter[aktiv_bis][_gte]': '$NOW',
          fields: 'id,titel,beschreibung,punkte_wert,aktiv_bis',
          limit: '1',
          sort: '-aktiv_bis'
        })}`),
        quizIds.length
          ? fetch(`/api/quiz-status?quizIds=${quizIds.join(',')}`, { headers: authHeader })
          : Promise.resolve(null),
        fetch(`/api/badges-summary?${qs({ user: userId })}`, { headers: authHeader }),
        fetch('/api/badges', { headers: authHeader }),
        fetch(`/api/ledger-entries?${qs({ user: userId, limit: '3' })}`, { headers: authHeader }),
        fetch('/api/cardio/summary', { headers: authHeader }),
        fetch(`/api/ledger-total?${qs({ user: userId, source_types: 'schritte,step,cardio', positive_only: 'true' })}`, { headers: authHeader }),
        fetch(`/api/ledger-total?${qs({ user: userId, source_types: 'education', positive_only: 'true' })}`, { headers: authHeader })
      ]);

      if (ledgerRes.ok)  totalPoints  = Number((await ledgerRes.json()).total  ?? 0);
      if (earnedRes.ok)  earnedPoints = Number((await earnedRes.json()).total  ?? 0);
      if (challengeRes.ok) {
        const cj = await challengeRes.json();
        challenge = cj?.data?.[0] ?? null;
      }
      if (badgesRes.ok) {
        const bd = await badgesRes.json();
        quizPassCount = bd.quizPassCount ?? 0;
        hasSchritte   = bd.hasSchritte   ?? false;
        schrittDays   = bd.schrittDays   ?? 0;
        hasEinloesung = bd.hasEinloesung ?? false;
      }
      if (directusBadgesRes.ok) {
        const db = await directusBadgesRes.json();
        directusBadges = db.badges ?? [];
      }
      if (entriesRes.ok) recentEntries = (await entriesRes.json()).data ?? [];
      if (cardioRes.ok) {
        const cd = await cardioRes.json();
        cardioEqMinutes   = Number(cd.equivalentMinutes ?? 0);
        cardioPointsTotal = Number(cd.pointsTotal ?? 0);
        if (cd.targets) cardioTargets = cd.targets;
        cardioStreakWeeks = Number(cd.consecutiveFullWeeks ?? 0);
      }
      if (bewegungRes.ok) bewegungsPunkte = Number((await bewegungRes.json()).total ?? 0);
      if (quizPunkteRes.ok) quizPunkte = Number((await quizPunkteRes.json()).total ?? 0);

      // 3) Offene Quizze aus bereits geladenen Daten zusammensetzen
      if (allQuizzes.length > 0) {
        const statusMap: Record<string, any> = quizStatusRes?.ok ? await quizStatusRes.json() : {};
        openQuizzes = allQuizzes
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
    } catch (e: any) {
      errorMsg = e?.message ?? 'Fehler beim Laden des Dashboards.';
    } finally {
      loading = false;
    }

    if (!browser) return;

    // ── Detect native platform ────────────────────────────────────────────
    try {
      const { Capacitor } = await import('@capacitor/core');
      isNativePlatform = Capacitor.isNativePlatform();
    } catch { /* Capacitor not available in browser */ }

    // ── Dev toggles ───────────────────────────────────────────────────────
    devNativeMode    = localStorage.getItem('austrofit_dev_native')    === 'true';
    cardioTestMode   = localStorage.getItem('austrofit_test_mode_cardio') === 'true';

    // ── Health / steps logic ──────────────────────────────────────────────
    const healthCached = localStorage.getItem('austrofit_health_permission');
    healthConnected = healthCached === 'granted';
    testMode = localStorage.getItem('austrofit_test_mode') === 'true';
    if (healthCached === 'granted') {
      loadStepsFromHealth();
    } else if (isNativePlatform && healthCached !== 'later' && healthCached !== 'denied') {
      showHealthPrompt = true;
    }

    // ── Trigger A: automatic step sync ───────────────────────────────────
    if (isNativePlatform) {
      const hasPending = await checkPendingSyncFlag().catch(() => false);
      if (hasPending) {
        await clearPendingSyncFlag().catch(() => {});
        syncSteps({ days: 1, mode: 'automatic' })
          .then((r) => {
            if (r.punkte_total > 0) { syncToastPunkte = r.punkte_total; showSyncToast = true; }
            if (r.synced > 0) void refreshDashboardData();
          })
          .catch((e) => console.warn('[dashboard] SW-triggered sync failed:', e));
      } else if (shouldSync()) {
        syncSteps({ days: 7, mode: 'automatic' })
          .then((r) => {
            if (r.punkte_total > 0) { syncToastPunkte = r.punkte_total; showSyncToast = true; }
            if (r.synced > 0) void refreshDashboardData();
          })
          .catch((e) => console.warn('[dashboard] auto sync failed:', e));
      }

      // ── Trigger B: cardio sync (parallel, non-blocking) ───────────────
      if (shouldSyncCardio()) {
        syncCardio()
          .then((r) => {
            if (r && r.pointsDelta > 0) {
              syncToastPunkte = (syncToastPunkte ?? 0) + r.pointsDelta;
              showSyncToast = true;
              void refreshDashboardData();
            }
          })
          .catch((e) => console.warn('[dashboard] cardio sync failed:', e));
      }
    }
  });

  // ── Health prompt callbacks ───────────────────────────────────────────────
  function onPermissionGranted() {
    showHealthPrompt = false;
    healthConnected = true;
    loadStepsFromHealth();
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
  {#if errorMsg}
    <div class="mx-auto max-w-lg px-4 py-16">
      <div class="rounded-[var(--radius-card)] border border-error/30 bg-error/5 p-6 text-sm text-error">
        {errorMsg}
      </div>
    </div>

  {:else}

    <!-- ── Page header – sofort sichtbar ────────────────────────────────── -->
    <div class="bg-darkblue text-white">
      <div class="mx-auto max-w-2xl px-4 pt-8 pb-16">
        <div>
          <p class="text-sm font-medium opacity-80">
            {new Date().toLocaleDateString('de-AT', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </p>
          <h1 class="mt-1 text-3xl font-bold font-heading">
            {#if firstName}Servus, {firstName}!{:else}Willkommen!{/if}
          </h1>
          <p class="mt-1 text-sm opacity-80">Bereit, heute aktiv zu werden?</p>
        </div>
      </div>
    </div>

    <!-- ── Cards (overlap the header) ───────────────────────────────────── -->
    <div class="mx-auto max-w-2xl px-4 -mt-10 flex flex-col gap-4">

    {#if loading}
      <!-- Skeleton-Karten während Laden -->
      <div class="rounded-[var(--radius-card)] bg-white border border-black/10 shadow-sm p-6 animate-pulse">
        <div class="h-2.5 w-24 rounded bg-gray-200 mb-4"></div>
        <div class="h-12 w-36 rounded bg-gray-200 mb-2"></div>
        <div class="h-3 w-48 rounded bg-gray-200 mb-5"></div>
        <div class="h-2 w-full rounded-full bg-gray-200"></div>
      </div>
      <div class="rounded-[var(--radius-card)] bg-white border border-black/10 shadow-sm p-6 animate-pulse">
        <div class="h-2.5 w-32 rounded bg-gray-200 mb-4"></div>
        <div class="h-6 w-24 rounded bg-gray-200 mb-3"></div>
        <div class="h-3 w-full rounded-full bg-gray-200"></div>
      </div>
      <div class="rounded-[var(--radius-card)] bg-white border border-black/10 shadow-sm p-6 animate-pulse">
        <div class="h-2.5 w-28 rounded bg-gray-200 mb-4"></div>
        <div class="flex flex-col gap-3">
          <div class="h-14 rounded-xl bg-gray-200"></div>
          <div class="h-14 rounded-xl bg-gray-200"></div>
        </div>
      </div>
      <div class="rounded-[var(--radius-card)] bg-white border border-black/10 shadow-sm p-6 animate-pulse">
        <div class="h-2.5 w-20 rounded bg-gray-200 mb-4"></div>
        <div class="h-16 rounded-xl bg-gray-200"></div>
      </div>

    {:else}

      <!-- 1. Punkte & Level -->
      <div class="rounded-[var(--radius-card)] bg-white border border-black/10 shadow-sm p-6">
        <div class="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
          Punkte &amp; Level
        </div>
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-5xl font-bold leading-none font-heading text-primary">
              {totalPoints.toLocaleString('de-AT')}
            </div>
            <div class="mt-1 text-sm text-gray-500">
              verfügbare Punkte
              {#if earnedPoints !== totalPoints}
                <span class="text-gray-400">· {earnedPoints.toLocaleString('de-AT')} verdient</span>
              {/if}
            </div>
          </div>
          <a
            href="/belohnung"
            class="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
          >
            🎁 Belohnungen
          </a>
        </div>

        <div class="mt-4">
          <LevelFortschritt punkte={earnedPoints} />
        </div>

        {#if bewegungsPunkte > 0 || quizPunkte > 0}
          <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            {#if bewegungsPunkte > 0}
              <span>🏃 Bewegung: <span class="font-semibold text-gray-700">{bewegungsPunkte.toLocaleString('de-AT')}P</span></span>
            {/if}
            {#if quizPunkte > 0}
              <span>📚 Quizze: <span class="font-semibold text-gray-700">{quizPunkte.toLocaleString('de-AT')}P</span></span>
            {/if}
          </div>
        {/if}

        <div class="mt-4 pt-4 border-t border-black/5 flex items-center gap-4">
          <a
            href="/profil/level-roadmap"
            class="text-sm font-medium underline underline-offset-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Level-Roadmap →
          </a>
        </div>
      </div>

      <!-- 2. Tagesziel Schritte -->
      <div class="rounded-[var(--radius-card)] bg-white border border-black/10 shadow-sm p-6">
        <div class="flex items-center justify-between gap-4 mb-3">
          <div class="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Tagesziel Schritte
          </div>
          <div class="text-3xl">👟</div>
        </div>

        {#if testMode}
          <!-- Test mode – manual entry -->
          <ManuelleSchrittEingabe {userId} onSave={refreshDashboardData} />
        {:else if !healthConnected}
          {#if showNativeFeatures}
            <!-- Native: connect to Health Connect -->
            <div class="rounded-xl bg-primary/5 border border-primary/20 p-4">
              <p class="text-sm text-body leading-relaxed mb-3">
                Verbinde dich mit Google Health Connect oder Apple HealthKit, um deine täglichen
                Schritte automatisch zu tracken und Punkte zu verdienen.
              </p>
              <button
                onclick={() => (showHealthPrompt = true)}
                class="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
              >
                👟 Schritt-Tracking verbinden
              </button>
            </div>
          {:else}
            <!-- PWA: coming soon -->
            <div class="rounded-xl bg-gray-50 border border-black/10 p-4">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-sm font-semibold text-heading">Schritt-Tracking</span>
                <span class="rounded-full border border-gray-300 bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">Kommt bald</span>
              </div>
              <p class="text-sm text-gray-500 leading-relaxed">
                Die AustroFit Android App mit automatischem Schritt-Tracking erscheint in Kürze im Play Store.
              </p>
            </div>
          {/if}
        {:else}
          <!-- Health connected – show progress -->
          {#if stepsToday >= STEP_GOAL}
            <div class="font-semibold text-lg text-primary">
              {stepsToday.toLocaleString('de-AT')} Schritte ✓
            </div>
            {#if bonusSteps > 0}
              <div class="text-xs text-gray-500 mt-0.5">
                +{bonusSteps.toLocaleString('de-AT')} Bonusschritte · {todayPoints}P heute
              </div>
            {/if}
          {:else}
            <div class="font-semibold text-lg">
              {stepsToday.toLocaleString('de-AT')} / {STEP_GOAL.toLocaleString('de-AT')}
            </div>
          {/if}

          <!-- Progress bar -->
          <div class="mt-3 h-3 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500 bg-primary"
              style="width:{stepPercent}%;"
            ></div>
          </div>
          <div class="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>{stepPercent}% erreicht</span>
            <span>
              {#if stepPercent >= 100}
                🎉 Tagesziel erreicht!
              {:else}
                {(STEP_GOAL - stepsToday).toLocaleString('de-AT')} Schritte bis zum Ziel
              {/if}
            </span>
          </div>

          {#if showNativeFeatures}
            <div class="mt-4 pt-4 border-t border-black/5">
              <SchrittSyncButton onSyncComplete={onSchrittSyncComplete} />
            </div>
          {/if}
        {/if}
      </div>

      <!-- 3. Wochenziel Bewegung -->
      <div class="rounded-[var(--radius-card)] bg-white border border-black/10 shadow-sm p-6">
        <div class="flex items-center justify-between gap-4 mb-3">
          <div class="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Wochenziel Bewegung
          </div>
          <div class="text-3xl">🏃</div>
        </div>

        {#if cardioTestMode}
          <ManuelleCardioEingabe onSave={refreshDashboardData} />
        {:else if !healthConnected}
          {#if showNativeFeatures}
            <!-- Native: connect to Health Connect -->
            <div class="rounded-xl bg-primary/5 border border-primary/20 p-4">
              <p class="text-sm text-body leading-relaxed mb-3">
                Verbinde Health Connect, um Laufen, Radfahren & Co. zu tracken und Punkte zu verdienen.
              </p>
              <button
                onclick={() => (showHealthPrompt = true)}
                class="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
              >
                🏃 Bewegungs-Tracking verbinden
              </button>
            </div>
          {:else}
            <!-- PWA: coming soon -->
            <div class="rounded-xl bg-gray-50 border border-black/10 p-4">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-sm font-semibold text-heading">Bewegungs-Tracking</span>
                <span class="rounded-full border border-gray-300 bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">Kommt bald</span>
              </div>
              <p class="text-sm text-gray-500 leading-relaxed">
                Die AustroFit Android App mit automatischem Bewegungs-Tracking erscheint in Kürze im Play Store.
              </p>
            </div>
          {/if}
        {:else}
          {#if cardioEqMinutes >= cardioTargets.full}
            <div class="font-semibold text-lg text-primary">
              {cardioEqMinutes} Min. Äquivalent ✓
            </div>
            <div class="text-xs text-gray-500 mt-0.5">
              Wochenziel erreicht · {cardioPointsTotal}P diese Woche
            </div>
          {:else if cardioEqMinutes > 0}
            <div class="font-semibold text-lg">
              {cardioEqMinutes} / {cardioTargets.full} Min.
            </div>
            <div class="text-xs text-gray-500 mt-0.5">
              {cardioPointsTotal > 0 ? `${cardioPointsTotal}P bereits verdient` : `Ab ${cardioTargets.start} Min. gibt es Punkte`}
            </div>
          {:else}
            <div class="font-semibold text-gray-600">Noch keine Aktivität diese Woche</div>
            <div class="text-xs text-gray-400 mt-0.5">
              Ab {cardioTargets.start} Min. moderate Bewegung gibt es Punkte
            </div>
          {/if}

          <!-- Progress bar -->
          <div class="mt-3 h-3 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500 bg-primary"
              style="width:{cardioPercent}%;"
            ></div>
          </div>
          <div class="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>{cardioPercent}% des Wochenziels</span>
            {#if cardioEqMinutes < cardioTargets.full}
              <span>{cardioTargets.full - cardioEqMinutes} Min. bis zum Ziel</span>
            {:else}
              <span>🎉 Wochenziel erreicht!</span>
            {/if}
          </div>
        {/if}
      </div>

      <!-- 4. Aktive Challenges (Hybrid) -->
      <div class="rounded-[var(--radius-card)] bg-white border border-black/10 shadow-sm p-6">
        <div class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Aktive Challenges
        </div>

        {#if openSystemChallenges.length > 0 || challenge}
          <div class="flex flex-col gap-3">
            <!-- System-Challenges (Onboarding) -->
            {#each openSystemChallenges as sc (sc.id)}
              <div class="flex items-start gap-3 rounded-xl border border-black/8 bg-gray-50 px-4 py-3">
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg">
                  {sc.icon}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-semibold text-sm leading-snug">{sc.titel}</div>
                  <div class="text-xs text-gray-500 mt-0.5">{sc.beschreibung}</div>
                </div>
                {#if sc.actionType === 'health'}
                  <button
                    onclick={() => (showHealthPrompt = true)}
                    class="shrink-0 rounded-lg border border-primary/30 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
                  >
                    Verbinden
                  </button>
                {:else if sc.href}
                  <a
                    href={sc.href}
                    class="shrink-0 rounded-lg border border-primary/30 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
                  >
                    Starten →
                  </a>
                {/if}
              </div>
            {/each}

            <!-- Directus-Challenge -->
            {#if challenge}
              <div class="flex items-start gap-3 rounded-xl border border-black/8 bg-gray-50 px-4 py-3">
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-lg">
                  🏆
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-semibold text-sm leading-snug">{challenge.titel}</div>
                  {#if challenge.beschreibung}
                    <div class="text-xs text-gray-500 mt-0.5">{challenge.beschreibung}</div>
                  {/if}
                  <div class="mt-2 flex flex-wrap items-center gap-2">
                    {#if challenge.punkte_wert}
                      <span class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                        +{challenge.punkte_wert} Punkte
                      </span>
                    {/if}
                    {#if challenge.aktiv_bis}
                      <span class="text-xs text-gray-400">bis {formatDateMonthOnly(challenge.aktiv_bis)}</span>
                    {/if}
                  </div>
                </div>
              </div>
            {/if}
          </div>
        {:else}
          <div class="rounded-xl border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
            Alle Challenges erledigt – großartig! 🎉
          </div>
        {/if}
      </div>

      <!-- 4. Streak (2 Reihen) -->
      <div class="rounded-[var(--radius-card)] bg-white border border-black/10 shadow-sm p-6">
        <div class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Streak</div>
        <div class="flex flex-col gap-4">

          <!-- Schritte-Streak (nur Native App) -->
          {#if showNativeFeatures}
            <div class="flex items-center gap-3">
              <div class="text-3xl {streakDays > 0 ? '' : 'opacity-25'}">🔥</div>
              <div class="flex-1">
                <div class="text-xs font-medium text-gray-400 mb-0.5">Schritte-Streak</div>
                {#if streakDays > 0}
                  <div class="text-xl font-bold">{streakDays} {streakDays === 1 ? 'Tag' : 'Tage'} in Folge</div>
                  <div class="mt-0.5 text-xs text-gray-500">
                    Noch {daysToNextStepBonus} {daysToNextStepBonus === 1 ? 'Tag' : 'Tage'} bis +60P Bonus
                  </div>
                {:else}
                  <div class="font-semibold text-gray-600">Noch kein aktiver Streak</div>
                  <div class="text-xs text-gray-400">Erreich heute 4.000 Schritte!</div>
                {/if}
              </div>
            </div>

            <div class="border-t border-black/5"></div>

            <!-- Cardio-Wochen-Streak -->
            <div class="flex items-center gap-3">
              <div class="text-3xl {cardioStreakWeeks > 0 ? '' : 'opacity-25'}">🏃</div>
              <div class="flex-1">
                <div class="text-xs font-medium text-gray-400 mb-0.5">Cardio-Streak</div>
                {#if cardioStreakWeeks >= 2}
                  <div class="text-xl font-bold">{cardioStreakWeeks} Wochen in Folge</div>
                  <div class="mt-0.5 text-xs text-gray-500">
                    {cardioStreakWeeks === 2 ? '+100P Bonus erhalten!' : cardioStreakWeeks >= 4 ? '+300P Bonus erhalten!' : `Noch ${4 - cardioStreakWeeks} Wochen bis +300P`}
                  </div>
                {:else if cardioStreakWeeks === 1}
                  <div class="text-xl font-bold">1 Woche</div>
                  <div class="mt-0.5 text-xs text-gray-500">Noch 1 weitere Woche bis +100P Bonus</div>
                {:else}
                  <div class="font-semibold text-gray-600">Noch kein aktiver Streak</div>
                  <div class="text-xs text-gray-400">Erreiche ≥200P Cardio in einer Woche!</div>
                {/if}
              </div>
            </div>

            <div class="border-t border-black/5"></div>
          {/if}

          <!-- Quiz-Streak -->
          <div class="flex items-center gap-3">
            <div class="text-3xl {quizStreakDays > 0 ? '' : 'opacity-25'}">📚</div>
            <div class="flex-1">
              <div class="text-xs font-medium text-gray-400 mb-0.5">Quiz-Streak</div>
              {#if quizStreakDays > 0}
                <div class="text-xl font-bold">{quizStreakDays} {quizStreakDays === 1 ? 'Tag' : 'Tage'} in Folge</div>
                <div class="mt-0.5 text-xs text-gray-500">
                  Noch {daysToNextQuizMilestone} {daysToNextQuizMilestone === 1 ? 'Tag' : 'Tage'} bis zum nächsten Meilenstein
                </div>
              {:else}
                <div class="font-semibold text-gray-600">Noch kein aktiver Streak</div>
                <div class="text-xs text-gray-400">Mache heute ein Quiz!</div>
              {/if}
            </div>
          </div>

        </div>

        {#if showNativeFeatures && longestStreak > 0}
          <div class="mt-4 pt-4 border-t border-black/5 text-sm text-gray-400">
            Längster Schritte-Streak: <span class="font-semibold text-gray-600">{longestStreak} Tage</span>
          </div>
        {/if}
      </div>

      <!-- 5. Auszeichnungen (1 Reihe) -->
      <div class="rounded-[var(--radius-card)] bg-white border border-black/10 shadow-sm p-6">
        <div class="mb-3 flex items-center justify-between">
          <div class="text-xs font-semibold uppercase tracking-widest text-gray-400">Auszeichnungen</div>
          <a href="/profil/auszeichnungen" class="text-xs text-gray-500 underline hover:text-gray-700">
            alle anzeigen →
          </a>
        </div>
        {#if dashboardBadges.length === 0}
          <div class="py-4 text-center text-sm text-gray-400">Noch keine Auszeichnungen.</div>
        {:else}
          <div class="flex gap-2.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
            {#each dashboardBadges as badge (('_isDirectus' in badge ? 'd' : 'l') + badge.id)}
              <div class="flex w-[4.5rem] shrink-0 flex-col items-center gap-1 text-center">
                {#if '_isDirectus' in badge && badge.image_url}
                  <img src={badge.image_url} alt={badge.name} class="h-12 w-12 rounded-xl object-contain" />
                {:else if '_isDirectus' in badge}
                  <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-xl">🏅</div>
                {:else}
                  <div
                    class="flex h-12 w-12 items-center justify-center rounded-xl text-2xl
                      {badge.earned ? 'bg-primary/10' : 'bg-gray-100 opacity-40 grayscale'}"
                  >
                    {badge.icon}
                  </div>
                {/if}
                <div class="text-[10px] font-medium leading-tight {'_isNext' in badge && badge._isNext ? 'text-gray-400' : ''}">
                  {'_isNext' in badge && badge._isNext ? 'Nächstes Ziel' : badge.name}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- 6. Offene Quizze -->
      <div class="rounded-[var(--radius-card)] bg-white border border-black/10 shadow-sm p-6">
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

      <!-- 7. Letzte Aktivität (ganz unten) -->
      <div class="rounded-[var(--radius-card)] bg-white border border-black/10 shadow-sm p-6">
        <div class="mb-1 flex items-center justify-between">
          <div class="text-xs font-semibold uppercase tracking-widest text-gray-400">Letzte Aktivität</div>
          <a href="/profil/aktivitaeten" class="text-xs text-gray-500 underline hover:text-gray-700">
            Alle Aktivitäten →
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

    {/if}
    </div>
  {/if}
</main>

<!-- Overlays -->
{#if !loading && !errorMsg}
  {#if showHealthPrompt}
    <HealthPermissionPrompt
      {onPermissionGranted}
      onDismiss={onHealthDismiss}
    />
  {:else if showPWABanner}
    <PWAInstallBanner onDismiss={() => (showPWABanner = false)} />
  {/if}
{/if}

<!-- Sync toast -->
<SyncToast punkte={syncToastPunkte} show={showSyncToast} onHide={handleSyncToastHide} />
