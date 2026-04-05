// src/routes/api/profile/+server.ts
// GET:  Basisinfo aus directus_users + Erweiterung aus user_profiles zusammenführen
// PATCH: first_name/last_name → PATCH /users/me
//        health_connected      → PATCH /items/user_profiles/{id}
//        onboarding_checklist_completed_at → PATCH /items/user_profiles/{id}
//
// DIRECTUS: "User" Policy braucht:
//   directus_users  → read  (filter: id = $CURRENT_USER, fields: *)
//   directus_users  → update (filter: id = $CURRENT_USER, fields: first_name, last_name)
//   user_profiles   → read   (permission 268, bereits vorhanden)
//   user_profiles   → update (permission 269, bereits vorhanden)
import { json } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';
import { extractBearerToken } from '$lib/server/auth';

const USER_FIELDS = 'id,first_name,last_name,email,date_created,avatar';
const PROFILE_FIELDS = 'id,streak_days,longest_streak,quiz_streak_days,health_connected,onboarding_completed,onboarding_checklist_completed_at,activity_group';

const HEALTH_CONNECT_BONUS_POINTS = 20;

export async function GET({ request, fetch }: { request: Request; fetch: typeof globalThis.fetch }) {
  const token = extractBearerToken(request) ?? '';
  if (!token) return json({ error: 'unauthorized' }, { status: 401 });

  // 1) User-ID via JWT ermitteln (Auth-Check)
  const meRes = await fetch(`${PUBLIC_CMSURL}/users/me?fields=id`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!meRes.ok) {
    return new Response(await meRes.text(), {
      status: meRes.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const meData = await meRes.json().catch(() => null);
  const userId = meData?.data?.id ?? null;
  if (!userId) return json({ error: 'Benutzer-ID nicht ermittelbar.' }, { status: 400 });

  // 2) Vollständige User-Daten via PRIVATE_CMS_STATIC_TOKEN (umgeht Feld-Restriktionen der User-Policy)
  const userRes = await fetch(`${PUBLIC_CMSURL}/users/${userId}?fields=${USER_FIELDS}`, {
    headers: { Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}` }
  });

  const userData = await userRes.json().catch(() => null);
  const user = userData?.data ?? {};

  // 3) Erweiterte Felder aus user_profiles (per user-ID filtern)
  const profileRes = await fetch(
    `${PUBLIC_CMSURL}/items/user_profiles?filter[user][_eq]=${userId}&fields=${PROFILE_FIELDS}&limit=1`,
    { headers: { Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}` } }
  );

  const profileData = profileRes.ok ? await profileRes.json().catch(() => null) : null;
  const profile = profileData?.data?.[0] ?? {};

  // 4) Zusammenführen und zurückgeben
  return json({
    data: {
      ...user,
      streak_days: profile.streak_days ?? 0,
      longest_streak: profile.longest_streak ?? 0,
      quiz_streak_days: profile.quiz_streak_days ?? 0,
      health_connected: profile.health_connected ?? false,
      onboarding_completed: profile.onboarding_completed ?? false,
      onboarding_checklist_completed_at: profile.onboarding_checklist_completed_at ?? null,
      activity_group: profile.activity_group ?? 'adult'
    }
  });
}

export async function PATCH({ request, fetch }: { request: Request; fetch: typeof globalThis.fetch }) {
  const token = extractBearerToken(request) ?? '';
  if (!token) return json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));

  // Felder auf die zwei Collections aufteilen
  const userPatch: Record<string, unknown> = {};
  const profilePatch: Record<string, unknown> = {};

  if (typeof body.first_name === 'string') userPatch.first_name = body.first_name.trim();
  if (typeof body.last_name === 'string') userPatch.last_name = body.last_name.trim();
  if (typeof body.health_connected === 'boolean') profilePatch.health_connected = body.health_connected;
  if (body.onboarding_checklist_completed_at === null || typeof body.onboarding_checklist_completed_at === 'string') {
    profilePatch.onboarding_checklist_completed_at = body.onboarding_checklist_completed_at;
  }
  if (['adult', 'senior', 'pregnant', 'chronic'].includes(body.activity_group)) {
    profilePatch.activity_group = body.activity_group;
  }

  if (!Object.keys(userPatch).length && !Object.keys(profilePatch).length) {
    return json({ error: 'no fields to update' }, { status: 400 });
  }

  // userId einmalig holen wenn für Uniqueness-Check oder profilePatch benötigt
  let cachedUserId: string | null = null;
  const needsUserId = !!userPatch.first_name || Object.keys(profilePatch).length > 0;
  if (needsUserId) {
    const meRes = await fetch(`${PUBLIC_CMSURL}/users/me?fields=id`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!meRes.ok) return json({ error: 'Benutzer nicht gefunden.' }, { status: meRes.status });
    cachedUserId = (await meRes.json().catch(() => null))?.data?.id ?? null;
    if (!cachedUserId) return json({ error: 'Benutzer-ID nicht ermittelbar.' }, { status: 400 });
  }

  // Uniqueness-Check für first_name (Benutzername)
  if (userPatch.first_name && cachedUserId) {
    const dupRes = await fetch(
      `${PUBLIC_CMSURL}/users?filter[first_name][_eq]=${encodeURIComponent(String(userPatch.first_name))}&filter[id][_neq]=${cachedUserId}&fields=id&limit=1`,
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
    const userId = cachedUserId!;

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

    // Health-Connect-Bonus: +20P einmalig beim ersten Verbinden
    if (profilePatch.health_connected === true) {
      const dedupParams = new URLSearchParams({
        'filter[user][_eq]': cachedUserId!,
        'filter[source_type][_eq]': 'onboarding_checklist',
        'filter[source_ref][_eq]': 'checklist-health-connected',
        fields: 'id',
        limit: '1'
      });
      const dedupRes = await fetch(
        `${PUBLIC_CMSURL}/items/points_ledger?${dedupParams}`,
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}` } }
      );
      const dedupData = dedupRes.ok ? await dedupRes.json().catch(() => null) : null;
      if ((dedupData?.data?.length ?? 0) === 0) {
        await fetch(`${PUBLIC_CMSURL}/items/points_ledger`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}` },
          body: JSON.stringify({
            user: cachedUserId,
            points_delta: HEALTH_CONNECT_BONUS_POINTS,
            source_type: 'onboarding_checklist',
            source_ref: 'checklist-health-connected',
            occurred_at: new Date().toISOString()
          })
        }).catch(() => { /* non-critical */ });
      }
    }
  }

  return json({ data: null });
}
