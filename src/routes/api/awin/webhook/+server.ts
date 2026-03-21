// src/routes/api/awin/webhook/+server.ts
// POST: AWIN Transaction-Webhook
// AWIN schickt bei jeder Commission-Transaktion eine Benachrichtigung.
// Phase 2: Bei confirmed → Punkte vergeben (saleAmount / 5, min 1P)
//          Bei declined  → Punkte-Storno (falls bereits vergeben)
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';

const AWIN_API_TOKEN = env.AWIN_API_TOKEN ?? '';

interface AwinTransaction {
  id: number;
  advertiserId: number;
  publisherId: number;
  transactionDate: string;
  clickDate: string;
  commissionAmount: { amount: number; currency: string };
  saleAmount: { amount: number; currency: string };
  clickRef: string | null;     // = AustroFit User-ID (wenn gesetzt)
  status: 'pending' | 'confirmed' | 'declined';
  publisherUrl: string;
}

const adminHeaders = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}`
};

/** Prüft ob ein Ledger-Eintrag für diese Transaktion bereits existiert */
async function findLedgerEntry(
  txId: number,
  sourceType: string,
  fetchFn: typeof globalThis.fetch
): Promise<{ id: string; points_delta: number } | null> {
  const params = new URLSearchParams({
    'filter[source_type][_eq]': sourceType,
    'filter[source_ref][_eq]': String(txId),
    fields: 'id,points_delta',
    limit: '1'
  });
  const res = await fetchFn(`${PUBLIC_CMSURL}/items/points_ledger?${params}`, {
    headers: adminHeaders
  });
  if (!res.ok) return null;
  const body = await res.json();
  return body?.data?.[0] ?? null;
}

export async function POST({ request, fetch }) {
  // AWIN authentifiziert sich via Bearer-Token im Header
  const auth = request.headers.get('Authorization') ?? '';
  if (!auth.startsWith('Bearer ') || auth.slice(7) !== AWIN_API_TOKEN) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  let tx: AwinTransaction | null = null;
  try {
    tx = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, { status: 400 });
  }

  console.log('[AWIN Webhook]', JSON.stringify({
    id: tx?.id,
    advertiserId: tx?.advertiserId,
    status: tx?.status,
    commission: tx?.commissionAmount,
    sale: tx?.saleAmount,
    clickRef: tx?.clickRef,
    date: tx?.transactionDate
  }));

  if (!tx?.id || !tx?.status) {
    return json({ error: 'Ungültige Transaktion' }, { status: 400 });
  }

  // Ohne clickRef keine Attribution möglich → nur loggen
  if (!tx.clickRef) {
    return json({ received: true, note: 'no_clickref' });
  }

  const txId = tx.id;
  const userId = tx.clickRef;

  // ── Phase 2a: CONFIRMED → Punkte vergeben ──────────────────────────────
  if (tx.status === 'confirmed') {
    // Dedup: wurde diese Transaktion schon verarbeitet?
    const existing = await findLedgerEntry(txId, 'awin_commission', fetch);
    if (existing) {
      return json({ received: true, note: 'already_processed' });
    }

    const saleAmount = tx.saleAmount?.amount ?? 0;
    const punkte = Math.max(1, Math.round(saleAmount / 5));

    const ledgerRes = await fetch(`${PUBLIC_CMSURL}/items/points_ledger`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        user: userId,
        points_delta: punkte,
        source_type: 'awin_commission',
        source_ref: String(txId),
        occurred_at: tx.transactionDate ?? new Date().toISOString()
      })
    });

    if (!ledgerRes.ok) {
      const t = await ledgerRes.text();
      console.error('[AWIN Webhook] Ledger-Eintrag fehlgeschlagen:', t);
      return json({ error: 'Punkte konnten nicht vergeben werden' }, { status: 500 });
    }

    console.log(`[AWIN Webhook] +${punkte}P für User ${userId} (Transaktion ${txId}, Sale ${saleAmount}${tx.saleAmount?.currency})`);
    return json({ received: true, punkte_vergeben: punkte });
  }

  // ── Phase 2b: DECLINED → Punkte stornieren ─────────────────────────────
  if (tx.status === 'declined') {
    // Prüfen ob wir Punkte vergeben haben
    const original = await findLedgerEntry(txId, 'awin_commission', fetch);
    if (!original) {
      // Keine Punkte vergeben gewesen (z.B. war noch pending) → nichts zu tun
      return json({ received: true, note: 'no_points_to_reverse' });
    }

    // Dedup: Storno bereits verbucht?
    const stornoExisting = await findLedgerEntry(txId, 'awin_storno', fetch);
    if (stornoExisting) {
      return json({ received: true, note: 'storno_already_processed' });
    }

    const stornoRes = await fetch(`${PUBLIC_CMSURL}/items/points_ledger`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        user: userId,
        points_delta: -Math.abs(original.points_delta),
        source_type: 'awin_storno',
        source_ref: String(txId),
        occurred_at: new Date().toISOString()
      })
    });

    if (!stornoRes.ok) {
      const t = await stornoRes.text();
      console.error('[AWIN Webhook] Storno fehlgeschlagen:', t);
      return json({ error: 'Storno fehlgeschlagen' }, { status: 500 });
    }

    console.log(`[AWIN Webhook] Storno -${original.points_delta}P für User ${userId} (Transaktion ${txId})`);
    return json({ received: true, storno: original.points_delta });
  }

  // pending → nichts tun, nur bestätigen
  return json({ received: true, note: 'pending_no_action' });
}
