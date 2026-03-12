// src/routes/api/awin/webhook/+server.ts
// POST: AWIN Transaction-Webhook
// AWIN schickt bei jeder Commission-Transaktion eine Benachrichtigung.
// Phase 1: Logging + Basis-Validierung.
// Phase 2: User-Attribution via clickref → Bonus-Punkte vergeben.
import { json } from '@sveltejs/kit';
import { AWIN_API_TOKEN } from '$env/dynamic/private';

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

export async function POST({ request }) {
  // AWIN authentifiziert sich via Bearer-Token im Header
  const auth = request.headers.get('Authorization') ?? '';
  if (!auth.startsWith('Bearer ') || auth.slice(7) !== AWIN_API_TOKEN) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: AwinTransaction | null = null;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, { status: 400 });
  }

  console.log('[AWIN Webhook]', JSON.stringify({
    id: body?.id,
    advertiserId: body?.advertiserId,
    status: body?.status,
    commission: body?.commissionAmount,
    sale: body?.saleAmount,
    clickRef: body?.clickRef,
    date: body?.transactionDate
  }));

  // TODO Phase 2: Bei status='confirmed' und clickRef vorhanden:
  // → Bonus-Punkte für User (clickRef = userId) vergeben
  // → z. B. 10P pro bestätigter AWIN-Transaktion

  return json({ received: true });
}
