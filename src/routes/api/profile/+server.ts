// src/routes/api/profile/+server.ts
// GET:  Basisinfo aus directus_users + Erweiterung aus user_profiles zusammenführen
// PATCH: first_name/last_name → PATCH /users/me
//        health_connected      → PATCH /items/user_profiles/{id}
//
// DIRECTUS: "User" Policy braucht:
//   directus_users  → read  (filter: id = $CURRENT_USER, fields: *)
//   directus_users  → update (filter: id = $CURRENT_USER, fields: first_name, last_name)
//   user_profiles   → read   (permission 268, bereits vorhanden)
//   user_profiles   → update (permission 269, bereits vorhanden)
import { json } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';

const USER_FIELDS = 'id,first_name,last_name,email,date_created,avatar';
const PROFILE_FIELDS = 'id,streak_days,longest_streak,health_connected,onboarding_completed';

export async function GET({ request, fetch }: { request: Request; fetch: typeof globalThis.fetch }) {
  const token = (request.headers.get('authorization') ?? '').replace('Bearer ', '');
  if (!token) return json({ error: 'unauthorized' }, { status: 401 });

  // 1) Basisdaten aus directus_users
  const userRes = await fetch(`${PUBLIC_CMSURL}/users/me?fields=${USER_FIELDS}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!userRes.ok) {
    return new Response(await userRes.text(), {
      status: userRes.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const userData = await userRes.json().catch(() => null);
  const user = userData?.data ?? {};

  // 2) Erweiterte Felder aus user_profiles (per user-ID filtern)
  const profileRes = await fetch(
    `${PUBLIC_CMSURL}/items/user_profiles?filter[user][_eq]=${user.id}&fields=${PROFILE_FIELDS}&limit=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const profileData = profileRes.ok ? await profileRes.json().catch(() => null) : null;
  const profile = profileData?.data?.[0] ?? {};

  // 3) Zusammenführen und zurückgeben
  return json({
    data: {
      ...user,
      streak_days: profile.streak_days ?? 0,
      longest_streak: profile.longest_streak ?? 0,
      health_connected: profile.health_connected ?? false,
      onboarding_completed: profile.onboarding_completed ?? false
    }
  });
}

export async function PATCH({ request, fetch }: { request: Request; fetch: typeof globalThis.fetch }) {
  const token = (request.headers.get('authorization') ?? '').replace('Bearer ', '');
  if (!token) return json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));

  // Felder auf die zwei Collections aufteilen
  const userPatch: Record<string, unknown> = {};
  const profilePatch: Record<string, unknown> = {};

  if (typeof body.first_name === 'string') userPatch.first_name = body.first_name.trim();
  if (typeof body.last_name === 'string') userPatch.last_name = body.last_name.trim();
  if (typeof body.health_connected === 'boolean') profilePatch.health_connected = body.health_connected;

  if (!Object.keys(userPatch).length && !Object.keys(profilePatch).length) {
    return json({ error: 'no fields to update' }, { status: 400 });
  }

  // Uniqueness-Check für first_name (Benutzername)
  if (userPatch.first_name) {
    // Aktuellen User ermitteln, um ihn vom Check auszuschließen
    const meCheckRes = await fetch(`${PUBLIC_CMSURL}/users/me?fields=id`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (meCheckRes.ok) {
      const currentUserId = (await meCheckRes.json().catch(() => null))?.data?.id;
      if (currentUserId) {
        const dupRes = await fetch(
          `${PUBLIC_CMSURL}/users?filter[first_name][_eq]=${encodeURIComponent(String(userPatch.first_name))}&filter[id][_neq]=${currentUserId}&fields=id&limit=1`,
          { headers: { Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}` } }
        );
        if (dupRes.ok) {
          const dupData = await dupRes.json().catch(() => null);
          if ((dupData?.data?.length ?? 0) > 0) {
            return json(
              { error: 'Dieser Benutzername ist bereits vergeben – bitte wähle einen anderen.' },
              { status: 409 }
            );
          }
        }
      }
    }
  }

  // PATCH directus_users (first_name, last_name)
  if (Object.keys(userPatch).length) {
    const res = await fetch(`${PUBLIC_CMSURL}/users/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(userPatch)
    });

    if (res.status === 401) {
      return json({ error: 'Sitzung abgelaufen – bitte neu einloggen.' }, { status: 401 });
    }
    if (!res.ok) {
      const errBody = await res.json().catch(() => null);
      return json(
        { error: errBody?.errors?.[0]?.message ?? `Fehler (${res.status})` },
        { status: res.status }
      );
    }
  }

  // PATCH user_profiles (health_connected, …)
  if (Object.keys(profilePatch).length) {
    // User-ID ermitteln
    const meRes = await fetch(`${PUBLIC_CMSURL}/users/me?fields=id`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!meRes.ok) return json({ error: 'Benutzer nicht gefunden.' }, { status: meRes.status });
    const userId = (await meRes.json().catch(() => null))?.data?.id;
    if (!userId) return json({ error: 'Benutzer-ID nicht ermittelbar.' }, { status: 400 });

    // user_profile-ID für diesen User ermitteln
    const profileListRes = await fetch(
      `${PUBLIC_CMSURL}/items/user_profiles?filter[user][_eq]=${userId}&fields=id&limit=1`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const profileId = profileListRes.ok
      ? (await profileListRes.json().catch(() => null))?.data?.[0]?.id
      : null;

    if (!profileId) return json({ error: 'Profil nicht gefunden.' }, { status: 404 });

    const patchRes = await fetch(`${PUBLIC_CMSURL}/items/user_profiles/${profileId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(profilePatch)
    });

    if (!patchRes.ok) {
      const errBody = await patchRes.json().catch(() => null);
      return json(
        { error: errBody?.errors?.[0]?.message ?? `Fehler (${patchRes.status})` },
        { status: patchRes.status }
      );
    }
  }

  return json({ data: null });
}
