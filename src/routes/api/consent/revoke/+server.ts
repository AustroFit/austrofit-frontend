import { json } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';
import { extractBearerToken, resolveUserId } from '$lib/server/auth';

export async function POST({ request, fetch }: { request: Request; fetch: typeof globalThis.fetch }) {
  const userToken = extractBearerToken(request);
  if (!userToken) return json({ error: 'Nicht autorisiert' }, { status: 401 });

  const userId = await resolveUserId(userToken, PUBLIC_CMSURL, fetch);
  if (!userId) return json({ error: 'Nicht autorisiert' }, { status: 401 });

  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}`
  };

  const profileListRes = await fetch(
    `${PUBLIC_CMSURL}/items/user_profiles?filter[user][_eq]=${userId}&fields=id&limit=1`,
    { headers: adminHeaders }
  );
  if (!profileListRes.ok) return json({ error: 'Profil nicht gefunden.' }, { status: 404 });

  const profileId = (await profileListRes.json().catch(() => null))?.data?.[0]?.id;
  if (!profileId) return json({ error: 'Profil nicht gefunden.' }, { status: 404 });

  const revokedAt = new Date().toISOString();
  const patchRes = await fetch(`${PUBLIC_CMSURL}/items/user_profiles/${profileId}`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({
      gesundheitsdaten_consent_revoked_at: revokedAt,
      health_connected: false
    })
  });

  if (!patchRes.ok) {
    const err = await patchRes.json().catch(() => null);
    return json({ error: err?.errors?.[0]?.message ?? `Fehler (${patchRes.status})` }, { status: patchRes.status });
  }

  return json({ ok: true, revoked_at: revokedAt });
}
