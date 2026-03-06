// src/lib/utils/streak.ts
// Points formula and streak calculation helpers.
// updateStreak() is designed for server-side use (called from SvelteKit endpoints).

/**
 * Calculates AustroFit points earned for a given step count.
 *   < 4.000 → 0P
 *   4.000–6.999 → 10P
 *   ≥ 7.000 → 40P + floor((steps − 7.000) / 500) × 5P
 */
export function calculatePoints(steps: number): number {
  if (steps < 4000) return 0;
  if (steps < 7000) return 10;
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
 * Reads step history from Directus, recalculates streak, patches the user profile,
 * and awards a +60P streak-bonus when streak_days is a multiple of 7.
 *
 * Call from SvelteKit server endpoints only (needs admin token).
 */
export async function updateStreak(
  userId: string,
  newDate: string,
  opts: { cmsUrl: string; token: string; fetchFn: typeof fetch }
): Promise<{ streak_days: number; longest_streak: number; streak_bonus_awarded: boolean }> {
  const { cmsUrl, token, fetchFn } = opts;

  // 1. Fetch existing step entries (last 60 days)
  const params = new URLSearchParams({
    'filter[user][_eq]': userId,
    'filter[source_type][_eq]': 'schritte',
    fields: 'source_ref,occurred_at',
    sort: '-occurred_at',
    limit: '60'
  });

  let existingDates: string[] = [];
  try {
    const res = await fetchFn(`${cmsUrl}/items/points_ledger?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const body = await res.json();
      existingDates = (body.data ?? [])
        .map((e: any) => (e.source_ref ?? '').split('T')[0])
        .filter((d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d));
    }
  } catch {
    /* non-critical – streak calculation proceeds with newDate only */
  }

  // 2. Recalculate streak
  const streak_days = calculateStreakDays(existingDates, newDate);

  // 3. Get current longest_streak
  let prevLongest = 0;
  try {
    const profileRes = await fetchFn(`${cmsUrl}/users/${userId}?fields=longest_streak`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (profileRes.ok) {
      const pb = await profileRes.json();
      prevLongest = Number(pb.data?.longest_streak ?? 0);
    }
  } catch {
    /* non-critical */
  }
  const longest_streak = Math.max(streak_days, prevLongest);

  // 4. Patch user profile
  try {
    await fetchFn(`${cmsUrl}/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ streak_days, longest_streak })
    });
  } catch {
    /* non-critical */
  }

  // 5. 7-day streak bonus
  let streak_bonus_awarded = false;
  if (streak_days > 0 && streak_days % 7 === 0) {
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

  return { streak_days, longest_streak, streak_bonus_awarded };
}
