// src/lib/server/streak.ts
// Server-only streak update functions. Import client-safe utilities from $lib/utils/streak.ts.
import { awardMilestoneIfNew } from '$lib/server/milestoneService';
import {
  calculateStreakDays,
  getStreakTiers,
  lookupTierBonus
} from '$lib/utils/streak';

/**
 * Full server-side streak update for steps.
 * Reads step history from Directus, recalculates streak (only ≥7.000-Schritte-Tage),
 * patches the user profile, and awards tiered bonuses:
 *   Streak-Tag-Bonus: +20/30/45/60 P täglich (Tier 1–4)
 *   Streak-Wochen-Bonus: +60/90/120/150 P nach je 7 Streak-Tagen (Tier 1–4)
 * Also awards one-time milestones for first occurrences.
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
  milestone_streak4_awarded: boolean;
}> {
  const { cmsUrl, token, userToken, fetchFn } = opts;
  const qualifiesForStreak = steps >= 7000;

  // Tier-Regeln laden (Fallback auf hardcoded wenn Directus nicht erreichbar)
  const tiers = await getStreakTiers(cmsUrl, token, fetchFn);

  // 1. Fetch step entries (last 60 days) – nur ≥7.000-Schritte-Tage zählen
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
        .filter((e: any) => Number(e.points_delta ?? 0) >= 40)
        .map((e: any) => (e.source_ref ?? '').split('T')[0])
        .filter((d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d));
    }
  } catch {
    /* non-critical */
  }

  // 2. Streak berechnen
  const streak_days = calculateStreakDays(qualifiedDates, qualifiesForStreak ? newDate : '');

  // 3. longest_streak + profileId
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

  // 4. user_profiles upsert
  try {
    if (profileId) {
      await fetchFn(`${cmsUrl}/items/user_profiles/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ streak_days, longest_streak })
      });
    } else {
      await fetchFn(`${cmsUrl}/items/user_profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user: userId, streak_days, longest_streak })
      });
    }
  } catch {
    /* non-critical */
  }

  // 5. Streak-Tag-Bonus (tiered): ab dem 2. aufeinanderfolgenden ≥7k-Tag
  let streak_tag_bonus_awarded = false;
  const tagBonus = lookupTierBonus(streak_days, tiers, 'step_tag');
  if (qualifiesForStreak && tagBonus > 0) {
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
            points_delta: tagBonus,
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

    // Milestone: Erster Streak-Tag-Bonus (Tag 2) – einmalig
    if (streak_days === 2) {
      awardMilestoneIfNew({ userId, slug: 'first_step_streak_day', cmsUrl, token, fetchFn });
    }
  }

  // 6. Streak-Wochen-Bonus (tiered): nach je 7 Streak-Tag-Bonus-Tagen
  let streak_bonus_awarded = false;
  if (streak_days > 1 && (streak_days - 1) % 7 === 0) {
    const weekBonus = lookupTierBonus(streak_days, tiers, 'step_week');
    try {
      const bonusRes = await fetchFn(`${cmsUrl}/items/points_ledger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          user: userId,
          points_delta: weekBonus,
          source_type: 'streak',
          source_ref: `streak-${streak_days}d-${newDate}`,
          occurred_at: new Date().toISOString()
        })
      });
      streak_bonus_awarded = bonusRes.ok;
    } catch {
      /* non-critical */
    }

    // Einmal-Milestones für die ersten 4 Wochen
    if (streak_days === 8)  awardMilestoneIfNew({ userId, slug: 'first_step_streak_week',  cmsUrl, token, fetchFn });
    if (streak_days === 15) awardMilestoneIfNew({ userId, slug: 'second_step_streak_week', cmsUrl, token, fetchFn });
    if (streak_days === 22) awardMilestoneIfNew({ userId, slug: 'third_step_streak_week',  cmsUrl, token, fetchFn });
    if (streak_days === 29) awardMilestoneIfNew({ userId, slug: 'fourth_step_streak_week', cmsUrl, token, fetchFn });
  }

  // 7. Milestone: Erste 4-Tage-Streak – einmalig, +80P
  let milestone_streak4_awarded = false;
  if (qualifiesForStreak && streak_days === 4) {
    try {
      milestone_streak4_awarded = await awardMilestoneIfNew({
        userId, slug: 'first_streak_4', cmsUrl, token, fetchFn
      });
    } catch {
      /* non-critical */
    }
  }

  return { streak_days, longest_streak, streak_bonus_awarded, streak_tag_bonus_awarded, milestone_streak4_awarded };
}

/**
 * Server-side quiz streak update.
 * Reads all passed quiz_attempts for the user, calculates consecutive days
 * up to today, patches user_profiles.quiz_streak_days, and awards tiered bonuses:
 *   Streak-Tag-Bonus: +5/10/15/20 P täglich (Tier 1–4, ab Tag 2)
 *   Wochen-Bonus: +30/50/75/100 P nach je 7 Quiz-Streak-Tagen (Tier 1–4)
 * Also awards one-time milestones for first occurrences.
 *
 * Call after /api/claim has set user on the attempts.
 */
export async function updateQuizStreak(
  userId: string,
  opts: { cmsUrl: string; token: string; userToken?: string; fetchFn: typeof fetch }
): Promise<{ quiz_streak_days: number }> {
  const { cmsUrl, token, userToken, fetchFn } = opts;

  // Tier-Regeln laden (Fallback auf hardcoded wenn Directus nicht erreichbar)
  const tiers = await getStreakTiers(cmsUrl, token, fetchFn);

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

  // 4. Quiz-Streak-Tag-Bonus (tiered): ab Tag 2 täglich
  const dailyBonus = lookupTierBonus(quiz_streak_days, tiers, 'quiz_tag');
  if (dailyBonus > 0) {
    const dedupParams = new URLSearchParams({
      'filter[user][_eq]': userId,
      'filter[source_type][_eq]': 'streak_quiz',
      'filter[source_ref][_eq]': today,
      fields: 'id',
      limit: '1'
    });
    try {
      const dedupRes = await fetchFn(`${cmsUrl}/items/points_ledger?${dedupParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (dedupRes.ok) {
        const db = await dedupRes.json();
        if ((db.data ?? []).length === 0) {
          await fetchFn(`${cmsUrl}/items/points_ledger`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              user: userId,
              points_delta: dailyBonus,
              source_type: 'streak_quiz',
              source_ref: today,
              occurred_at: new Date().toISOString()
            })
          });
        }
      }
    } catch {
      /* non-critical */
    }

    // Milestone: Erster Quiz-Streak-Tag-Bonus (Tag 2) – einmalig
    if (quiz_streak_days === 2) {
      awardMilestoneIfNew({ userId, slug: 'first_quiz_streak_day', cmsUrl, token, fetchFn });
    }
  }

  // 5. Milestone: Erste 4-Tage-Quiz-Streak – einmalig, +80P
  if (quiz_streak_days === 4) {
    awardMilestoneIfNew({ userId, slug: 'first_quiz_streak_4', cmsUrl, token, fetchFn });
  }

  // 6. Quiz-Wochen-Bonus (tiered): nach je 7 Quiz-Streak-Tagen
  if (quiz_streak_days > 1 && (quiz_streak_days - 1) % 7 === 0) {
    const weekBonus = lookupTierBonus(quiz_streak_days, tiers, 'quiz_week');
    const bonusRef = `quiz-streak-${quiz_streak_days}d-${today}`;
    const dedupParams = new URLSearchParams({
      'filter[user][_eq]': userId,
      'filter[source_type][_eq]': 'streak',
      'filter[source_ref][_eq]': bonusRef,
      fields: 'id',
      limit: '1'
    });
    try {
      const dedupRes = await fetchFn(`${cmsUrl}/items/points_ledger?${dedupParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (dedupRes.ok) {
        const db = await dedupRes.json();
        if ((db.data ?? []).length === 0) {
          await fetchFn(`${cmsUrl}/items/points_ledger`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              user: userId,
              points_delta: weekBonus,
              source_type: 'streak',
              source_ref: bonusRef,
              occurred_at: new Date().toISOString()
            })
          });
        }
      }
    } catch {
      /* non-critical */
    }

    // Einmal-Milestones für die ersten 4 Quiz-Wochen
    if (quiz_streak_days === 8)  awardMilestoneIfNew({ userId, slug: 'first_quiz_streak_week',  cmsUrl, token, fetchFn });
    if (quiz_streak_days === 15) awardMilestoneIfNew({ userId, slug: 'second_quiz_streak_week', cmsUrl, token, fetchFn });
    if (quiz_streak_days === 22) awardMilestoneIfNew({ userId, slug: 'third_quiz_streak_week',  cmsUrl, token, fetchFn });
    if (quiz_streak_days === 29) awardMilestoneIfNew({ userId, slug: 'fourth_quiz_streak_week', cmsUrl, token, fetchFn });
  }

  return { quiz_streak_days };
}
