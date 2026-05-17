// src/routes/api/cardio/sync/+server.ts
// POST { workouts: WorkoutInput[], platform: 'android' | 'ios' }
// Aggregates weekly cardio activity and awards points via cardioService.
import { json } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';
import { extractBearerToken, resolveUserInfo } from '$lib/server/auth';
import { recordCardioEntry, type ActivityGroup, type WorkoutInput } from '$lib/server/cardioService';

export async function POST({
  request,
  fetch
}: {
  request: Request;
  fetch: typeof globalThis.fetch;
}) {
  const userToken = extractBearerToken(request);
  if (!userToken) return json({ error: 'Nicht autorisiert' }, { status: 401 });

  const userInfo = await resolveUserInfo(userToken, PUBLIC_CMSURL, fetch);
  if (!userInfo) return json({ error: 'Nicht autorisiert' }, { status: 401 });
  const userId = userInfo.id;

  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.workouts) || body.workouts.length > 50) {
    return json({ error: 'Ungültige Anfrage' }, { status: 400 });
  }

  // Filter out workouts before user registration date and validate fields
  const registrationDate = userInfo.date_created ? userInfo.date_created.split('T')[0] : null;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const nowMs = Date.now();
  const maxPastMs = 90 * 24 * 60 * 60 * 1000;
  const maxFutureMs = 2 * 24 * 60 * 60 * 1000;
  const workouts: WorkoutInput[] = (body.workouts as WorkoutInput[]).filter((w) => {
    if (!dateRegex.test(w.date)) return false;
    const dMs = Date.parse(w.date + 'T12:00:00Z');
    if (isNaN(dMs) || dMs < nowMs - maxPastMs || dMs > nowMs + maxFutureMs) return false;
    if (!w.startDate || isNaN(Date.parse(w.startDate))) return false;
    if (registrationDate && w.date < registrationDate) return false;
    return true;
  });
  const platform: string = body.platform ?? 'android';
  const source = platform === 'ios' ? 'healthkit' : 'health_connect';

  // Read activity_group from user_profiles (default: 'adult')
  let activityGroup: ActivityGroup = 'adult';
  try {
    const profileRes = await fetch(
      `${PUBLIC_CMSURL}/items/user_profiles?filter[user][_eq]=${userId}&fields=activity_group&limit=1`,
      { headers: { Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}` } }
    );
    if (profileRes.ok) {
      const profileData = await profileRes.json();
      const group = profileData?.data?.[0]?.activity_group;
      if (['adult', 'senior', 'pregnant', 'chronic'].includes(group)) {
        activityGroup = group as ActivityGroup;
      }
    }
  } catch {
    /* default to 'adult' */
  }

  try {
    const result = await recordCardioEntry({
      userId,
      workouts,
      activityGroup,
      source,
      cmsUrl: PUBLIC_CMSURL,
      adminToken: PRIVATE_CMS_STATIC_TOKEN,
      fetchFn: fetch
    });

    return json(result);
  } catch (e) {
    console.error('[cardio/sync]', e);
    return json({ error: 'Fehler beim Speichern' }, { status: 500 });
  }
}
