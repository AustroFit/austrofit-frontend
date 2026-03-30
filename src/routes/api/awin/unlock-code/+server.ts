// src/routes/api/awin/unlock-code/+server.ts
// POST: Online-Rabattcode mit Punkten freischalten.
// Body: { promoId: string }
// Ablauf:
//   1. Auth prüfen
//   2. Promo aus Directus laden (inkl. code)
//   3. Prüfen ob User diesen Code bereits freigeschaltet hat (idempotent)
//   4. Punktestand prüfen
//   5. Punkte abziehen + Code zurückgeben
import { json } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';
import { extractBearerToken, resolveUserId } from '$lib/server/auth';

export async function POST({ request, fetch }) {
  const token = extractBearerToken(request);
  if (!token) return json({ error: 'Nicht eingeloggt' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { promoId } = body as { promoId?: string };
  if (!promoId) return json({ error: 'promoId fehlt' }, { status: 400 });

  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}`
  };

  // Promo aus Directus laden (inkl. code)
  const promoRes = await fetch(
    `${PUBLIC_CMSURL}/items/online_promotions/${encodeURIComponent(promoId)}?fields=id,code,end_date,points_cost`,
    { headers: adminHeaders }
  );
  if (promoRes.status === 403 || promoRes.status === 404) {
    return json({ error: 'Unbekannte Promotion' }, { status: 404 });
  }
  if (!promoRes.ok) {
    return json({ error: 'Fehler beim Laden der Promotion' }, { status: 500 });
  }
  const promo = (await promoRes.json()).data as {
    id: string;
    code: string;
    end_date: string;
    points_cost: number;
  } | null;
  if (!promo) return json({ error: 'Unbekannte Promotion' }, { status: 404 });

  // Abgelaufen?
  if (new Date(promo.end_date) <= new Date()) {
    return json({ error: 'Dieser Rabattcode ist abgelaufen' }, { status: 410 });
  }

  const userId = await resolveUserId(token, PUBLIC_CMSURL, fetch);
  if (!userId) return json({ error: 'Nicht eingeloggt' }, { status: 401 });

  // Bereits freigeschaltet? (idempotent – kein doppelter Abzug)
  const unlockRef = `awin_unlock:${promoId}`;
  const dupParams = new URLSearchParams({
    'filter[user][_eq]': userId,
    'filter[source_type][_eq]': 'awin_unlock',
    'filter[source_ref][_eq]': unlockRef,
    fields: 'id',
    limit: '1'
  });
  const dupRes = await fetch(`${PUBLIC_CMSURL}/items/points_ledger?${dupParams}`, {
    headers: adminHeaders
  });
  if (dupRes.ok) {
    const dupBody = await dupRes.json();
    if ((dupBody.data ?? []).length > 0) {
      return json({ code: promo.code, alreadyUnlocked: true });
    }
  }

  // Punktestand prüfen
  const ledgerRes = await fetch(
    `${PUBLIC_CMSURL}/items/points_ledger?filter[user][_eq]=${userId}&aggregate[sum]=points_delta&limit=1`,
    { headers: adminHeaders }
  );
  if (!ledgerRes.ok) {
    return json({ error: 'Punktestand konnte nicht geladen werden' }, { status: 500 });
  }
  const ledgerBody = await ledgerRes.json();
  const totalPoints: number = Number(ledgerBody?.data?.[0]?.sum?.points_delta ?? 0);

  if (totalPoints < promo.points_cost) {
    return json(
      { error: `Nicht genug Punkte. Du hast ${totalPoints}P, benötigst ${promo.points_cost}P.`, totalPoints },
      { status: 400 }
    );
  }

  // Punkte abziehen
  const deductRes = await fetch(`${PUBLIC_CMSURL}/items/points_ledger`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      user: userId,
      points_delta: -promo.points_cost,
      source_type: 'awin_unlock',
      source_ref: unlockRef,
      occurred_at: new Date().toISOString()
    })
  });

  if (!deductRes.ok) {
    const t = await deductRes.text();
    console.error('[awin/unlock-code] Punkte-Abzug fehlgeschlagen:', t);
    return json({ error: 'Punkte konnten nicht abgezogen werden' }, { status: 500 });
  }

  return json({ code: promo.code, alreadyUnlocked: false, pointsSpent: promo.points_cost });
}
