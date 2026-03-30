// src/lib/server/milestoneService.ts
// Server-side helper for awarding one-time milestone bonuses.
// Dedup is enforced via source_type='milestone' + source_ref='milestone-{slug}'.
import { MILESTONES, type MilestoneSlug } from '$lib/utils/milestones';

/**
 * Awards a milestone bonus if not already awarded for this user.
 * Returns true if newly awarded, false if already exists or on error.
 * Always non-throwing – safe to call without try/catch.
 */
export async function awardMilestoneIfNew(opts: {
  userId: string;
  slug: MilestoneSlug;
  cmsUrl: string;
  token: string;
  fetchFn: typeof globalThis.fetch;
}): Promise<boolean> {
  const { userId, slug, cmsUrl, token, fetchFn } = opts;
  const points = MILESTONES[slug];
  const ref = `milestone-${slug}`;
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  try {
    const params = new URLSearchParams({
      'filter[user][_eq]': userId,
      'filter[source_type][_eq]': 'milestone',
      'filter[source_ref][_eq]': ref,
      fields: 'id',
      limit: '1'
    });
    const dedupRes = await fetchFn(`${cmsUrl}/items/points_ledger?${params}`, { headers });
    if (!dedupRes.ok) return false;
    const db = await dedupRes.json();
    if ((db.data ?? []).length > 0) return false;

    const awardRes = await fetchFn(`${cmsUrl}/items/points_ledger`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        user: userId,
        points_delta: points,
        source_type: 'milestone',
        source_ref: ref,
        occurred_at: new Date().toISOString()
      })
    });
    return awardRes.ok;
  } catch {
    return false;
  }
}
