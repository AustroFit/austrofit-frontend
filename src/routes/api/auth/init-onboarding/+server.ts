// src/routes/api/auth/init-onboarding/+server.ts
// Setzt activity_group auf user_profiles direkt nach der Registrierung.
// Idempotent: wenn activity_group bereits gesetzt, wird sie nicht überschrieben.
import { json } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';
import { extractBearerToken, resolveUserId } from '$lib/server/auth';

const VALID_ACTIVITY_GROUPS = ['adult', 'senior', 'pregnant', 'chronic'] as const;

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

  const body = await request.json().catch(() => ({}));
  const activityGroup = VALID_ACTIVITY_GROUPS.includes(body?.activity_group)
    ? body.activity_group
    : 'adult';

  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}`
  };

  // Set activity_group on user_profiles (upsert)
  try {
    const profileListRes = await fetch(
      `${PUBLIC_CMSURL}/items/user_profiles?filter[user][_eq]=${userId}&fields=id,activity_group&limit=1`,
      { headers: adminHeaders }
    );
    if (profileListRes.ok) {
      const profileList = await profileListRes.json();
      const profile = profileList?.data?.[0];
      if (profile?.id) {
        // Idempotenz: activity_group nur setzen wenn noch nicht gesetzt
        if (!profile.activity_group) {
          await fetch(`${PUBLIC_CMSURL}/items/user_profiles/${profile.id}`, {
            method: 'PATCH',
            headers: adminHeaders,
            body: JSON.stringify({ activity_group: activityGroup })
          });
        }
      } else {
        await fetch(`${PUBLIC_CMSURL}/items/user_profiles`, {
          method: 'POST',
          headers: adminHeaders,
          body: JSON.stringify({ user: userId, activity_group: activityGroup })
        });
      }
    }
  } catch {
    /* non-critical – defaults to 'adult' on next read */
  }

  return json({ ok: true, activity_group: activityGroup });
}
