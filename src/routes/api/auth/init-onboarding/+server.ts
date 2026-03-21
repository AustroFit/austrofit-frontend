// src/routes/api/auth/init-onboarding/+server.ts
// Setzt onboarding_booster_until (Datetime) direkt nach der Registrierung.
// Idempotent: wenn bereits gesetzt, wird nichts geändert.
import { json } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';
import { extractBearerToken, resolveUserId } from '$lib/server/auth';

const BOOSTER_DAYS = 7;

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

  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}`
  };

  // Idempotenz-Check: nur setzen wenn noch nicht gesetzt
  const profileRes = await fetch(
    `${PUBLIC_CMSURL}/users/${userId}?fields=onboarding_booster_until`,
    { headers: adminHeaders }
  );
  if (profileRes.ok) {
    const profile = await profileRes.json();
    if (profile?.data?.onboarding_booster_until) {
      return json({ already_set: true, booster_until: profile.data.onboarding_booster_until });
    }
  }

  const boosterUntil = new Date();
  boosterUntil.setDate(boosterUntil.getDate() + BOOSTER_DAYS);

  await fetch(`${PUBLIC_CMSURL}/users/${userId}`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({ onboarding_booster_until: boosterUntil.toISOString() })
  });

  return json({ ok: true, booster_until: boosterUntil.toISOString() });
}
