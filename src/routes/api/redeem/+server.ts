// src/routes/api/redeem/+server.ts
// POST: Reward einlösen
//   Body: { reward_id: string }
//   Header: Authorization: Bearer <user-jwt>
//
// Ablauf:
//   1. User-JWT → user_id ermitteln
//   2. Reward validieren (active)
//   3. Punkte-Check (user_punkte >= reward.points_cost)
//   4. reward_redemptions-Eintrag erstellen
//   5. Negative points_ledger-Buchung erstellen
//   6. Gutschein-Objekt zurückgeben (code = coupon_code aus Reward)
import { json } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN, DIRECTUS_READ_TOKEN } from '$env/static/private';
import { extractBearerToken, resolveUserId } from '$lib/server/auth';

export async function POST({ request, fetch }: { request: Request; fetch: typeof globalThis.fetch }) {
  const token = extractBearerToken(request);
  if (!token) return json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { reward_id } = body as { reward_id?: string };
  if (!reward_id) return json({ error: 'reward_id fehlt' }, { status: 400 });

  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}`
  };
  const readHeaders = { Authorization: `Bearer ${DIRECTUS_READ_TOKEN}` };

  // 1) User-ID ermitteln
  const user_id = await resolveUserId(token, PUBLIC_CMSURL, fetch);
  if (!user_id) return json({ error: 'Nicht eingeloggt' }, { status: 401 });

  // 2) Reward laden und validieren (Read-Token hat Lesezugriff auf rewards)
  const rewardRes = await fetch(
    `${PUBLIC_CMSURL}/items/rewards/${reward_id}?fields=id,title,description,points_cost,active,coupon_code,partner_id.name`,
    { headers: readHeaders }
  );
  if (!rewardRes.ok) return json({ error: 'Angebot nicht gefunden' }, { status: 404 });
  const rewardBody = await rewardRes.json();
  const reward = rewardBody?.data;
  if (!reward?.active) return json({ error: 'Angebot ist nicht mehr aktiv' }, { status: 400 });

  // 3) Punkte-Check
  const ledgerRes = await fetch(
    `${PUBLIC_CMSURL}/items/points_ledger?filter[user][_eq]=${user_id}&aggregate[sum]=points_delta&limit=1`,
    { headers: adminHeaders }
  );
  if (!ledgerRes.ok) return json({ error: 'Punktestand konnte nicht geladen werden' }, { status: 500 });
  const ledgerBody = await ledgerRes.json();
  const totalPoints: number = Number(ledgerBody?.data?.[0]?.sum?.points_delta ?? 0);

  if (totalPoints < reward.points_cost) {
    return json(
      { error: `Nicht genug Punkte. Du hast ${totalPoints}P, benötigst ${reward.points_cost}P.` },
      { status: 400 }
    );
  }

  // 4) reward_redemptions-Eintrag erstellen
  const now = new Date().toISOString();
  const ablaeuft_am = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

  const redemptionRes = await fetch(`${PUBLIC_CMSURL}/items/reward_redemptions`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      user: user_id,
      reward: Number(reward_id),
      points_cost: reward.points_cost,
      status: 'active',
      created_at: now
    })
  });

  if (!redemptionRes.ok) {
    const t = await redemptionRes.text();
    return json({ error: 'Einlösung konnte nicht gespeichert werden', details: t }, { status: 500 });
  }

  // Directus kann bei manchen Konfigurationen eine leere Antwort liefern (204)
  const redemptionText = await redemptionRes.text();
  let redemptionId: string = 'unknown';
  if (redemptionText) {
    try {
      const parsed = JSON.parse(redemptionText);
      redemptionId = String(parsed?.data?.id ?? 'unknown');
    } catch { /* leere oder ungültige Antwort – ID bleibt 'unknown' */ }
  }

  // 5) Negative Punkte-Buchung
  const ledgerCreateRes = await fetch(`${PUBLIC_CMSURL}/items/points_ledger`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      user: user_id,
      points_delta: -Math.abs(reward.points_cost),
      source_type: 'einloesung',
      source_ref: `reward_redemptions:${redemptionId}`,
      occurred_at: now
    })
  });

  if (!ledgerCreateRes.ok) {
    const t = await ledgerCreateRes.text();
    return json(
      {
        error: 'Punkte-Abzug fehlgeschlagen. Bitte Support kontaktieren.',
        details: t
      },
      { status: 500 }
    );
  }

  // Unique code derived from redemption ID – deterministic, no schema change needed.
  // Falls redemptionId eine Zahl ist: AF-000042; falls UUID: letzte 8 Zeichen.
  const codeBase = /^\d+$/.test(redemptionId)
    ? String(redemptionId).padStart(6, '0')
    : redemptionId.slice(-8).toUpperCase();
  const code = `AF-${codeBase}`;

  return json({
    gutschein: {
      id: redemptionId,
      code,
      ablaeuft_am,
      reward_titel: reward.title,
      punkte_kosten: reward.points_cost,
      partner_name: reward?.partner_id?.name ?? ''
    }
  });
}
