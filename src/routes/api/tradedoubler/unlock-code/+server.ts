// src/routes/api/tradedoubler/unlock-code/+server.ts
// POST: Tradedoubler-Rabattcode mit Punkten freischalten.
// Body: { voucherId: string }
// Ablauf:
//   1. Auth prüfen
//   2. Voucher aus TD API laden
//   3. Prüfen ob User diesen Code bereits freigeschaltet hat (idempotent)
//   4. Punktestand prüfen
//   5. Punkte abziehen + Code zurückgeben
//   6. Voucher-Metadaten in ledger.meta speichern (für my-unlocks)
import { json } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';
import { extractBearerToken, resolveUserId } from '$lib/server/auth';
import { findTdVoucherById } from '$lib/server/tradedoubler';

export async function POST({ request, fetch }) {
  const token = extractBearerToken(request);
  if (!token) return json({ error: 'Nicht eingeloggt' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { voucherId } = body as { voucherId?: string };
  if (!voucherId) return json({ error: 'voucherId fehlt' }, { status: 400 });

  const voucher = await findTdVoucherById(voucherId, fetch);
  if (!voucher) return json({ error: 'Unbekannter Voucher' }, { status: 404 });

  // Abgelaufen?
  if (voucher.endDate && new Date(voucher.endDate) <= new Date()) {
    return json({ error: 'Dieser Rabattcode ist abgelaufen' }, { status: 410 });
  }

  const userId = await resolveUserId(token, PUBLIC_CMSURL, fetch);
  if (!userId) return json({ error: 'Nicht eingeloggt' }, { status: 401 });

  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}`
  };

  // Bereits freigeschaltet? (idempotent – kein doppelter Abzug)
  const unlockRef = `td_unlock:${voucherId}`;
  const dupParams = new URLSearchParams({
    'filter[user][_eq]': userId,
    'filter[source_type][_eq]': 'td_unlock',
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
      // Bereits freigeschaltet → Code kostenlos zurückgeben
      return json({ code: voucher.code, alreadyUnlocked: true });
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

  if (totalPoints < voucher.pointsCost) {
    return json(
      {
        error: `Nicht genug Punkte. Du hast ${totalPoints}P, benötigst ${voucher.pointsCost}P.`,
        totalPoints
      },
      { status: 400 }
    );
  }

  // Punkte abziehen + Metadaten speichern (für my-unlocks ohne erneuten API-Aufruf)
  const deductRes = await fetch(`${PUBLIC_CMSURL}/items/points_ledger`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      user: userId,
      points_delta: -voucher.pointsCost,
      source_type: 'td_unlock',
      source_ref: unlockRef,
      occurred_at: new Date().toISOString(),
      meta: {
        programId: voucher.programId,
        programName: voucher.programName,
        description: voucher.description,
        endDate: voucher.endDate,
        pointsCost: voucher.pointsCost
      }
    })
  });

  if (!deductRes.ok) {
    const t = await deductRes.text();
    console.error('[TD unlock-code] Punkte-Abzug fehlgeschlagen:', t);
    return json({ error: 'Punkte konnten nicht abgezogen werden' }, { status: 500 });
  }

  return json({ code: voucher.code, alreadyUnlocked: false, pointsSpent: voucher.pointsCost });
}
