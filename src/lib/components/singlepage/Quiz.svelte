<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { getOrCreateAnonymousId } from '$lib/utils/anonymous';
  import { getAccessToken, getValidAccessToken } from '$lib/utils/auth';
  import { track } from '$lib/utils/mixpanel';
  import { apiUrl } from '$lib/utils/api';

  const { quiz, meta, ctaUrl, passPercent, quizId } = $props();

  let anonymousId = $state('');
  let isLoggedIn = $state(false);
  let pendingClaim = $state(false);
  let claimMsg = $state('');
  let claimLoading = $state(false);
  /** @type {'open' | 'passed' | 'repeatable' | null} */
  let quizStatus = $state(null);
  /** @type {string | null} */
  let quizRepeatableAt = $state(null);
  let startedAtIso = $state(new Date().toISOString());

  const PENDING_CLAIM_KEY = 'austrofit_pending_claim';
  const LAST_RESULT_KEY = 'austrofit_last_quiz_result';

  function getNextUrl() {
    // wir wollen zurück auf exakt diese Seite inkl. Query
    return $page.url.pathname + $page.url.search;
  }
  function setPendingClaim() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PENDING_CLAIM_KEY, '1');
    pendingClaim = true;
  }

  function clearPendingClaim() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(PENDING_CLAIM_KEY);
    pendingClaim = false;
  }

  function hasPendingClaim() {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(PENDING_CLAIM_KEY) === '1';
  }

  function saveLastResult(snapshot) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(
      LAST_RESULT_KEY,
      JSON.stringify({
        quizId: quizId ?? quiz?.id,
        anonymousId,
        savedAt: new Date().toISOString(),
        scoreSnapshot: snapshot,
        wrongCountSnapshot
      })
    );
  }

  function loadLastResult() {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(LAST_RESULT_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  onMount(async () => {
    anonymousId = getOrCreateAnonymousId();
    console.log('[AustroFit] anonymousId:', anonymousId);
    isLoggedIn = !!getAccessToken();
    pendingClaim = hasPendingClaim();

    const token = getAccessToken();

    // A) Ergebnis immer wiederherstellen – auch wenn Auto-Claim ansteht,
    //    damit der User nach Register/Login sofort sein Ergebnis sieht.
    const last = loadLastResult();
    if (
      last?.quizId === (quizId ?? quiz?.id) &&
      last?.anonymousId === anonymousId &&
      last?.scoreSnapshot
    ) {
      submitted = true;
      scoreSnapshot = last.scoreSnapshot;
      wrongCountSnapshot = last.wrongCountSnapshot ?? wrongCountSnapshot;
    }

    // B) Wenn User eingeloggt ist → immer claimen (deckt PENDING_CLAIM_KEY-Fälle
    //    UND nachträgliche Claims bei zuvor fehlgeschlagenem Claim ab).
    if (token) {
      await claimPoints();
      clearPendingClaim();
      // LAST_RESULT_KEY NICHT entfernen – Ergebnis bleibt sichtbar
    }

    // C) Quiz-Status vom Server laden (für eingeloggte User)
    if (token && (quizId ?? quiz?.id)) {
      try {
        const statusRes = await fetch(apiUrl(`/api/quiz-status?quizId=${quizId ?? quiz?.id}`), {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          const myStatus = statusData[String(quizId ?? quiz?.id)];
          if (myStatus) {
            quizStatus = myStatus.status;
            quizRepeatableAt = myStatus.repeatable_at ?? null;

            // Repeatable: Attempt-Key löschen damit beim nächsten Versuch ein neuer Attempt erstellt werden kann
            if (myStatus.status === 'repeatable') {
              const resolvedQuizId = quizId ?? quiz?.id ?? null;
              const attemptKey = `austrofit_attempt_created:${anonymousId}:${resolvedQuizId ?? 'noquiz'}`;
              if (typeof window !== 'undefined') localStorage.removeItem(attemptKey);
            }
          }
        }
      } catch (e) {
        console.warn('quiz-status fetch failed', e);
      }
    }
  });


  async function claimAnonymousPoints() {
    const token = await getValidAccessToken();
    if (!token) {
      claimMsg = 'Bitte zuerst einloggen/registrieren.';
      return false;
    }
    if (!anonymousId) {
      claimMsg = 'Keine anonymous_id gefunden.';
      return false;
    }

    const res = await fetch(apiUrl('/api/claim'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anonymous_id: anonymousId,
        access_token: token
      })
    });

    let data = {};
    try { data = await res.json(); } catch { /* ignore */ }

    if (!res.ok) {
      console.error('Claim failed:', res.status, data);
      const msg = data?.message ?? data?.errors?.[0]?.message ?? `Claim fehlgeschlagen (${res.status})`;
      claimMsg = msg;
      // Bei 404 (User nicht gefunden) → pending claim entfernen
      // Bei 401 (Token abgelaufen) → NICHT entfernen, damit der nächste Besuch es retried
      if (res.status === 404) {
        clearPendingClaim();
      }
      return false;
    }

    claimMsg = data?.claimed === 0
      ? 'Keine offenen Punkte gefunden.'
      : 'Punkte gutgeschrieben ✅';
    return true;
  }

  // Config
  const PASS_PERCENT_DEFAULT = 100;
  const requiredPercent = $derived(Number.isFinite(passPercent) ? passPercent : PASS_PERCENT_DEFAULT);
  const learnMoreUrl = $derived(ctaUrl ?? '/');
  const eligiblePoints = $derived(meta?.eligible_points ?? meta?.points ?? 40);

  // State
  let submitted = $state(false);
  let banner = $state('');

  let singleAnswers = $state({}); // { [qi]: 'A' }
  let multiAnswers = $state({});  // { [qi]: ['A','C'] }

  // Repeat-mode
  let wrongOnly = $state(false);
  let pos = $state(0);

  // Statische Repeat-Reihenfolge + Antwortreihenfolge
  let repeatOrder = $state([]);           // [qi, qi, ...]
  let repeatOptionOrder = $state({});     // { [qi]: [opt,opt,...] }

  // Snapshots (UI darf nicht live updaten)
  let scoreSnapshot = $state(null);       // { correctCount, percent, passed }
  let wrongCountSnapshot = $state(null);  // number

  let repeatSubmitted = $state(false);
  let repeatScoreSnapshot = $state(null);
  let repeatWrongCountSnapshot = $state(null);
  let reviewMode = $state(false);

  const totalAll = $derived(quiz?.questions?.length ?? 0);

  // --- Helpers ---
  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getPicked(q, qi) {
    if (q.type === 'multi_choice') return multiAnswers[qi] ?? [];
    return singleAnswers[qi] ?? '';
  }

  function isAnswered(q, qi) {
    const picked = getPicked(q, qi);
    if (q.type === 'multi_choice') return Array.isArray(picked) && picked.length > 0;
    return typeof picked === 'string' && picked.length > 0;
  }

  function isCorrect(q, qi) {
    const correct = [...(q.correct ?? [])].sort().join('|');

    if (q.type === 'multi_choice') {
      const picked = [...(multiAnswers[qi] ?? [])].sort().join('|');
      return picked === correct;
    }

    const picked = singleAnswers[qi] ?? '';
    return picked === correct;
  }

  function toggleMulti(qi, key) {
    const current = multiAnswers[qi] ?? [];
    const next = current.includes(key)
      ? current.filter((x) => x !== key)
      : [...current, key];

    multiAnswers = { ...multiAnswers, [qi]: next };
  }

  function setSingle(qi, value) {
    singleAnswers = { ...singleAnswers, [qi]: value };
  }

  function firstUnansweredIndex() {
    if (!quiz?.questions?.length) return -1;
    for (let i = 0; i < quiz.questions.length; i++) {
      if (!isAnswered(quiz.questions[i], i)) return i;
    }
    return -1;
  }

  function computeScore() {
    if (!quiz?.questions?.length) return { correctCount: 0, percent: 0, passed: false };

    const correctCount = quiz.questions.reduce((acc, q, qi) => acc + (isCorrect(q, qi) ? 1 : 0), 0);
    const percent = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = percent >= requiredPercent;
    return { correctCount, percent, passed };
  }

  // Live-Werte (nur für Berechnung, NICHT direkt fürs Rendering verwenden)
  const liveScore = $derived(computeScore());

  const wrongIndicesLive = $derived(
    submitted
      ? (quiz?.questions?.map((q, i) => (isCorrect(q, i) ? null : i)).filter((x) => x !== null) ?? [])
      : []
  );

  const liveWrongCount = $derived(wrongIndicesLive.length);

  // Anzeige-Werte: NUR Snapshots
  const displayScore = $derived.by(() => {
    if (!submitted) return null;

    if (wrongOnly) {
      // im Repeat: bis "erneut prüfen" = alter Snapshot; danach Repeat-Snapshot
      return (repeatSubmitted ? repeatScoreSnapshot : scoreSnapshot) ?? scoreSnapshot ?? liveScore;
    }

    return scoreSnapshot ?? liveScore;
  });

  const displayWrongCount = $derived.by(() => {
    if (!submitted) return null;

    if (wrongOnly) {
      return (repeatSubmitted ? repeatWrongCountSnapshot : wrongCountSnapshot) ?? wrongCountSnapshot ?? liveWrongCount;
    }

    return wrongCountSnapshot ?? liveWrongCount;
  });

  // Indizes
  const allIndices = $derived(quiz?.questions?.map((_, i) => i) ?? []);
  const visibleIndices = $derived(wrongOnly ? repeatOrder : allIndices);
  const totalVisible = $derived(visibleIndices.length);

  function clampPos(i) {
    if (!totalVisible) return 0;
    return Math.max(0, Math.min(totalVisible - 1, i));
  }

  function goToPos(i) {
    pos = clampPos(i);
    banner = '';
  }

  const currentIndex = $derived(visibleIndices[pos] ?? 0);
  const currentQuestion = $derived(quiz?.questions?.[currentIndex]);
  const currentAnswered = $derived(currentQuestion ? isAnswered(currentQuestion, currentIndex) : false);

  const progressPercent = $derived(totalVisible ? Math.round(((pos + 1) / totalVisible) * 100) : 0);
  const allAnswered = $derived(firstUnansweredIndex() === -1);

  // Buttons
  const canGoPrev = $derived(pos > 0);
  const canGoNext = $derived(submitted ? pos < totalVisible - 1 : (currentAnswered && pos < totalVisible - 1));

  const showSubmitButton = $derived(!wrongOnly && !submitted && allAnswered && pos === totalVisible - 1);
  const showRepeatSubmitButton = $derived(wrongOnly && submitted && !repeatSubmitted && pos === totalVisible - 1);

  const remainingSteps = $derived(totalVisible ? (totalVisible - (pos + 1)) : 0);

  const progressHint = $derived.by(() => {
    if (!totalVisible) return '';

    // Im Repeat-Modus eher neutraler "Rest" kommunizieren
    if (wrongOnly && submitted) {
      if (remainingSteps === 0) return 'Letzte Wiederholfrage';
      if (remainingSteps === 1) return 'Nur noch 1 Wiederholfrage';
      return `Noch ${remainingSteps} Wiederholfragen`;
    }

    // Normalmodus (Conversion-Ziel: 100% nach Prüfen)
    if (remainingSteps === 0) {
      // letzte Frage
      if (!submitted && allAnswered) return 'Nur noch 1 Schritt bis 100%';
      return 'Letzte Frage';
    }

    if (remainingSteps === 1) return 'Nur noch 1 Schritt bis zum Ziel';
    return `Noch ${remainingSteps} Fragen bis zum Ziel`;
  });

  function prev() {
    if (!canGoPrev) return;
    goToPos(pos - 1);
  }

  function next() {
    if (!canGoNext) return;
    goToPos(pos + 1);
  }

  function goToOriginalIndex(index) {
    const p = visibleIndices.indexOf(index);
    if (p !== -1) goToPos(p);
  }

  function resetAnswersFor(indices) {
    // Entfernt alte Auswahl im Wiederholmodus (UX: "Neustart" statt Frust)
    const nextSingle = { ...singleAnswers };
    const nextMulti = { ...multiAnswers };

    for (const qi of indices) {
      delete nextSingle[qi];
      delete nextMulti[qi];
    }

    singleAnswers = nextSingle;
    multiAnswers = nextMulti;
  }

  function buildRepeatOptionOrder(indices) {
    const map = {};
    for (const qi of indices) {
      const opts = quiz?.questions?.[qi]?.options ?? [];
      map[qi] = shuffleArray(opts);
    }
    repeatOptionOrder = map;
  }

  function getOptionsForRender(qi) {
    if (wrongOnly && repeatOptionOrder[qi]?.length) return repeatOptionOrder[qi];
    return quiz?.questions?.[qi]?.options ?? [];
  }

  function onSubmit() {
    const missing = firstUnansweredIndex();
    if (missing !== -1) {
      banner = `Bitte beantworte erst alle Fragen (offen: Frage ${missing + 1}).`;
      wrongOnly = false;
      pos = 0;
      goToOriginalIndex(missing);
      return;
    }

    submitted = true;
    banner = '';

    // Snapshot einfrieren (damit Ergebnis-Box stabil bleibt)
    scoreSnapshot = liveScore;
    wrongCountSnapshot = liveWrongCount;
    saveLastResult(liveScore);

    // Analytics: quiz_completed (Conversion-Trigger – CTA erscheint bei passed)
    if (liveScore?.passed) {
      track('quiz_completed', {
        quiz_id: quizId ?? quiz?.id ?? null,
        percent: liveScore.percent,
        correct_count: liveScore.correctCount,
        question_count: totalAll,
        logged_in: isLoggedIn
      });
    }

    // Wenn bestanden: Attempt schreiben + Punkte claimen
    if (liveScore?.passed) {
      if (getAccessToken()) {
        // Eingeloggt: Attempt erstellen und direkt auto-claimen
        void (async () => {
          await createAttemptIfNeeded();
          pendingClaim = true;
          await claimPoints();
        })();
      } else {
        // Anonym: pending claim merken für nach der Registrierung/Login
        localStorage.setItem(PENDING_CLAIM_KEY, '1');
        pendingClaim = true;
        void createAttemptIfNeeded();
      }
    }

    // Repeat-Run resetten
    repeatSubmitted = false;
    repeatScoreSnapshot = null;
    repeatWrongCountSnapshot = null;
  }

  function startWrongOnly() {
    if (!submitted) return;

    const initialWrong = wrongIndicesLive;
    if (!initialWrong.length) {
      // Alle Fragen jetzt korrekt → Haupt-Snapshot aktualisieren
      scoreSnapshot = liveScore;
      wrongCountSnapshot = liveWrongCount;
      banner = 'Du hast aktuell keine falschen Fragen – super!';
      return;
    }

    wrongOnly = true;
    reviewMode = false;

    // Repeat ist ein eigener "Durchgang"
    repeatSubmitted = false;
    repeatScoreSnapshot = null;
    repeatWrongCountSnapshot = null;

    // Reihenfolge mischen (Fragen + Antworten)
    repeatOrder = shuffleArray(initialWrong);

    // A) Reset: alte (falsche) Auswahlen nicht anzeigen
    resetAnswersFor(repeatOrder);

    // Shuffle: Antworten neu mischen
    buildRepeatOptionOrder(repeatOrder);

    pos = 0;
    banner = '';
  }

  function onRepeatSubmit() {
    // Jetzt erst den neuen Score einfrieren
    repeatSubmitted = true;
    repeatScoreSnapshot = liveScore;
    repeatWrongCountSnapshot = liveWrongCount;
    banner = '';

    // Wenn Repeat bestanden → Haupt-Snapshot ebenfalls aktualisieren,
    // damit "Alle Fragen anzeigen" danach korrekt "Bestanden" zeigt
    if (liveScore?.passed) {
      scoreSnapshot = liveScore;
      wrongCountSnapshot = liveWrongCount;

      // Claim-Logik auslösen (falls noch nicht passiert)
      if (getAccessToken()) {
        void (async () => {
          await createAttemptIfNeeded();
          pendingClaim = true;
          await claimPoints();
        })();
      } else {
        localStorage.setItem(PENDING_CLAIM_KEY, '1');
        pendingClaim = true;
        void createAttemptIfNeeded();
      }
    }
  }

  function showAll() {
    wrongOnly = false;
    reviewMode = true;
    pos = 0;
    banner = '';
  }

  // Hilfsfunktionen für die Zusammenfassung nach dem Bestehen
  function getChosenAnswerText(q, qi) {
    const opts = q.options ?? [];
    if (q.type === 'multi_choice') {
      const keys = multiAnswers[qi] ?? [];
      const texts = opts.filter((o) => keys.includes(o.key)).map((o) => o.text);
      return texts.length ? texts.join(', ') : '–';
    }
    const key = singleAnswers[qi] ?? '';
    return opts.find((o) => o.key === key)?.text ?? '–';
  }

  function getCorrectAnswerText(q) {
    const opts = q.options ?? [];
    const correctKeys = q.correct ?? [];
    const texts = opts.filter((o) => correctKeys.includes(o.key)).map((o) => o.text);
    return texts.length ? texts.join(', ') : '–';
  }

  function resetQuiz() {
    submitted = false;
    banner = '';
    singleAnswers = {};
    multiAnswers = {};

    wrongOnly = false;
    repeatOrder = [];
    repeatOptionOrder = {};
    pos = 0;

    scoreSnapshot = null;
    wrongCountSnapshot = null;

    repeatSubmitted = false;
    repeatScoreSnapshot = null;
    repeatWrongCountSnapshot = null;
    reviewMode = false;
  }

  async function createAttemptIfNeeded() {
    try {
      // Duplikatbremse: Key nur setzen wenn Attempt WIRKLICH erstellt wurde
      const resolvedQuizId = quizId ?? quiz?.id ?? null;
      const key = `austrofit_attempt_created:${anonymousId}:${resolvedQuizId ?? 'noquiz'}`;
      if (typeof window !== 'undefined' && localStorage.getItem(key) === '1') return;

      const maxScore = totalAll;
      const score = liveScore?.correctCount ?? 0;

      const eligiblePoints =
        meta?.eligible_points ??
        meta?.points ??
        40;

      const res = await fetch(apiUrl('/api/quiz-attempts'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz: resolvedQuizId,
          anonymous_id: anonymousId,
          started_at: startedAtIso,
          completed_at: new Date().toISOString(),
          score,
          max_score: maxScore,
          passed: true,
          eligible_points: eligiblePoints
        })
      });

      // Key nur setzen wenn Attempt tatsächlich angelegt wurde (kein Cooldown-Skip, kein Fehler)
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (!data?.skipped) {
          if (typeof window !== 'undefined') localStorage.setItem(key, '1');
        }
      }
    } catch (e) {
      console.error('createAttemptIfNeeded failed', e);
    }
  }

  async function claimPoints() {
    claimMsg = '';
    claimLoading = true;

    try {
      const ok = await claimAnonymousPoints();
      if (ok) {
        localStorage.removeItem(PENDING_CLAIM_KEY);
        pendingClaim = false;
      }
    } finally {
      claimLoading = false;
    }
  }
  
</script>

<section class="mt-10 rounded-[var(--radius-card)] border border-black/10 bg-white p-5 md:p-7 shadow-sm">
  <!-- Header -->
  <div class="flex items-start justify-between gap-4">
    <div>
      <h2 class="text-xl md:text-2xl font-semibold">Quiz</h2>
      {#if quizStatus === 'passed'}
        <div class="mt-1 text-xs text-primary font-medium">
          ✅ Bestanden · wieder verfügbar {quizRepeatableAt ? `ab ${new Date(quizRepeatableAt).toLocaleDateString('de-AT', { day: 'numeric', month: 'long' })}` : ''}
        </div>
      {:else if quizStatus === 'repeatable'}
        <div class="mt-1 text-xs text-primary font-medium">
          🔓 Wieder verfügbar – neue Punkte möglich!
        </div>
      {/if}
      <!-- Meta absichtlich ausgeblendet -->
    </div>

    <div class="text-right">
      {#if wrongOnly && submitted}
        <div class="text-sm font-medium">
          Wiederholung: {totalVisible ? pos + 1 : 0} von {totalVisible}
        </div>
        <div class="mt-1 text-xs opacity-70">
          {progressHint}
        </div>
      {:else}
        <div class="text-sm font-medium">
          Frage {totalVisible ? pos + 1 : 0} von {totalVisible}
        </div>
        <div class="mt-1 text-xs opacity-70">
          {#if submitted}
            {progressHint}
          {:else}
            {#if currentAnswered}Beantwortet{:else}Noch offen{/if}
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <!-- Progress bar -->
  <div class="mt-4">
    <div class="h-2 w-full rounded-full bg-black/10 overflow-hidden">
      <div class="h-full rounded-full bg-black/60 progress-fill" style={`width:${progressPercent}%`}></div>
    </div>
  </div>

  {#if banner}
    <div class="mt-4 rounded-lg border border-error/30 bg-error/10 p-3 text-sm">
      {banner}
    </div>
  {/if}

  <!-- Score Summary -->
  {#if submitted && displayScore}
    <div class="mt-5 rounded-xl border border-black/10 p-4 md:p-5">
      <div>
        <div class="text-base md:text-lg font-semibold">Dein Ergebnis</div>
        <div class="mt-1 flex items-center gap-2 flex-wrap">
          <span class="text-sm opacity-80">
            {displayScore.correctCount} / {totalAll} richtig · <span class="font-semibold">{displayScore.percent}%</span>
          </span>
          {#if displayScore.passed}
            <span class="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-sm text-heading success-pill">
              <span class="check-pop">✅</span> Bestanden
            </span>
          {:else}
            <span class="inline-flex items-center gap-1.5 rounded-full border border-error/30 bg-error/5 px-3 py-1 text-sm text-error">
              ❌ Nicht bestanden
            </span>
          {/if}
        </div>

        {#if displayScore.passed && displayScore.percent === 100}
          <div class="mt-2 text-sm font-medium">
            🎉 Perfekt! Du hast das Quiz vollständig gemeistert. <span class="text-primary">+{eligiblePoints} Punkte</span>
          </div>
        {:else if displayScore.passed}
          <div class="mt-2 text-sm font-medium">
            ✅ Stark! Du hast das Quiz bestanden. <span class="text-primary">+{eligiblePoints} Punkte</span>
          </div>
        {:else}
          <div class="mt-2 text-sm opacity-80">
            Du bist nah dran – wiederhole nur die falschen Fragen, bis du 100% hast.
          </div>
        {/if}

        {#if (displayWrongCount ?? 0) > 0}
          <div class="mt-2 flex items-center flex-wrap gap-2">
            <span class="text-sm opacity-80">Noch falsch: <span class="font-semibold">{displayWrongCount}</span></span>
            <button
              class="rounded-lg border border-black/10 px-3 py-1 text-xs hover:bg-black/5"
              type="button"
              onclick={startWrongOnly}
            >
              Nur falsche Fragen wiederholen
            </button>
          </div>
        {/if}
      </div>

      <div class="mt-4 rounded-lg bg-black/5 p-3 text-sm leading-relaxed">
        {#if displayScore.passed}
          <div class="flex flex-wrap gap-2">
            {#if !isLoggedIn}
              <div class="w-full rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm">
                <p class="font-semibold text-heading">
                  🎉 Du hast {eligiblePoints} Punkte verdient!
                </p>
                <p class="mt-1 text-body/80">
                  Melde dich an, um sie zu sichern und gegen Belohnungen bei unseren Partneranbietern einzulösen – kostenlos und ohne Verpflichtung.
                </p>
              </div>
              <button
                class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                type="button"
                onclick={() => {
                  setPendingClaim();
                  goto(`/registrierung?next=${encodeURIComponent(getNextUrl())}`);
                }}
              >
                Jetzt anmelden &amp; Punkte sichern
              </button>

              <button
                class="rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-black/5"
                type="button"
                onclick={() => {
                  setPendingClaim();
                  goto(`/login?next=${encodeURIComponent(getNextUrl())}`);
                }}
              >
                Ich habe bereits ein Konto
              </button>
            {:else}
              {#if claimLoading}
                <p class="text-sm opacity-80">Punkte werden gutgeschrieben…</p>
              {:else if !claimMsg || claimMsg === 'Punkte gutgeschrieben ✅'}
                <p class="text-sm font-medium text-primary">✅ {eligiblePoints} Punkte wurden automatisch gutgeschrieben.</p>
                <a
                  href="/belohnung"
                  class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
                >
                  Zu den Belohnungen →
                </a>
              {:else}
                <p class="w-full text-sm opacity-80">{claimMsg}</p>
              {/if}
            {/if}
          </div>
          <div class="mt-3">
            <a class="underline font-medium text-primary" href={learnMoreUrl}>
              Mehr zu Punkten &amp; Vorteilen
            </a>
          </div>
        {:else}
          <div class="opacity-90">
            Punkte werden nur bei <strong>vollständig bestandenem Quiz</strong> ({requiredPercent}% richtig) vergeben.
          </div>
          <div class="mt-2">
            <a class="underline font-medium" href={learnMoreUrl}>
              Mehr zu Punkten &amp; Vorteilen
            </a>
          </div>
        {/if}
      </div>

      {#if !displayScore.passed}
        <div class="mt-4 flex flex-wrap gap-2">
          <button
            class="rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-black/5"
            type="button"
            onclick={showAll}
          >
            Alle Fragen anzeigen
          </button>
        </div>

        {#if wrongOnly && !repeatSubmitted}
          <div class="mt-2 text-xs opacity-70">
            Übungsmodus: Ergebnis bleibt stabil, bis du „Antworten erneut prüfen" klickst.
          </div>
        {/if}
      {/if}

      <div class="mt-3">
        <button
          class="text-sm underline opacity-80 hover:opacity-100"
          type="button"
          onclick={resetQuiz}
        >
          Quiz neu starten
        </button>
      </div>
    </div>
  {/if}

  <!-- Nach dem Bestehen: Ergebnisse aller Fragen (eingeklappt) -->
  {#if submitted && displayScore?.passed}
    <details class="mt-6">
      <summary class="cursor-pointer select-none text-sm font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700 transition-colors">
        Ergebnisse
      </summary>
      <div class="mt-3 flex flex-col gap-3">
        {#each quiz.questions as q, i}
          {@const correct = isCorrect(q, i)}
          <div class="rounded-xl border p-4 {correct ? 'border-primary/30 bg-primary/5' : 'border-error/30 bg-error/5'}">
            <div class="flex items-start gap-2">
              <span class="shrink-0 text-base">{correct ? '✅' : '❌'}</span>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm leading-snug">{i + 1}. {q.question}</p>
                <p class="mt-1 text-xs text-gray-600">
                  Deine Antwort: <span class="font-medium">{getChosenAnswerText(q, i)}</span>
                </p>
                {#if !correct}
                  <p class="mt-0.5 text-xs text-primary">
                    Richtig: <span class="font-medium">{getCorrectAnswerText(q)}</span>
                  </p>
                {/if}
                {#if q.explanation}
                  <p class="mt-2 text-xs text-gray-600 border-t border-black/10 pt-2 leading-relaxed">
                    {q.explanation}
                  </p>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </details>

  <!-- Single Question Card (nur wenn nicht bestanden) -->
  {:else if totalAll && currentQuestion}
    <div class="mt-6 rounded-xl border border-black/10 p-4 md:p-5">
      <div class="flex items-start justify-between gap-4">
        <h3 class="text-base md:text-lg font-semibold leading-snug">
          {currentIndex + 1}. {currentQuestion.question}
        </h3>

        {#if submitted && !wrongOnly}
          <span class="shrink-0 rounded-full px-3 py-1 text-xs border border-black/10">
            {isCorrect(currentQuestion, currentIndex) ? '✅ Richtig' : '❌ Nicht richtig'}
          </span>
        {/if}
      </div>

      <div class="mt-3 flex flex-col gap-2">
        {#if currentQuestion.type === 'multi_choice'}
          {#each getOptionsForRender(currentIndex) as opt}
            <label class="flex items-start gap-3 rounded-lg border border-black/10 p-3 hover:bg-black/5 cursor-pointer">
              <input
                type="checkbox"
                class="mt-1"
                checked={(multiAnswers[currentIndex] ?? []).includes(opt.key)}
                onchange={() => toggleMulti(currentIndex, opt.key)}
              />
              <div class="opacity-90">
                <span class="sr-only">{opt.key}</span>
                {opt.text}
              </div>
            </label>
          {/each}
        {:else}
          {#each getOptionsForRender(currentIndex) as opt}
            <label class="flex items-start gap-3 rounded-lg border border-black/10 p-3 hover:bg-black/5 cursor-pointer">
              <input
                type="radio"
                name={"q_" + currentIndex}
                class="mt-1"
                value={opt.key}
                checked={(singleAnswers[currentIndex] ?? '') === opt.key}
                onchange={(e) => setSingle(currentIndex, e.target.value)}
              />
              <div class="opacity-90">
                <span class="sr-only">{opt.key}</span>
                {opt.text}
              </div>
            </label>
          {/each}
        {/if}
      </div>

      {#if submitted && !wrongOnly && !reviewMode && currentQuestion.explanation}
        <div class="mt-3 rounded-lg bg-black/5 p-3 text-sm">
          <div class="font-semibold">Erklärung</div>
          <div class="mt-1 opacity-90">{currentQuestion.explanation}</div>
        </div>
      {/if}
    </div>

    <!-- Bottom Navigation / CTA -->
    <div class="mt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div class="flex items-center gap-2">
        <button
          class="rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-black/5 disabled:opacity-40 disabled:hover:bg-transparent"
          type="button"
          onclick={prev}
          disabled={!canGoPrev}
        >
          ← Zurück
        </button>

        {#if !showSubmitButton}
          <button
            class="rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-black/5 disabled:opacity-40 disabled:hover:bg-transparent"
            type="button"
            onclick={next}
            disabled={!canGoNext}
          >
            Weiter →
          </button>
        {/if}
      </div>

      <div class="flex items-center gap-2">
        {#if showSubmitButton}
          <button
            class="rounded-lg bg-primary text-white px-5 py-2 text-sm font-semibold hover:bg-primary-dark transition-colors"
            type="button"
            onclick={onSubmit}
          >
            Antworten prüfen
          </button>
        {/if}

        {#if showRepeatSubmitButton}
          <button
            class="rounded-lg bg-primary text-white px-5 py-2 text-sm font-semibold hover:bg-primary-dark transition-colors"
            type="button"
            onclick={onRepeatSubmit}
          >
            Antworten erneut prüfen
          </button>
        {/if}
      </div>
    </div>
  {:else}
    <div class="mt-6 rounded-lg border border-black/10 bg-black/5 p-4 text-sm">
      Kein Quiz gefunden.
    </div>
  {/if}
</section>

<style>
  .progress-fill {
    transition: width 350ms ease;
  }

  .check-pop {
    display: inline-block;
    animation: pop 420ms ease-out;
  }

  .success-pill {
    animation: glow 900ms ease-out;
  }

  @keyframes pop {
    0% { transform: scale(0.6); opacity: 0.3; }
    60% { transform: scale(1.15); opacity: 1; }
    100% { transform: scale(1); }
  }

  @keyframes glow {
    0% { transform: scale(0.98); }
    45% { transform: scale(1.02); }
    100% { transform: scale(1); }
  }
</style>
