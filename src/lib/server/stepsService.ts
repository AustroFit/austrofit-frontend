// src/lib/server/stepsService.ts
// Shared server-side logic for recording step entries.
// Used by /api/steps/manual and /api/steps/sync.
import { calculatePoints } from '$lib/utils/streak';
import { updateStreak } from '$lib/server/streak';
import { awardMilestoneIfNew } from '$lib/server/milestoneService';

// Fraud cap: Blueprint Phase 1 Minimalschutz – max 20.000 Schritte pro Eintrag (≈ 20K/h Spike-Filter)
const STEPS_FRAUD_CAP = 20_000;

export interface StepEntryResult {
  success: boolean;
  skipped: boolean;              // duplicate – already recorded for this date
  punkte: number;
  ledger_id: string | null;
  neue_streak_days: number;
  longest_streak: number;
  streak_bonus_awarded: boolean;      // Wochen-Bonus (alle 7 Streak-Tage)
  streak_tag_bonus_awarded: boolean;  // Tag-Bonus (pro Tag mit ≥7.000 Schritten im Streak)
  milestone_step_awarded: boolean;    // first_step: erstes Tagesziel (7.000 Schritte), einmalig
  milestone_streak4_awarded: boolean; // first_streak_4: erste 4-Tage-Streak, einmalig
  capped: boolean;               // true wenn Schrittzahl auf STEPS_FRAUD_CAP begrenzt wurde
}

export async function recordStepEntry(params: {
  userId: string;
  date: string;
  steps: number;
  mode: 'automatic' | 'manual';
  cmsUrl: string;
  adminToken: string;
  userToken?: string;
  fetchFn: typeof globalThis.fetch;
}): Promise<StepEntryResult> {
  const { userId, date, cmsUrl, adminToken, userToken, fetchFn } = params;

  // Apply fraud cap before any processing
  const rawSteps = params.steps;
  const steps = Math.min(rawSteps, STEPS_FRAUD_CAP);
  const capped = steps < rawSteps;

  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`
  };

  // Duplicate check – one step entry per user per date
  const dupParams = new URLSearchParams({
    'filter[user][_eq]': userId,
    'filter[source_type][_eq]': 'schritte',
    'filter[source_ref][_eq]': date,
    fields: 'id',
    limit: '1'
  });
  const dupRes = await fetchFn(`${cmsUrl}/items/points_ledger?${dupParams}`, {
    headers: adminHeaders
  });
  if (dupRes.ok) {
    const dupBody = await dupRes.json();
    if ((dupBody.data ?? []).length > 0) {
      return {
        success: true,
        skipped: true,
        punkte: 0,
        ledger_id: null,
        neue_streak_days: 0,
        longest_streak: 0,
        streak_bonus_awarded: false,
        streak_tag_bonus_awarded: false,
        milestone_step_awarded: false,
        milestone_streak4_awarded: false,
        capped: false
      };
    }
  }

  // Calculate points
  const punkte = calculatePoints(steps);

  // Create step ledger entry (always – even 0P, so dedup works for low-step days)
  const ledgerRes = await fetchFn(`${cmsUrl}/items/points_ledger`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      user: userId,
      points_delta: punkte,
      source_type: 'schritte',
      source_ref: date,
      occurred_at: new Date(date + 'T12:00:00').toISOString()
    })
  });

  if (!ledgerRes.ok) {
    throw new Error('Eintrag konnte nicht gespeichert werden');
  }

  const lb = await ledgerRes.json();
  const ledger_id: string | null = lb?.data?.id ?? null;

  // Milestone: Erstes Tagesziel (7.000 Schritte) – einmalig, +40P
  let milestone_step_awarded = false;
  if (steps >= 7000) {
    try {
      milestone_step_awarded = await awardMilestoneIfNew({
        userId, slug: 'first_step', cmsUrl, token: adminToken, fetchFn
      });
    } catch {
      /* non-critical */
    }
  }

  // total_steps in user_profiles inkrementieren (non-critical)
  try {
    const profileParams = new URLSearchParams({
      'filter[user][_eq]': userId,
      fields: 'id,total_steps',
      limit: '1'
    });
    const profileRes = await fetchFn(`${cmsUrl}/items/user_profiles?${profileParams}`, {
      headers: adminHeaders
    });
    if (profileRes.ok) {
      const pb = await profileRes.json();
      const profile = pb.data?.[0];
      if (profile?.id) {
        await fetchFn(`${cmsUrl}/items/user_profiles/${profile.id}`, {
          method: 'PATCH',
          headers: adminHeaders,
          body: JSON.stringify({ total_steps: Number(profile.total_steps ?? 0) + steps })
        });
      }
    }
  } catch {
    /* non-critical */
  }

  // Update streak (non-blocking – error doesn't fail the request)
  let streakResult = {
    streak_days: 0,
    longest_streak: 0,
    streak_bonus_awarded: false,
    streak_tag_bonus_awarded: false,
    milestone_streak4_awarded: false
  };
  try {
    streakResult = await updateStreak(userId, date, steps, {
      cmsUrl,
      token: adminToken,
      userToken,
      fetchFn
    });
  } catch (e) {
    console.warn('[stepsService] streak update failed:', e);
  }

  return {
    success: true,
    skipped: false,
    punkte,
    ledger_id,
    neue_streak_days: streakResult.streak_days,
    longest_streak: streakResult.longest_streak,
    streak_bonus_awarded: streakResult.streak_bonus_awarded,
    streak_tag_bonus_awarded: streakResult.streak_tag_bonus_awarded,
    milestone_step_awarded,
    milestone_streak4_awarded: streakResult.milestone_streak4_awarded,
    capped
  };
}
