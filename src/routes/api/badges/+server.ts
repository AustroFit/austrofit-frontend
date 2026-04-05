// src/routes/api/badges/+server.ts
//
// GET  – Alle publizierten Badges mit earned-Flag + new_unlock-Flag.
//         Schreibt neu verdiente Badges lazy in user_earned_badges.
//
// PATCH – Markiert Badges als gesehen (shown_at setzen).
//          Body: { badge_ids: number[] }
import { json } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN, DIRECTUS_READ_TOKEN } from '$env/static/private';
import { extractBearerToken, resolveUserId } from '$lib/server/auth';

interface DirectusBadge {
  id: number;
  slug: string;
  name: string;
  description: string;
  hint: string;
  step_threshold: number;
  condition_type: string;
  kategorie: string;
  typ: string;
  sort: number;
  images: string | null;
}

interface EarnedEntry {
  id: number;
  badge: number;
  earned_at: string;
  shown_at: string | null;
}

export async function GET({ request, fetch }: { request: Request; fetch: typeof globalThis.fetch }) {
  const token = extractBearerToken(request);
  if (!token) return json({ error: 'unauthorized' }, { status: 401 });

  const userId = await resolveUserId(token, PUBLIC_CMSURL, fetch);
  if (!userId) return json({ error: 'unauthorized' }, { status: 401 });

  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}`
  };

  // ── 1. Badges + Profil + bereits verdiente Einträge parallel laden ──
  const [badgesRes, profileRes, earnedRes] = await Promise.all([
    fetch(
      `${PUBLIC_CMSURL}/items/Badges?filter[status][_eq]=published&sort[]=sort&limit=-1` +
        `&fields=id,slug,name,description,hint,step_threshold,condition_type,kategorie,typ,sort,images`,
      { headers: { Authorization: `Bearer ${DIRECTUS_READ_TOKEN}` } }
    ),
    fetch(
      `${PUBLIC_CMSURL}/items/user_profiles?filter[user][_eq]=${userId}&fields=totalSteps&limit=1`,
      { headers: adminHeaders }
    ),
    fetch(
      `${PUBLIC_CMSURL}/items/user_earned_badges?filter[user][_eq]=${userId}` +
        `&fields=id,badge,earned_at,shown_at&limit=-1`,
      { headers: adminHeaders }
    )
  ]);

  const badgesData = badgesRes.ok ? await badgesRes.json().catch(() => null) : null;
  const profileData = profileRes.ok ? await profileRes.json().catch(() => null) : null;
  const earnedData = earnedRes.ok ? await earnedRes.json().catch(() => null) : null;

  const badges: DirectusBadge[] = badgesData?.data ?? [];
  const totalSteps = Number(profileData?.data?.[0]?.totalSteps ?? 0);
  const earnedEntries: EarnedEntry[] = earnedData?.data ?? [];

  // ── 2. Lookup-Maps ──
  const earnedByBadgeId = new Map<number, EarnedEntry>(
    earnedEntries.map((e) => [e.badge, e])
  );

  // ── 3. Neu verdiente Badges in user_earned_badges schreiben (lazy upsert) ──
  const nowIso = new Date().toISOString();
  const newlyEarned = badges.filter(
    (b) =>
      b.condition_type === 'total_steps' &&
      totalSteps >= b.step_threshold &&
      !earnedByBadgeId.has(b.id)
  );

  if (newlyEarned.length > 0) {
    // Migration-Erkennung: Hatte der User bereits Schritte aber noch keine user_earned_badges-Einträge,
    // sind das Altdaten vor diesem Feature. Wir schreiben sie mit shown_at=now → kein Overlay-Spam.
    // Neue User (totalSteps=0) oder User die nach dem Feature-Launch Badges verdienen: shown_at=null.
    const isMigration = earnedEntries.length === 0 && totalSteps > 0;
    const shownAt = isMigration ? nowIso : null;

    await Promise.all(
      newlyEarned.map((b) =>
        fetch(`${PUBLIC_CMSURL}/items/user_earned_badges`, {
          method: 'POST',
          headers: adminHeaders,
          body: JSON.stringify({
            user: userId,
            badge: b.id,
            earned_at: nowIso,
            shown_at: shownAt
          })
        }).catch(() => {
          /* non-critical – Badge-Tracking ist nie blockierend */
        })
      )
    );

    // Neue Einträge in die lokale Map aufnehmen für den Response
    for (const b of newlyEarned) {
      earnedByBadgeId.set(b.id, { id: 0, badge: b.id, earned_at: nowIso, shown_at: shownAt });
    }
  }

  // ── 4. Response zusammenbauen ──
  const result = badges.map((b) => {
    const entry = earnedByBadgeId.get(b.id);
    const earned = !!entry;
    return {
      ...b,
      earned,
      earned_at: entry?.earned_at ?? null,
      new_unlock: earned && !entry?.shown_at,
      image_url: b.images ? `${PUBLIC_CMSURL}/assets/${b.images}` : null
    };
  });

  return json({ badges: result, total_steps: totalSteps });
}

// ── PATCH: Badges als gesehen markieren ────────────────────────────────────
export async function PATCH({ request, fetch }: { request: Request; fetch: typeof globalThis.fetch }) {
  const token = extractBearerToken(request);
  if (!token) return json({ error: 'unauthorized' }, { status: 401 });

  const userId = await resolveUserId(token, PUBLIC_CMSURL, fetch);
  if (!userId) return json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const badgeIds: number[] = body?.badge_ids ?? [];
  if (badgeIds.length === 0) return json({ ok: true });

  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}`
  };

  // Einträge des Users für diese Badge-IDs holen
  const listRes = await fetch(
    `${PUBLIC_CMSURL}/items/user_earned_badges` +
      `?filter[user][_eq]=${userId}&filter[badge][_in]=${badgeIds.join(',')}` +
      `&filter[shown_at][_null]=true&fields=id&limit=${badgeIds.length}`,
    { headers: adminHeaders }
  );

  if (!listRes.ok) return json({ ok: true });

  const listData = await listRes.json().catch(() => null);
  const entries: { id: number }[] = listData?.data ?? [];

  const nowIso = new Date().toISOString();
  await Promise.all(
    entries.map((e) =>
      fetch(`${PUBLIC_CMSURL}/items/user_earned_badges/${e.id}`, {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({ shown_at: nowIso })
      }).catch(() => {})
    )
  );

  return json({ ok: true });
}
