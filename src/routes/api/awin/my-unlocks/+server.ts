// src/routes/api/awin/my-unlocks/+server.ts
// GET: Alle freigeschalteten AWIN-Rabattcodes des eingeloggten Users.
// Liest points_ledger (source_type='awin_unlock') + reichert mit Promo-Daten an.
// Der Code selbst wird NICHT zurückgegeben – Client holt ihn via localStorage
// oder ruft /api/awin/unlock-code idempotent neu ab.
import { json } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';
import { extractBearerToken, resolveUserId } from '$lib/server/auth';
import { findPromoWithProgram } from '$lib/data/awinManualPromotions';

export interface AwinUnlockEntry {
  promoId: string;
  programId: number;
  programName: string;
  description: string;
  pointsCost: number;
  endDate: string;
  unlockedAt: string;
  isExpired: boolean;
}

export async function GET({ request, fetch }) {
  const token = extractBearerToken(request);
  if (!token) return json({ error: 'Nicht eingeloggt' }, { status: 401 });

  const userId = await resolveUserId(token, PUBLIC_CMSURL, fetch);
  if (!userId) return json({ error: 'Nicht eingeloggt' }, { status: 401 });

  const adminHeaders = { Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}` };

  const params = new URLSearchParams({
    'filter[user][_eq]': userId,
    'filter[source_type][_eq]': 'awin_unlock',
    fields: 'source_ref,occurred_at',
    sort: '-occurred_at',
    limit: '100'
  });

  const res = await fetch(`${PUBLIC_CMSURL}/items/points_ledger?${params}`, {
    headers: adminHeaders
  });

  if (!res.ok) {
    return json({ error: 'Daten konnten nicht geladen werden' }, { status: 500 });
  }

  const body = await res.json();
  const entries: { source_ref: string; occurred_at: string }[] = body.data ?? [];

  const now = new Date();
  const seen = new Set<string>();
  const unlocks: AwinUnlockEntry[] = [];

  for (const entry of entries) {
    // source_ref format: 'awin_unlock:{promoId}'
    const promoId = entry.source_ref.replace(/^awin_unlock:/, '');
    if (seen.has(promoId)) continue; // deduplizieren (sollte nicht vorkommen)
    seen.add(promoId);

    const found = findPromoWithProgram(promoId);
    if (!found) continue; // unbekannte/entfernte Promo – überspringen

    unlocks.push({
      promoId,
      programId: found.advertiserId,
      programName: found.programName,
      description: found.promo.description,
      pointsCost: found.promo.pointsCost,
      endDate: found.promo.endDate,
      unlockedAt: entry.occurred_at,
      isExpired: new Date(found.promo.endDate) <= now
    });
  }

  return json({ data: unlocks });
}
