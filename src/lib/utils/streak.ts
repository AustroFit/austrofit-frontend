// src/lib/utils/streak.ts
// Points formula and streak calculation helpers.
// updateStreak() is designed for server-side use (called from SvelteKit endpoints).

/**
 * Calculates AustroFit points earned for a given step count.
 *   < 4.000 → 0P
 *   4.000–6.999 → 10P + 5P je angefangene 500 Schritte ab 4.000
 *     (4000=10P, 4500=15P, 5000=20P, 5500=25P, 6000=30P, 6500=35P)
 *   ≥ 7.000 → 40P + 5P je angefangene 500 Schritte ab 7.000
 */
export function calculatePoints(steps: number): number {
  if (steps < 4000) return 0;
  if (steps < 7000) return 10 + Math.floor((steps - 4000) / 500) * 5;
  return 40 + Math.floor((steps - 7000) / 500) * 5;
}

/**
 * Counts consecutive days with step entries going back from today,
 * including `newDate` in the set.
 */
export function calculateStreakDays(existingDates: string[], newDate: string): number {
  const dateSet = new Set([...existingDates, newDate]);
  const today = new Date().toISOString().split('T')[0];
  let streak = 0;
  const cursor = new Date(today + 'T12:00:00');

  for (let i = 0; i < 60; i++) {
    const check = cursor.toISOString().split('T')[0];
    if (dateSet.has(check)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Full server-side streak update.
 * Reads step history from Directus, recalculates streak (only ≥7.000-Schritte-Tage),
 * patches the user profile, and awards:
 *   +20P Streak-Tag-Bonus (jeden Tag mit ≥7.000 Schritten im laufenden Streak)
 *   +60P Streak-Wochen-Bonus (alle 7 Streak-Tage)
 *
 * Call from SvelteKit server endpoints only (needs admin token).
 */
export async function updateStreak(
  userId: string,
  newDate: string,
  steps: number,
  opts: { cmsUrl: string; token: string; userToken?: string; fetchFn: typeof fetch }
): Promise<{
  streak_days: number;
  longest_streak: number;
  streak_bonus_awarded: boolean;
  streak_tag_bonus_awarded: boolean;
  milestone_streak3_awarded: boolean;
}> {
  const { cmsUrl, token, userToken, fetchFn } = opts;
  const qualifiesForStreak = steps >= 7000;

  // 1. Fetch step entries (last 60 days) mit points_delta → nur ≥7.000-Schritte-Tage zählen
  const params = new URLSearchParams({
    'filter[user][_eq]': userId,
    'filter[source_type][_eq]': 'schritte',
    fields: 'source_ref,points_delta',
    sort: '-occurred_at',
    limit: '60'
  });

  let qualifiedDates: string[] = [];
  try {
    const res = await fetchFn(`${cmsUrl}/items/points_ledger?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const body = await res.json();
      qualifiedDates = (body.data ?? [])
        .filter((e: any) => Number(e.points_delta ?? 0) >= 40) // points_delta ≥40 = ≥7.000 Schritte
        .map((e: any) => (e.source_ref ?? '').split('T')[0])
        .filter((d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d));
    }
  } catch {
    /* non-critical – streak calculation proceeds with today only */
  }

  // 2. Streak aus qualifizierten Tagen berechnen ('' als Fallback wenn heute nicht qualifiziert)
  const streak_days = calculateStreakDays(qualifiedDates, qualifiesForStreak ? newDate : '');

  // 3. longest_streak lesen + user_profiles ID ermitteln (ein Request)
  //    User-Token für READ verwenden (User-Policy hat $CURRENT_USER-Filter auf user_profiles)
  //    Admin-Token hat ggf. kein READ auf user_profiles
  let prevLongest = 0;
  let profileId: string | null = null;
  try {
    const readToken = userToken ?? token;
    const profileRes = await fetchFn(
      `${cmsUrl}/items/user_profiles?filter[user][_eq]=${userId}&fields=id,longest_streak&limit=1`,
      { headers: { Authorization: `Bearer ${readToken}` } }
    );
    if (profileRes.ok) {
      const pb = await profileRes.json();
      const profile = pb.data?.[0];
      prevLongest = Number(profile?.longest_streak ?? 0);
      profileId = profile?.id ?? null;
    }
  } catch {
    /* non-critical */
  }
  const longest_streak = Math.max(streak_days, prevLongest);

  // 4. user_profiles upsert (nicht directus_users – /api/profile liest von dort)
  try {
    if (profileId) {
      await fetchFn(`${cmsUrl}/items/user_profiles/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ streak_days, longest_streak })
      });
    } else {
      // Kein Eintrag vorhanden → neu anlegen
      await fetchFn(`${cmsUrl}/items/user_profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user: userId, streak_days, longest_streak })
      });
    }
  } catch {
    /* non-critical */
  }

  // 5. Streak-Tag-Bonus: +20P ab dem 2. aufeinanderfolgenden Tag mit ≥7.000 Schritten
  //    (Tag 0 = erster ≥7k-Tag, startet den Streak; Tag 1+ = Streak-Bonus)
  let streak_tag_bonus_awarded = false;
  if (qualifiesForStreak && streak_days > 1) {
    const dedupParams = new URLSearchParams({
      'filter[user][_eq]': userId,
      'filter[source_type][_eq]': 'streak_tag',
      'filter[source_ref][_eq]': newDate,
      fields: 'id',
      limit: '1'
    });
    let alreadyAwarded = false;
    try {
      const dedupRes = await fetchFn(`${cmsUrl}/items/points_ledger?${dedupParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (dedupRes.ok) {
        const db = await dedupRes.json();
        alreadyAwarded = (db.data ?? []).length > 0;
      }
    } catch {
      /* non-critical */
    }
    if (!alreadyAwarded) {
      try {
        const tagRes = await fetchFn(`${cmsUrl}/items/points_ledger`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            user: userId,
            points_delta: 20,
            source_type: 'streak_tag',
            source_ref: newDate,
            occurred_at: new Date().toISOString()
          })
        });
        streak_tag_bonus_awarded = tagRes.ok;
      } catch {
        /* non-critical */
      }
    }
  }

  // 6. Streak-Wochen-Bonus: +60P nach jeweils 7 Streak-Bonus-Tagen
  //    (streak_days=8 = 7 Bonus-Tage, da Tag 0 kein Bonus; danach 15, 22, ...)
  let streak_bonus_awarded = false;
  if (streak_days > 1 && (streak_days - 1) % 7 === 0) {
    try {
      const bonusRes = await fetchFn(`${cmsUrl}/items/points_ledger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          user: userId,
          points_delta: 60,
          source_type: 'streak',
          source_ref: `streak-${streak_days}d-${newDate}`,
          occurred_at: new Date().toISOString()
        })
      });
      streak_bonus_awarded = bonusRes.ok;
    } catch {
      /* non-critical */
    }
  }

  // 7. Milestone: Erste 3-Tage-Streak – einmalig, +80P
  //    Feuert bei streak_days=4 (= 3 Streak-Bonus-Tage nach dem Starttag)
  let milestone_streak3_awarded = false;
  if (qualifiesForStreak && streak_days === 4) {
    const dedupParams = new URLSearchParams({
      'filter[user][_eq]': userId,
      'filter[source_type][_eq]': 'milestone',
      'filter[source_ref][_eq]': 'milestone-first_streak_3',
      fields: 'id',
      limit: '1'
    });
    let alreadyAwarded = false;
    try {
      const dedupRes = await fetchFn(`${cmsUrl}/items/points_ledger?${dedupParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (dedupRes.ok) {
        const db = await dedupRes.json();
        alreadyAwarded = (db.data ?? []).length > 0;
      }
    } catch {
      /* non-critical */
    }
    if (!alreadyAwarded) {
      try {
        const awardRes = await fetchFn(`${cmsUrl}/items/points_ledger`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            user: userId,
            points_delta: 80,
            source_type: 'milestone',
            source_ref: 'milestone-first_streak_3',
            occurred_at: new Date().toISOString()
          })
        });
        milestone_streak3_awarded = awardRes.ok;
      } catch {
        /* non-critical */
      }
    }
  }

  return { streak_days, longest_streak, streak_bonus_awarded, streak_tag_bonus_awarded, milestone_streak3_awarded };
}

/**
 * Server-side quiz streak update.
 * Reads all passed quiz_attempts for the user, calculates consecutive days
 * up to today, and patches user_profiles.quiz_streak_days.
 *
 * Call after /api/claim has set user on the attempts.
 * userToken: user's Bearer token (has $CURRENT_USER READ on user_profiles)
 * token: admin token (has UPDATE on user_profiles + READ on quiz_attempts)
 */
export async function updateQuizStreak(
  userId: string,
  opts: { cmsUrl: string; token: string; userToken?: string; fetchFn: typeof fetch }
): Promise<{ quiz_streak_days: number }> {
  const { cmsUrl, token, userToken, fetchFn } = opts;

  // 1. Alle bestandenen, geclaimten Quiz-Attempts des Users lesen
  const params = new URLSearchParams({
    'filter[user][_eq]': userId,
    'filter[passed][_eq]': 'true',
    'filter[completed_at][_nnull]': 'true',
    fields: 'completed_at',
    sort: '-completed_at',
    limit: '60'
  });

  let completedDates: string[] = [];
  try {
    const res = await fetchFn(`${cmsUrl}/items/quiz_attempts?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const body = await res.json();
      completedDates = (body.data ?? [])
        .map((e: any) => (e.completed_at ?? '').split('T')[0])
        .filter((d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d));
    }
  } catch {
    /* non-critical */
  }

  // 2. Streak berechnen: aufeinanderfolgende Tage von heute rückwärts
  const today = new Date().toISOString().split('T')[0];
  const dateSet = new Set(completedDates);
  let quiz_streak_days = 0;
  const cursor = new Date(today + 'T12:00:00');
  for (let i = 0; i < 60; i++) {
    const check = cursor.toISOString().split('T')[0];
    if (dateSet.has(check)) {
      quiz_streak_days++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  // 3. user_profiles.quiz_streak_days patchen
  //    userToken für READ ($CURRENT_USER-Filter), adminToken für PATCH
  const readToken = userToken ?? token;
  let profileId: string | null = null;
  try {
    const profileRes = await fetchFn(
      `${cmsUrl}/items/user_profiles?filter[user][_eq]=${userId}&fields=id&limit=1`,
      { headers: { Authorization: `Bearer ${readToken}` } }
    );
    if (profileRes.ok) {
      const pb = await profileRes.json();
      profileId = pb.data?.[0]?.id ?? null;
    }
  } catch {
    /* non-critical */
  }

  if (profileId) {
    try {
      await fetchFn(`${cmsUrl}/items/user_profiles/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quiz_streak_days })
      });
    } catch {
      /* non-critical */
    }
  }

  return { quiz_streak_days };
}
