// src/routes/api/cardio/sync/+server.ts
// POST { workouts: WorkoutInput[], platform: 'android' | 'ios' }
// Aggregates weekly cardio activity and awards points via cardioService.
import { json } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';
import { extractBearerToken, resolveUserId } from '$lib/server/auth';
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

  const userId = await resolveUserId(userToken, PUBLIC_CMSURL, fetch);
  if (!userId) return json({ error: 'Nicht autorisiert' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.workouts)) {
    return json({ error: 'Ungültige Anfrage' }, { status: 400 });
  }

  const workouts: WorkoutInput[] = body.workouts;
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
