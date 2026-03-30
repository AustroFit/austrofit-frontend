// src/routes/api/awin/my-unlocks/+server.ts
// GET: Alle freigeschalteten Online-Rabattcodes des eingeloggten Users.
// Liest points_ledger (source_type='awin_unlock') + reichert mit Daten aus online_promotions an.
// Der Code selbst wird NICHT zurückgegeben – Client holt ihn via localStorage
// oder ruft /api/awin/unlock-code idempotent neu ab.
import { json } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';
import { extractBearerToken, resolveUserId } from '$lib/server/auth';

export interface AwinUnlockEntry {
  promoId: string;
  programId: number | null;
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

  // 1. Freigeschaltete Promo-IDs aus Ledger laden
  const ledgerParams = new URLSearchParams({
    'filter[user][_eq]': userId,
    'filter[source_type][_eq]': 'awin_unlock',
    fields: 'source_ref,occurred_at',
    sort: '-occurred_at',
    limit: '100'
  });

  const res = await fetch(`${PUBLIC_CMSURL}/items/points_ledger?${ledgerParams}`, {
    headers: adminHeaders
  });

  if (!res.ok) {
    return json({ error: 'Daten konnten nicht geladen werden' }, { status: 500 });
  }

  const body = await res.json();
  const entries: { source_ref: string; occurred_at: string }[] = body.data ?? [];

  // Deduplizieren + Reihenfolge merken
  const seen = new Set<string>();
  const orderedPromoIds: string[] = [];
  const unlockedAtMap = new Map<string, string>();

  for (const entry of entries) {
    const promoId = entry.source_ref.replace(/^awin_unlock:/, '');
    if (seen.has(promoId)) continue;
    seen.add(promoId);
    orderedPromoIds.push(promoId);
    unlockedAtMap.set(promoId, entry.occurred_at);
  }

  if (orderedPromoIds.length === 0) return json({ data: [] });

  // 2. Promo-Daten aus Directus laden (alle Stati – für History auch archivierte)
  const promoParams = new URLSearchParams({
    'filter[id][_in]': orderedPromoIds.join(','),
    fields: 'id,network,network_advertiser_id,partner_name,description,end_date,points_cost',
    limit: '100'
  });

  const promosRes = await fetch(`${PUBLIC_CMSURL}/items/online_promotions?${promoParams}`, {
    headers: adminHeaders
  });

  const promoMap = new Map<
    string,
    {
      network: string;
      network_advertiser_id: string | null;
      partner_name: string;
      description: string;
      end_date: string;
      points_cost: number;
    }
  >();

  if (promosRes.ok) {
    const promosBody = await promosRes.json();
    for (const p of promosBody.data ?? []) {
      promoMap.set(p.id, p);
    }
  }

  // 3. Ergebnis zusammenbauen (Originalreihenfolge aus Ledger beibehalten)
  const now = new Date();
  const unlocks: AwinUnlockEntry[] = [];

  for (const promoId of orderedPromoIds) {
    const promo = promoMap.get(promoId);
    if (!promo) continue; // Promo aus Directus gelöscht – überspringen

    const networkId =
      promo.network_advertiser_id ? Number(promo.network_advertiser_id) : null;

    unlocks.push({
      promoId,
      programId: isNaN(networkId as number) ? null : networkId,
      programName: promo.partner_name,
      description: promo.description,
      pointsCost: promo.points_cost,
      endDate: promo.end_date,
      unlockedAt: unlockedAtMap.get(promoId) ?? '',
      isExpired: new Date(promo.end_date) <= now
    });
  }

  return json({ data: unlocks });
}
