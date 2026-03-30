// src/lib/utils/streak.ts
// Pure client-safe utilities: points formula, streak calculation, tier rules.
// Server-only functions (updateStreak, updateQuizStreak) live in $lib/server/streak.ts.

/**
 * Calculates AustroFit points earned for a given step count.
 *   < 4.000 → 0P
 *   4.000–6.999 → 10P + 5P je angefangene 500 Schritte ab 4.000
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

// ── Streak tier rules ─────────────────────────────────────────────────────────

export interface StreakTierRule {
  id: string;
  bonus_type: string;
  tier: number;
  min_value: number;
  max_value: number | null;
  points: number;
}

/** Hardcoded fallback tiers (used when Directus is unreachable) */
export const FALLBACK_STREAK_TIERS: StreakTierRule[] = [
  // step_tag: daily step streak bonus (from day 2)
  { id: 'step_tag_t1', bonus_type: 'step_tag',    tier: 1, min_value: 2,  max_value: 13,  points: 20  },
  { id: 'step_tag_t2', bonus_type: 'step_tag',    tier: 2, min_value: 14, max_value: 27,  points: 30  },
  { id: 'step_tag_t3', bonus_type: 'step_tag',    tier: 3, min_value: 28, max_value: 55,  points: 45  },
  { id: 'step_tag_t4', bonus_type: 'step_tag',    tier: 4, min_value: 56, max_value: null, points: 60  },
  // step_week: weekly step milestone
  { id: 'step_week_t1', bonus_type: 'step_week',  tier: 1, min_value: 2,  max_value: 13,  points: 60  },
  { id: 'step_week_t2', bonus_type: 'step_week',  tier: 2, min_value: 14, max_value: 27,  points: 90  },
  { id: 'step_week_t3', bonus_type: 'step_week',  tier: 3, min_value: 28, max_value: 55,  points: 120 },
  { id: 'step_week_t4', bonus_type: 'step_week',  tier: 4, min_value: 56, max_value: null, points: 150 },
  // quiz_tag: daily quiz streak bonus (from day 2)
  { id: 'quiz_tag_t1', bonus_type: 'quiz_tag',    tier: 1, min_value: 2,  max_value: 6,   points: 5   },
  { id: 'quiz_tag_t2', bonus_type: 'quiz_tag',    tier: 2, min_value: 7,  max_value: 13,  points: 10  },
  { id: 'quiz_tag_t3', bonus_type: 'quiz_tag',    tier: 3, min_value: 14, max_value: 29,  points: 15  },
  { id: 'quiz_tag_t4', bonus_type: 'quiz_tag',    tier: 4, min_value: 30, max_value: null, points: 20  },
  // quiz_week: weekly quiz milestone
  { id: 'quiz_week_t1', bonus_type: 'quiz_week',  tier: 1, min_value: 2,  max_value: 14,  points: 30  },
  { id: 'quiz_week_t2', bonus_type: 'quiz_week',  tier: 2, min_value: 15, max_value: 21,  points: 50  },
  { id: 'quiz_week_t3', bonus_type: 'quiz_week',  tier: 3, min_value: 22, max_value: 35,  points: 75  },
  { id: 'quiz_week_t4', bonus_type: 'quiz_week',  tier: 4, min_value: 36, max_value: null, points: 100 },
  // cardio_week: consecutive full cardio weeks bonus
  { id: 'cardio_week_t1', bonus_type: 'cardio_week', tier: 1, min_value: 2,  max_value: 3,   points: 100 },
  { id: 'cardio_week_t2', bonus_type: 'cardio_week', tier: 2, min_value: 4,  max_value: 7,   points: 200 },
  { id: 'cardio_week_t3', bonus_type: 'cardio_week', tier: 3, min_value: 8,  max_value: 11,  points: 300 },
  { id: 'cardio_week_t4', bonus_type: 'cardio_week', tier: 4, min_value: 12, max_value: null, points: 400 },
];

// ── Directus tier cache ───────────────────────────────────────────────────────

let _tiersCache: { data: StreakTierRule[]; expiry: number } | null = null;
const TIERS_TTL_MS = 5 * 60 * 1000; // 5 Minuten

async function fetchStreakTiersFromDirectus(
  cmsUrl: string,
  token: string,
  fetchFn: typeof globalThis.fetch
): Promise<StreakTierRule[]> {
  const res = await fetchFn(
    `${cmsUrl}/items/streak_tiers?fields=id,bonus_type,tier,min_value,max_value,points&sort=bonus_type,tier&limit=50`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) return FALLBACK_STREAK_TIERS;
  const body = await res.json();
  const rows: StreakTierRule[] = body.data ?? [];
  return rows.length >= 16 ? rows : FALLBACK_STREAK_TIERS;
}

/** Lädt Streak-Tier-Regeln aus Directus (gecacht, Fallback auf hardcoded). */
export async function getStreakTiers(
  cmsUrl: string,
  token: string,
  fetchFn: typeof globalThis.fetch
): Promise<StreakTierRule[]> {
  if (_tiersCache && Date.now() < _tiersCache.expiry) return _tiersCache.data;
  try {
    const data = await fetchStreakTiersFromDirectus(cmsUrl, token, fetchFn);
    _tiersCache = { data, expiry: Date.now() + TIERS_TTL_MS };
    return data;
  } catch {
    return FALLBACK_STREAK_TIERS;
  }
}

/** Gibt den Bonus für einen gegebenen Wert und Bonus-Typ zurück (0 wenn kein Tier passt). */
export function lookupTierBonus(value: number, tiers: StreakTierRule[], bonusType: string): number {
  const match = tiers.find(
    (t) => t.bonus_type === bonusType && value >= t.min_value && (t.max_value === null || value <= t.max_value)
  );
  return match?.points ?? 0;
}
