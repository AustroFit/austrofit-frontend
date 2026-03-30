// src/lib/server/cardioService.ts
import { awardMilestoneIfNew } from '$lib/server/milestoneService';
import { getStreakTiers, lookupTierBonus } from '$lib/utils/streak';
// Server-side logic for recording weekly cardio activity entries.
// Called from /api/cardio/sync.
//
// Design (Option C): At each sync, re-aggregate all workouts for the current
// week. If a cardio ledger entry for this week already exists, compute the
// delta and write a correction entry. This avoids retroactive edits to
// the append-only ledger while keeping points accurate.

export type ActivityGroup = 'adult' | 'senior' | 'pregnant' | 'chronic';

export interface WorkoutInput {
  workoutType: string;   // Plugin WorkoutType: 'running', 'cycling', etc.
  durationSeconds: number;
  date: string;          // YYYY-MM-DD local date
  startDate: string;     // ISO 8601 (for activity_logs)
  endDate: string;       // ISO 8601 (for activity_logs)
  sourceName?: string;
}

export interface CardioSyncResult {
  success: boolean;
  weekKey: string;
  equivalentMinutes: number;
  pointsTotal: number;
  pointsDelta: number;       // new points awarded this sync (0 if no change)
  activityLogsCreated: number;
  ledgerEntryId: string | null;
  skipped: boolean;          // true if no scoreable workouts in input
}

// ── Hardcoded fallbacks (used when Directus is unreachable) ────────────────

const FALLBACK_INTENSE_TYPES = new Set(['running', 'cycling', 'crossTraining']);
const FALLBACK_MODERATE_TYPES = new Set(['walking', 'hiking', 'stairClimbing', 'elliptical', 'other']);

export const WEEKLY_TARGETS: Record<ActivityGroup, { start: number; full: number }> = {
  adult:    { start: 50,  full: 150 },
  senior:   { start: 50,  full: 150 },
  pregnant: { start: 50,  full: 150 },
  chronic:  { start: 35,  full: 100 },
};

// ── Directus config cache ──────────────────────────────────────────────────

interface CardioConfig {
  weeklyTargets: Record<ActivityGroup, { start: number; full: number }>;
  intenseTypes: Set<string>;
  moderateTypes: Set<string>;
}

let _configCache: { data: CardioConfig; expiry: number } | null = null;
const CONFIG_TTL_MS = 5 * 60 * 1000; // 5 Minuten

async function fetchCardioConfigFromDirectus(
  cmsUrl: string,
  adminToken: string,
  fetchFn: typeof globalThis.fetch
): Promise<CardioConfig> {
  const headers = { Authorization: `Bearer ${adminToken}` };

  const [targetsRes, typesRes] = await Promise.all([
    fetchFn(`${cmsUrl}/items/cardio_targets?fields=activity_group,start_minutes,full_minutes&limit=10`, { headers }),
    fetchFn(`${cmsUrl}/items/workout_types?fields=workout_type,intensity&limit=100`, { headers })
  ]);

  // cardio_targets
  let weeklyTargets = WEEKLY_TARGETS;
  if (targetsRes.ok) {
    const body = await targetsRes.json();
    const rows: { activity_group: string; start_minutes: number; full_minutes: number }[] = body.data ?? [];
    const built: Partial<Record<ActivityGroup, { start: number; full: number }>> = {};
    for (const r of rows) {
      built[r.activity_group as ActivityGroup] = { start: r.start_minutes, full: r.full_minutes };
    }
    if (built.adult && built.senior && built.pregnant && built.chronic) {
      weeklyTargets = built as Record<ActivityGroup, { start: number; full: number }>;
    }
  }

  // workout_types
  let intenseTypes = FALLBACK_INTENSE_TYPES;
  let moderateTypes = FALLBACK_MODERATE_TYPES;
  if (typesRes.ok) {
    const body = await typesRes.json();
    const rows: { workout_type: string; intensity: string }[] = body.data ?? [];
    if (rows.length > 0) {
      intenseTypes = new Set(rows.filter((r) => r.intensity === 'intense').map((r) => r.workout_type));
      moderateTypes = new Set(rows.filter((r) => r.intensity === 'moderate').map((r) => r.workout_type));
    }
  }

  return { weeklyTargets, intenseTypes, moderateTypes };
}

async function getCardioConfig(
  cmsUrl: string,
  adminToken: string,
  fetchFn: typeof globalThis.fetch
): Promise<CardioConfig> {
  if (_configCache && Date.now() < _configCache.expiry) return _configCache.data;
  try {
    const data = await fetchCardioConfigFromDirectus(cmsUrl, adminToken, fetchFn);
    _configCache = { data, expiry: Date.now() + CONFIG_TTL_MS };
    return data;
  } catch {
    return { weeklyTargets: WEEKLY_TARGETS, intenseTypes: FALLBACK_INTENSE_TYPES, moderateTypes: FALLBACK_MODERATE_TYPES };
  }
}

/** Wochenziele für eine Aktivitätsgruppe – für externe Nutzung (z.B. cardio/summary) */
export async function getWeeklyTargets(
  cmsUrl: string,
  adminToken: string,
  fetchFn: typeof globalThis.fetch
): Promise<Record<ActivityGroup, { start: number; full: number }>> {
  const config = await getCardioConfig(cmsUrl, adminToken, fetchFn);
  return config.weeklyTargets;
}

// ── Intensity mapping ──────────────────────────────────────────────────────

function getEquivalentMinutes(
  workoutType: string,
  durationSeconds: number,
  activityGroup: ActivityGroup,
  intenseTypes: Set<string>,
  moderateTypes: Set<string>
): number {
  const durationMinutes = durationSeconds / 60;
  if (intenseTypes.has(workoutType)) {
    // pregnant: intense activities count as moderate (1×) per WHO guidelines
    const multiplier = activityGroup === 'pregnant' ? 1 : 2;
    return Math.round(durationMinutes * multiplier);
  }
  if (moderateTypes.has(workoutType)) {
    return Math.round(durationMinutes);
  }
  return 0; // not counted
}

// ── Points formula ─────────────────────────────────────────────────────────

/**
 * Calculates weekly cardio points for a given number of equivalent minutes.
 * All groups: 200P at full target (group-specific threshold).
 * Rate below full target: 15P per started 10 min above start threshold.
 * At/above full target: enforced 200P minimum + 15P per started 10 min over.
 */
export function calculateCardioPoints(
  eqMinutes: number,
  activityGroup: ActivityGroup,
  targets: Record<ActivityGroup, { start: number; full: number }> = WEEKLY_TARGETS
): number {
  const target = targets[activityGroup] ?? targets.adult;
  if (eqMinutes < target.start) return 0;
  if (eqMinutes >= target.full) {
    return 200 + Math.ceil((eqMinutes - target.full) / 10) * 15;
  }
  return 50 + Math.ceil((eqMinutes - target.start) / 10) * 15;
}

// ── Week key helper ────────────────────────────────────────────────────────

export function getWeekKey(date: Date = new Date()): string {
  // ISO week: week starts on Monday
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayOfWeek = d.getUTCDay() || 7; // Sunday=7
  d.setUTCDate(d.getUTCDate() + 4 - dayOfWeek);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

// ── Main export ────────────────────────────────────────────────────────────

export async function recordCardioEntry(params: {
  userId: string;
  workouts: WorkoutInput[];
  activityGroup: ActivityGroup;
  source: 'health_connect' | 'healthkit';
  cmsUrl: string;
  adminToken: string;
  fetchFn: typeof globalThis.fetch;
}): Promise<CardioSyncResult> {
  const { userId, workouts, activityGroup, source, cmsUrl, adminToken, fetchFn } = params;

  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`
  };

  // Konfiguration aus Directus laden (Fallback: hardcoded Werte)
  const { weeklyTargets, intenseTypes, moderateTypes } = await getCardioConfig(cmsUrl, adminToken, fetchFn);

  const weekKey = getWeekKey();
  const sourceRef = `cardio-${weekKey}`;

  // Filter to only workouts from the current ISO week
  const currentWeekStart = getWeekStartDate();
  const scoreable = workouts.filter((w) => {
    if (getEquivalentMinutes(w.workoutType, w.durationSeconds, activityGroup, intenseTypes, moderateTypes) === 0) return false;
    return w.date >= currentWeekStart;
  });

  if (scoreable.length === 0) {
    return {
      success: true,
      weekKey,
      equivalentMinutes: 0,
      pointsTotal: 0,
      pointsDelta: 0,
      activityLogsCreated: 0,
      ledgerEntryId: null,
      skipped: true
    };
  }

  // ── Step 1: Write activity_logs first (dedup by workout_type+date+weekKey) ──
  // Must happen before points calculation so the DB reflects the full cumulative week total.
  let activityLogsCreated = 0;
  for (const w of scoreable) {
    const eqMin = getEquivalentMinutes(w.workoutType, w.durationSeconds, activityGroup, intenseTypes, moderateTypes);
    const logDupParams = new URLSearchParams({
      'filter[user_id][_eq]': userId,
      'filter[workout_type][_eq]': w.workoutType,
      'filter[date][_eq]': w.date,
      'filter[week_key][_eq]': weekKey,
      fields: 'id',
      limit: '1'
    });
    try {
      const logDupRes = await fetchFn(`${cmsUrl}/items/activity_logs?${logDupParams}`, {
        headers: adminHeaders
      });
      if (logDupRes.ok) {
        const logDupBody = await logDupRes.json();
        if ((logDupBody.data ?? []).length > 0) continue; // already logged
      }
    } catch {
      /* non-critical */
    }

    try {
      const logRes = await fetchFn(`${cmsUrl}/items/activity_logs`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          user_id: userId,
          date: w.date,
          week_key: weekKey,
          workout_type: w.workoutType,
          duration_seconds: w.durationSeconds,
          equivalent_minutes: eqMin,
          source,
          imported_at: new Date().toISOString()
        })
      });
      if (logRes.ok) activityLogsCreated++;
    } catch {
      /* non-critical */
    }
  }

  // ── Step 2: Query cumulative eq minutes from all activity_logs this week ──
  // This makes points accumulate correctly across multiple syncs (e.g. manual test entries
  // submitted one at a time, or multiple health sync calls throughout the day).
  let totalEqMinutes: number | null = null;
  try {
    const weekLogsParams = new URLSearchParams({
      'filter[user_id][_eq]': userId,
      'filter[week_key][_eq]': weekKey,
      fields: 'equivalent_minutes',
      limit: '100'
    });
    const weekLogsRes = await fetchFn(`${cmsUrl}/items/activity_logs?${weekLogsParams}`, {
      headers: adminHeaders
    });
    if (weekLogsRes.ok) {
      const weekLogsBody = await weekLogsRes.json();
      totalEqMinutes = (weekLogsBody.data ?? []).reduce(
        (sum: number, log: { equivalent_minutes: number }) => sum + Number(log.equivalent_minutes ?? 0),
        0
      );
    }
  } catch {
    /* fallback below */
  }

  // Fallback: sum from current input if DB query failed
  if (totalEqMinutes === null) {
    totalEqMinutes = scoreable.reduce(
      (sum, w) => sum + getEquivalentMinutes(w.workoutType, w.durationSeconds, activityGroup, intenseTypes, moderateTypes),
      0
    );
  }

  const pointsTotal = calculateCardioPoints(totalEqMinutes, activityGroup, weeklyTargets);

  // ── Step 3: Check existing ledger entry for this week ──
  const dupParams = new URLSearchParams({
    'filter[user][_eq]': userId,
    'filter[source_type][_eq]': 'cardio',
    'filter[source_ref][_eq]': sourceRef,
    fields: 'id,points_delta',
    limit: '1'
  });
  const dupRes = await fetchFn(`${cmsUrl}/items/points_ledger?${dupParams}`, {
    headers: adminHeaders
  });

  let existingPoints = 0;
  let existingLedgerId: string | null = null;
  if (dupRes.ok) {
    const dupBody = await dupRes.json();
    const existing = dupBody.data?.[0];
    if (existing) {
      existingPoints = Number(existing.points_delta ?? 0);
      existingLedgerId = existing.id ?? null;
    }
  }

  const pointsDelta = pointsTotal - existingPoints;

  // Write/update points_ledger entry
  let ledgerEntryId: string | null = existingLedgerId;

  if (pointsDelta === 0) {
    // No change – nothing to write
    return {
      success: true,
      weekKey,
      equivalentMinutes: totalEqMinutes,
      pointsTotal,
      pointsDelta: 0,
      activityLogsCreated,
      ledgerEntryId,
      skipped: false
    };
  }

  if (existingLedgerId === null) {
    // First entry for this week
    const ledgerRes = await fetchFn(`${cmsUrl}/items/points_ledger`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        user: userId,
        points_delta: pointsTotal,
        source_type: 'cardio',
        source_ref: sourceRef,
        occurred_at: new Date().toISOString()
      })
    });
    if (!ledgerRes.ok) throw new Error('Cardio-Ledger-Eintrag konnte nicht gespeichert werden');
    const lb = await ledgerRes.json();
    ledgerEntryId = lb?.data?.id ?? null;
  } else {
    // Update existing entry with new total (PATCH)
    await fetchFn(`${cmsUrl}/items/points_ledger/${existingLedgerId}`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ points_delta: pointsTotal })
    });
  }

  // Milestone: Erste gewertete Cardio-Woche – einmalig
  awardMilestoneIfNew({ userId, slug: 'first_cardio', cmsUrl, token: adminToken, fetchFn });

  // Cardio streak bonuses
  await awardCardioStreakBonuses({ userId, weekKey, cmsUrl, adminToken: adminToken, fetchFn });

  return {
    success: true,
    weekKey,
    equivalentMinutes: totalEqMinutes,
    pointsTotal,
    pointsDelta,
    activityLogsCreated,
    ledgerEntryId,
    skipped: false
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Returns YYYY-MM-DD of the Monday starting the current ISO week */
function getWeekStartDate(): string {
  const now = new Date();
  const day = now.getDay() || 7; // Sunday = 7
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day - 1));
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
}

/**
 * Awards the weekly cardio streak bonus.
 * Reads last 15 cardio ledger entries to cover up to Tier 4 (12+ consecutive weeks).
 * Dedup: one streak bonus per weekKey (source_ref: cardio-streak-{weekKey}).
 */
async function awardCardioStreakBonuses(opts: {
  userId: string;
  weekKey: string;
  cmsUrl: string;
  adminToken: string;
  fetchFn: typeof globalThis.fetch;
}): Promise<void> {
  const { userId, weekKey, cmsUrl, adminToken, fetchFn } = opts;
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` };

  // Read last 15 cardio ledger entries (covers up to Tier 4 at 12+ weeks)
  const params = new URLSearchParams({
    'filter[user][_eq]': userId,
    'filter[source_type][_eq]': 'cardio',
    fields: 'points_delta,source_ref',
    sort: '-occurred_at',
    limit: '15'
  });

  let entries: { points_delta: number; source_ref: string }[] = [];
  try {
    const res = await fetchFn(`${cmsUrl}/items/points_ledger?${params}`, { headers });
    if (res.ok) {
      const body = await res.json();
      entries = body.data ?? [];
    }
  } catch {
    return;
  }

  // Count consecutive full-target weeks (≥200P), most recent first
  let consecutiveFullWeeks = 0;
  for (const e of entries) {
    if (Number(e.points_delta ?? 0) >= 200) consecutiveFullWeeks++;
    else break;
  }

  const tiers = await getStreakTiers(cmsUrl, adminToken, fetchFn);
  const bonusAmount = lookupTierBonus(consecutiveFullWeeks, tiers, 'cardio_week');
  if (bonusAmount === 0) return;

  // Dedup: one streak bonus per weekKey
  const bonusRef = `cardio-streak-${weekKey}`;
  const dedupParams = new URLSearchParams({
    'filter[user][_eq]': userId,
    'filter[source_type][_eq]': 'streak',
    'filter[source_ref][_eq]': bonusRef,
    fields: 'id',
    limit: '1'
  });
  try {
    const dedupRes = await fetchFn(`${cmsUrl}/items/points_ledger?${dedupParams}`, { headers });
    if (dedupRes.ok) {
      const db = await dedupRes.json();
      if ((db.data ?? []).length > 0) return; // already awarded this week
    }
    await fetchFn(`${cmsUrl}/items/points_ledger`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        user: userId,
        points_delta: bonusAmount,
        source_type: 'streak',
        source_ref: bonusRef,
        occurred_at: new Date().toISOString()
      })
    });

    // Einmal-Milestones für die ersten 4 vollen Cardio-Wochen
    if (consecutiveFullWeeks === 2) awardMilestoneIfNew({ userId, slug: 'first_cardio_streak_week',  cmsUrl, token: adminToken, fetchFn });
    if (consecutiveFullWeeks === 3) awardMilestoneIfNew({ userId, slug: 'second_cardio_streak_week', cmsUrl, token: adminToken, fetchFn });
    if (consecutiveFullWeeks === 4) awardMilestoneIfNew({ userId, slug: 'third_cardio_streak_week',  cmsUrl, token: adminToken, fetchFn });
  } catch {
    /* non-critical */
  }
}
