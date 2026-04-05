<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { getValidAccessToken } from '$lib/utils/auth';
  import { track, identifyUser } from '$lib/utils/mixpanel';
  import { calculatePoints } from '$lib/utils/streak';
  import { qs } from '$lib/utils/qs';
  import LevelFortschritt from '$lib/components/profil/LevelFortschritt.svelte';
  import BuchungsZeile from '$lib/components/profil/BuchungsZeile.svelte';
  import type { LedgerEntry } from '$lib/components/profil/BuchungsZeile.svelte';
  import HealthPermissionPrompt from '$lib/components/dashboard/HealthPermissionPrompt.svelte';
  import PWAInstallBanner from '$lib/components/dashboard/PWAInstallBanner.svelte';
  import SyncToast from '$lib/components/SyncToast.svelte';
  import ManuelleSchrittEingabe from '$lib/components/dashboard/ManuelleSchrittEingabe.svelte';
  import ManuelleCardioEingabe from '$lib/components/dashboard/ManuelleCardioEingabe.svelte';
  import BadgeUnlockOverlay from '$lib/components/dashboard/BadgeUnlockOverlay.svelte';
  import OnboardingChecklist from '$lib/components/dashboard/OnboardingChecklist.svelte';
  import CircleRing from '$lib/components/CircleRing.svelte';
  import { syncSteps, shouldSync, checkPendingSyncFlag, clearPendingSyncFlag } from '$lib/services/stepSync';
  import { syncCardio, shouldSyncCardio } from '$lib/services/cardioSync';
  import { formatDateMonthOnly, getISOWeekDates, formatCardDateLabel, toLocalDateString, isValidDateString } from '$lib/utils/date';
  import { apiUrl } from '$lib/utils/api';
  import { lapDisplayPercent, lapTailwindBg } from '$lib/utils/progress';

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
  const STEP_WEEK_GOAL = 7 * STEP_GOAL; // 49000
  let stepView = $state<'tag' | 'woche'>('tag');
  const todayPoints = $derived(calculatePoints(stepsToday));

  // Points breakdown
  let quizPunkte = $state(0);

  // Cardio week summary
  let cardioEqMinutes = $state(0);
  let cardioPointsTotal = $state(0);
  let cardioTargets = $state<{ start: number; full: number }>({ start: 50, full: 150 });
  let cardioStreakWeeks = $state(0);
  const cardioPercent = $derived(Math.round((cardioEqMinutes / (cardioTargets.full || 1)) * 100));
  const cardioDisplayPercent = $derived(lapDisplayPercent(cardioPercent));
  const cardioBarColor = $derived(lapTailwindBg(cardioPercent));
  const dailyCardioGoal = $derived(Math.round(cardioTargets.full / 7)); // ≈21 min for full=150

  const todayStr = toLocalDateString();

  // Weekly cardio data (current ISO week, per day)
  interface DayCardioData { date: string; minutes: number; }
  let weeklyCardioData = $state<DayCardioData[]>([]);
  let cardioView = $state<'tag' | 'woche'>('woche');
  const todayCardioMinutes = $derived(weeklyCardioData.find(d => d.date === todayStr)?.minutes ?? 0);
  const cardioViewEqMinutes = $derived(cardioView === 'woche' ? cardioEqMinutes : todayCardioMinutes);
  const cardioViewGoal = $derived(cardioView === 'woche' ? cardioTargets.full : dailyCardioGoal);
  const cardioViewPercent = $derived(Math.round((cardioViewEqMinutes / (cardioViewGoal || 1)) * 100));
  const cardioViewDisplayPercent = $derived(lapDisplayPercent(cardioViewPercent));
  const cardioViewBarColor = $derived(lapTailwindBg(cardioViewPercent));

  // Streak
  let streakDays = $state(0);
  let quizStreakDays = $state(0);

  // Weekly step data (current ISO week)
  interface DayStepData { date: string; points: number; steps?: number; }
  let weeklyStepData = $state<DayStepData[]>([]);
  const weeklyStepsTotal = $derived(weeklyStepData.reduce((sum, d) => sum + (d.steps ?? 0), 0));
  const stepPercent = $derived(
    stepView === 'tag'
      ? Math.round((stepsToday / STEP_GOAL) * 100)
      : Math.round((weeklyStepsTotal / STEP_WEEK_GOAL) * 100)
  );
  const stepDisplayPercent = $derived(lapDisplayPercent(stepPercent));
  const stepBarColor = $derived(lapTailwindBg(stepPercent));
  const weekDates = getISOWeekDates();
  const WEEK_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const;

  // Streak next milestones
  const nextStepMilestone = $derived(Math.ceil((streakDays + 1) / 7) * 7);
  const daysToNextStepBonus = $derived(nextStepMilestone - streakDays);
  const nextQuizMilestone = $derived(Math.ceil((quizStreakDays + 1) / 7) * 7);
  const daysToNextQuizMilestone = $derived(nextQuizMilestone - quizStreakDays);

  // Health
  let healthConnected = $state(false);
  let showChecklist = $state(false);
  let testMode = $state(false);

  // Badges
  let quizPassCount = $state(0);
  let hasSchritte = $state(false);
  let hasEinloesung = $state(false);

  interface DirectusBadge {
    id: number;
    name: string;
    description: string;
    typ: string;
    step_threshold: number;
    image_url: string | null;
    earned: boolean;
    earned_at: string | null;
    new_unlock: boolean;
  }
  let directusBadges = $state<DirectusBadge[]>([]);

  // Newly unlocked badges → shown in overlay
  let newlyUnlockedBadges = $state<DirectusBadge[]>([]);

  // Earned badges sorted by threshold desc (highest = most recently unlocked), then first unearned
  const dashboardBadges = $derived.by(() => {
    const earned = directusBadges.filter(b => b.earned).sort((a, b) => b.step_threshold - a.step_threshold);
    const next = directusBadges.find(b => !b.earned);
    return [...earned, ...(next ? [{ ...next, _isNext: true }] : [])];
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

  // Haptic feedback when points toast appears (native only)
  $effect(() => {
    if (showSyncToast && isNativePlatform) {
      import('@capacitor/haptics').then(({ Haptics, ImpactStyle }) => {
        Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
      }).catch(() => {});
    }
  });

  // Pull-to-refresh
  let pullRefreshing = $state(false);
  let pullOffset = $state(0);
  let _pullStartY = 0;
  let _pullStartScrollY = 0;
  const PULL_THRESHOLD = 60;

  function onTouchStart(e: TouchEvent) {
    _pullStartY = e.touches[0].clientY;
    _pullStartScrollY = window.scrollY;
  }

  function onTouchMove(e: TouchEvent) {
    if (_pullStartScrollY > 5 || pullRefreshing) return;
    const delta = e.touches[0].clientY - _pullStartY;
    if (delta > 0) {
      e.preventDefault(); // verhindert natives Overscroll
      pullOffset = Math.min(80, delta * 0.4);
    }
  }

  async function onTouchEnd() {
    if (pullOffset >= PULL_THRESHOLD * 0.7 && !pullRefreshing) {
      pullOffset = 0;
      pullRefreshing = true;
      try {
        if (isNativePlatform) {
          await Promise.all([
            syncSteps({ days: 7, mode: 'automatic' })
              .then(r => { if (r.punkte_total > 0) { syncToastPunkte = r.punkte_total; showSyncToast = true; } })
              .catch(() => {}),
            syncCardio().catch(() => {})
          ]);
        }
        await refreshDashboardData();
      } finally {
        pullRefreshing = false;
      }
    } else {
      pullOffset = 0;
    }
  }
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
    const [ledgerRes, earnedRes, entriesRes, profileRes, cardioRes, weeklyStepsRes, quizPunkteRes] = await Promise.all([
      fetch(apiUrl(`/api/ledger-total?${qs({ user: userId })}`), { headers: authHeader }),
      fetch(apiUrl(`/api/ledger-total?${qs({ user: userId, positive_only: 'true' })}`), { headers: authHeader }),
      fetch(apiUrl(`/api/ledger-entries?${qs({ user: userId, limit: '3' })}`), { headers: authHeader }),
      fetch(apiUrl('/api/profile'), { headers: authHeader }),
      fetch(apiUrl('/api/cardio/summary'), { headers: authHeader }),
      fetch(apiUrl(`/api/ledger-entries?${qs({ user: userId, source_types: 'schritte,step', occurred_at_from: `${weekDates[0]}T00:00:00`, occurred_at_to: `${weekDates[6]}T23:59:59`, limit: '14' })}`), { headers: authHeader }),
      fetch(apiUrl(`/api/ledger-total?${qs({ user: userId, source_types: 'education', positive_only: 'true' })}`), { headers: authHeader })
    ]);
    if (ledgerRes.ok) totalPoints = Number((await ledgerRes.json()).total ?? 0);
    if (earnedRes.ok) earnedPoints = Number((await earnedRes.json()).total ?? 0);
    if (entriesRes.ok) recentEntries = (await entriesRes.json()).data ?? [];
    if (profileRes.ok) {
      const profileData = await profileRes.json();
      streakDays     = Number(profileData?.data?.streak_days     ?? 0);
      quizStreakDays = Number(profileData?.data?.quiz_streak_days ?? 0);
      longestStreak  = Number(profileData?.data?.longest_streak  ?? 0);
      showChecklist  = !profileData?.data?.onboarding_checklist_completed_at;
    }
    if (cardioRes.ok) {
      const cd = await cardioRes.json();
      cardioEqMinutes   = Number(cd.equivalentMinutes ?? 0);
      cardioPointsTotal = Number(cd.pointsTotal ?? 0);
      if (cd.targets) cardioTargets = cd.targets;
      cardioStreakWeeks = Number(cd.consecutiveFullWeeks ?? 0);
      if (cd.dailyMinutes) {
        weeklyCardioData = weekDates.map((date: string) => ({
          date,
          minutes: (cd.dailyMinutes as {date: string; minutes: number}[]).find(d => d.date === date)?.minutes ?? 0
        }));
      }
    }
    if (weeklyStepsRes.ok) {
      const ws = await weeklyStepsRes.json();
      const byDate: Record<string, { points: number; steps: number }> = {};
      for (const e of (ws.data ?? [])) {
        const d = String(e.source_ref ?? '');
        if (isValidDateString(d)) {
          if (!byDate[d]) byDate[d] = { points: 0, steps: 0 };
          byDate[d].points += e.points_delta ?? 0;
          byDate[d].steps += Number(e.meta?.steps ?? 0);
        }
      }
      weeklyStepData = weekDates.map((date: string) => ({
        date,
        points: byDate[date]?.points ?? 0,
        steps: byDate[date]?.steps ?? 0
      }));
    }
    if (quizPunkteRes.ok) quizPunkte = Number((await quizPunkteRes.json()).total ?? 0);

    // Reload badges – new_unlock-Flag kommt vom Server (user_earned_badges.shown_at=null)
    const badgesRefresh = await fetch(apiUrl('/api/badges'), { headers: authHeader });
    if (badgesRefresh.ok) {
      const db = await badgesRefresh.json();
      const freshBadges: DirectusBadge[] = db.badges ?? [];
      newlyUnlockedBadges = freshBadges.filter(b => b.new_unlock);
      directusBadges = freshBadges;
    }

    await loadStepsFromHealth();
  }

  function handleSyncToastHide() {
    showSyncToast = false;
  }

  async function handleBadgeDismissAll() {
    const ids = newlyUnlockedBadges.map(b => b.id);
    newlyUnlockedBadges = [];
    if (ids.length === 0) return;
    const token = await getValidAccessToken().catch(() => null);
    if (!token) return;
    fetch(apiUrl('/api/badges'), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ badge_ids: ids })
    }).catch(() => { /* non-critical */ });
  }

  // ── Pull-to-Refresh: non-passive touch listener (e.preventDefault() nötig) ──
  $effect(() => {
    if (!browser) return;
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  });

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
        fetch(apiUrl('/api/profile'), { headers: authHeader }),
        fetch(apiUrl(`/api/quizzes?${qs({
          'filter[status][_in]': 'published,in_review',
          fields: 'id,article_id.title,article_id.slug',
          limit: '100'
        })}`))
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
      showChecklist  = !profileData?.data?.onboarding_checklist_completed_at;

      // Quiz-IDs für Status-Batch ermitteln
      const allQuizzes: any[] = quizzesRes.ok ? ((await quizzesRes.json())?.data ?? []) : [];
      const quizIds = allQuizzes.map((q: any) => q.id);

      // 2) Alle user-spezifischen Daten + quiz-status in einem Batch
      const [ledgerRes, earnedRes, challengeRes, quizStatusRes, badgesRes, directusBadgesRes, entriesRes, cardioRes, weeklyStepsRes2, quizPunkteRes] = await Promise.all([
        fetch(apiUrl(`/api/ledger-total?${qs({ user: userId })}`), { headers: authHeader }),
        fetch(apiUrl(`/api/ledger-total?${qs({ user: userId, positive_only: 'true' })}`), { headers: authHeader }),
        fetch(apiUrl(`/api/challenges?${qs({
          'filter[status][_eq]': 'published',
          'filter[aktiv_bis][_gte]': '$NOW',
          fields: 'id,titel,beschreibung,punkte_wert,aktiv_bis',
          limit: '1',
          sort: '-aktiv_bis'
        })}`)),
        quizIds.length
          ? fetch(apiUrl(`/api/quiz-status?quizIds=${quizIds.join(',')}`), { headers: authHeader })
          : Promise.resolve(null),
        fetch(apiUrl(`/api/badges-summary?${qs({ user: userId })}`), { headers: authHeader }),
        fetch(apiUrl('/api/badges'), { headers: authHeader }),
        fetch(apiUrl(`/api/ledger-entries?${qs({ user: userId, limit: '3' })}`), { headers: authHeader }),
        fetch(apiUrl('/api/cardio/summary'), { headers: authHeader }),
        fetch(apiUrl(`/api/ledger-entries?${qs({ user: userId, source_types: 'schritte,step', occurred_at_from: `${weekDates[0]}T00:00:00`, occurred_at_to: `${weekDates[6]}T23:59:59`, limit: '14' })}`), { headers: authHeader }),
        fetch(apiUrl(`/api/ledger-total?${qs({ user: userId, source_types: 'education', positive_only: 'true' })}`), { headers: authHeader })
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
        if (cd.dailyMinutes) {
          weeklyCardioData = weekDates.map((date: string) => ({
            date,
            minutes: (cd.dailyMinutes as {date: string; minutes: number}[]).find(d => d.date === date)?.minutes ?? 0
          }));
        }
      }
      if (weeklyStepsRes2?.ok) {
        const ws2 = await weeklyStepsRes2.json();
        const byDate2: Record<string, { points: number; steps: number }> = {};
        for (const e of (ws2.data ?? [])) {
          const d = String(e.source_ref ?? '');
          if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
            if (!byDate2[d]) byDate2[d] = { points: 0, steps: 0 };
            byDate2[d].points += e.points_delta ?? 0;
            byDate2[d].steps += Number(e.meta?.steps ?? 0);
          }
        }
        weeklyStepData = weekDates.map((date: string) => ({
          date,
          points: byDate2[date]?.points ?? 0,
          steps: byDate2[date]?.steps ?? 0
        }));
      }
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

<!-- Pull-to-refresh indicator -->
{#if pullOffset > 0 || pullRefreshing}
  <div
    class="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm transition-all duration-150"
    style="height: {pullRefreshing ? 48 : pullOffset}px; opacity: {pullRefreshing ? 1 : Math.min(1, pullOffset / 40)};"
  >
    {#if pullRefreshing}
      <span class="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
    {:else}
      <span class="text-gray-400 text-base" style="display:block; transform: rotate({Math.min(180, pullOffset * 2.5)}deg);">↓</span>
    {/if}
  </div>
{/if}

{#if newlyUnlockedBadges.length > 0}
  <BadgeUnlockOverlay
    badges={newlyUnlockedBadges}
    onDismissAll={handleBadgeDismissAll}
  />
{/if}

<main
  class="min-h-[calc(100vh-75px)] bg-gray-50 pb-24"
  style="overscroll-behavior-y: contain;"
>
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
          <h1 class="text-3xl font-bold font-heading">
            {#if firstName}Servas, {firstName}!{:else}Servas!{/if}
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

      <!-- Onboarding-Checkliste (nur wenn noch nicht geschlossen) -->
      {#if showChecklist}
        <OnboardingChecklist
          {healthConnected}
          hasCompletedFirstQuiz={quizPunkte > 0}
          {streakDays}
          onDismiss={() => (showChecklist = false)}
        />
      {/if}

      <!-- 1. Schritte -->
      <div class="rounded-[var(--radius-card)] bg-white border border-black/10 shadow-sm p-5">
        <!-- Header -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-1.5">
            <span class="text-lg">👟</span>
            <span class="text-xs font-semibold uppercase tracking-widest text-gray-400">Schritte</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex rounded-lg border border-black/10 overflow-hidden text-[11px] font-semibold">
              <button onclick={() => stepView = 'tag'} class="px-2 py-0.5 transition-colors {stepView === 'tag' ? 'bg-primary text-white' : 'text-gray-400 hover:text-primary'}">Tag</button>
              <button onclick={() => stepView = 'woche'} class="px-2 py-0.5 transition-colors {stepView === 'woche' ? 'bg-primary text-white' : 'text-gray-400 hover:text-primary'}">Woche</button>
            </div>
            <a href="/schritte" class="text-xs font-medium text-gray-400 hover:text-primary transition-colors">
              {formatCardDateLabel()} →
            </a>
          </div>
        </div>

        {#if testMode}
          <ManuelleSchrittEingabe {userId} onSave={refreshDashboardData} />
        {:else if healthConnected}
          <!-- Schritte + Ziel -->
          <div class="flex items-baseline justify-between gap-2 mb-2">
            <div class="text-3xl font-bold font-heading text-secondary">{todayPoints}P</div>
            <div class="text-2xl font-bold font-heading text-heading">
              {#if stepView === 'tag'}
                {stepsToday.toLocaleString('de-AT')} / {STEP_GOAL.toLocaleString('de-AT')}
              {:else}
                {weeklyStepsTotal.toLocaleString('de-AT')} / {STEP_WEEK_GOAL.toLocaleString('de-AT')}
              {/if}
            </div>
          </div>
          <div class="relative h-3.5 w-full rounded-full bg-gray-100 overflow-hidden mb-2">
            <div class="absolute inset-y-0 left-0 {stepBarColor} rounded-full transition-all duration-500" style="width:{stepDisplayPercent}%;"></div>
          </div>
          {#if stepView === 'tag'}
            {#if stepsToday >= STEP_GOAL}
              <p class="mb-4 text-xs font-medium text-primary">🎉 Tagesziel erreicht!</p>
            {:else}
              <p class="mb-4 text-xs text-body/60">Noch {(STEP_GOAL - stepsToday).toLocaleString('de-AT')} Schritte bis zum Tagesziel</p>
            {/if}
          {:else}
            {#if weeklyStepsTotal >= STEP_WEEK_GOAL}
              <p class="mb-4 text-xs font-medium text-primary">🎉 Wochenziel erreicht!</p>
            {:else}
              <p class="mb-4 text-xs text-body/60">Noch {(STEP_WEEK_GOAL - weeklyStepsTotal).toLocaleString('de-AT')} Schritte bis zum Wochenziel</p>
            {/if}
          {/if}
        {:else if showNativeFeatures}
          <div class="mb-4 rounded-xl bg-primary/5 border border-primary/20 p-3 flex items-center gap-3">
            <p class="flex-1 text-sm text-body leading-snug">
              Verbinde Health Connect, um Schritte zu tracken und Punkte zu verdienen.
            </p>
            <button
              onclick={() => (showHealthPrompt = true)}
              class="shrink-0 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-dark transition-colors"
            >
              Verbinden
            </button>
          </div>
        {/if}

        <!-- Wochenkreise (immer sichtbar) -->
        <div class="grid grid-cols-7 gap-0.5">
          {#each weekDates as date, i}
            {@const dayData = weeklyStepData.find(d => d.date === date)}
            {@const pts = dayData?.points ?? 0}
            {@const isToday = date === todayStr}
            {@const ringPercent = isToday
              ? Math.round((stepsToday / STEP_GOAL) * 100)
              : Math.round((pts / 40) * 100)}
            <div class="flex flex-col items-center gap-0.5">
              <span class="text-[10px] text-gray-400 font-medium">{WEEK_LABELS[i]}</span>
              <CircleRing
                percent={ringPercent}
                {isToday}
                ariaLabel="{WEEK_LABELS[i]}: {isToday ? stepsToday.toLocaleString('de-AT') : (weeklyStepData.find(d => d.date === date)?.steps ?? 0).toLocaleString('de-AT')} von {STEP_GOAL.toLocaleString('de-AT')} Schritten ({ringPercent}%)"
              />
            </div>
          {/each}
        </div>

      </div>

      <!-- 2. Punkte & Level -->
      <div class="rounded-[var(--radius-card)] bg-white border border-black/10 shadow-sm p-6">
        <div class="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
          Punkte &amp; Level
        </div>
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-5xl font-bold leading-none font-heading text-secondary" aria-live="polite" aria-atomic="true">
              {totalPoints.toLocaleString('de-AT')}
            </div>
            <div class="mt-1 text-sm text-gray-500">
              verfügbare Punkte
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

        <div class="mt-4 pt-4 border-t border-black/5 flex items-center gap-4">
          <a
            href="/profil/level-roadmap"
            class="text-sm font-medium underline underline-offset-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Level-Roadmap →
          </a>
        </div>
      </div>

      <!-- 3. Streak -->
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
                <div class="text-xs font-medium text-gray-400 mb-0.5">Bewegungs-Streak</div>
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

      <!-- 4. Bewegung (Accordion, default eingeklappt) -->
      <details class="group rounded-[var(--radius-card)] bg-white border border-black/10 shadow-sm">
        <summary class="flex cursor-pointer list-none items-center justify-between p-5 select-none">
          <div class="flex items-center gap-1.5">
            <span class="text-lg">🏃</span>
            <span class="text-xs font-semibold uppercase tracking-widest text-gray-400">Bewegung</span>
            {#if healthConnected && cardioPointsTotal > 0}
              <span class="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-semibold text-secondary">{cardioPointsTotal}P</span>
            {/if}
          </div>
          <div class="flex items-center gap-2">
            {#if healthConnected}
              <a href="/bewegung" class="text-xs font-medium text-gray-400 hover:text-primary transition-colors" onclick={(e) => e.stopPropagation()}>
                {formatCardDateLabel()} →
              </a>
            {/if}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
              class="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180">
              <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
            </svg>
          </div>
        </summary>

        <div class="px-5 pb-5">
          {#if cardioTestMode}
            <ManuelleCardioEingabe onSave={refreshDashboardData} />
          {:else if !healthConnected}
            {#if showNativeFeatures}
              <!-- Native: connect to Health Connect -->
              <div class="rounded-xl bg-primary/5 border border-primary/20 p-3 flex items-center gap-3">
                <p class="flex-1 text-sm text-body leading-snug">
                  Verbinde Health Connect, um Laufen, Radfahren & Co. zu tracken und Punkte zu verdienen.
                </p>
                <button
                  onclick={() => (showHealthPrompt = true)}
                  class="shrink-0 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-dark transition-colors"
                >
                  Verbinden
                </button>
              </div>
            {:else}
              <!-- Web: Teaser -->
              <div class="rounded-xl bg-gray-50 border border-black/10 p-4 flex items-start gap-3">
                <span class="text-2xl">📱</span>
                <div>
                  <p class="text-sm font-semibold text-heading">Automatisches Bewegungs-Tracking</p>
                  <p class="mt-0.5 text-sm text-gray-500 leading-relaxed">
                    Mit der AustroFit App auf Android verbindest du Health Connect und sammelst Punkte für Laufen, Radfahren & Co.
                  </p>
                </div>
              </div>
            {/if}
          {:else}
            <!-- Minuten + Ziel -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex rounded-lg border border-black/10 overflow-hidden text-[11px] font-semibold">
                <button onclick={() => cardioView = 'tag'} class="px-2 py-0.5 transition-colors {cardioView === 'tag' ? 'bg-primary text-white' : 'text-gray-400 hover:text-primary'}">Tag</button>
                <button onclick={() => cardioView = 'woche'} class="px-2 py-0.5 transition-colors {cardioView === 'woche' ? 'bg-primary text-white' : 'text-gray-400 hover:text-primary'}">Woche</button>
              </div>
            </div>
            <div class="flex items-baseline justify-between gap-2 mb-2">
              <div class="text-3xl font-bold font-heading text-secondary">{cardioPointsTotal > 0 ? `${cardioPointsTotal}P` : '0P'}</div>
              <div class="text-2xl font-bold font-heading text-heading">
                {cardioViewEqMinutes} / {cardioViewGoal} min
              </div>
            </div>
            <div class="relative h-3.5 w-full rounded-full bg-gray-100 overflow-hidden mb-4">
              <div class="absolute inset-y-0 left-0 {cardioViewBarColor} rounded-full transition-all duration-500" style="width:{cardioViewDisplayPercent}%;"></div>
            </div>
          {/if}

          <!-- Wochenkreise (nur wenn health connected oder testMode) -->
          {#if healthConnected || cardioTestMode}
            <div class="grid grid-cols-7 gap-0.5">
              {#each weekDates as date, i}
                {@const dayData = weeklyCardioData.find(d => d.date === date)}
                {@const mins = dayData?.minutes ?? 0}
                {@const isToday = date === todayStr}
                {@const ringPercent = Math.round((mins / (dailyCardioGoal || 1)) * 100)}
                <div class="flex flex-col items-center gap-0.5">
                  <span class="text-[10px] text-gray-400 font-medium">{WEEK_LABELS[i]}</span>
                  <CircleRing
                    percent={ringPercent}
                    {isToday}
                    ariaLabel="{WEEK_LABELS[i]}: {mins} von {dailyCardioGoal} Minuten ({ringPercent}%)"
                  />
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </details>

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
            {#each dashboardBadges as badge (badge.id + ('_isNext' in badge ? '-next' : ''))}
              <div class="flex w-[4.5rem] shrink-0 flex-col items-center gap-1 text-center">
                {#if badge.image_url}
                  <img src={badge.image_url} alt={badge.name} class="h-12 w-12 rounded-xl object-contain {'_isNext' in badge ? 'grayscale opacity-50' : ''}" />
                {:else}
                  <div class="flex h-12 w-12 items-center justify-center rounded-xl text-xl
                    {'_isNext' in badge ? 'bg-gray-100' : 'bg-primary/10'}">🏅</div>
                {/if}
                <div class="text-[10px] font-medium leading-tight {'_isNext' in badge ? 'text-gray-400' : ''}">
                  {'_isNext' in badge ? 'Nächstes Ziel' : badge.name}
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
