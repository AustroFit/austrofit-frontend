// src/lib/server/awin.ts
// AWIN Publisher API v2 – Server-only (enthält Secrets)
// Promotions werden in Directus (Collection: online_promotions) gepflegt – kein Deploy nötig.

import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';

/** Promotion-Objekt das an den Client gesendet wird (KEIN code-Feld) */
export interface AwinPromotionPublic {
  id: string;
  type: string;
  description: string;
  endDate: string | null;
  pointsCost: number;
}

export interface AwinProgram {
  id: number;
  name: string;
  url: string;
  logoUrl: string | null;
  displayUrl: string;
  description: string | null;
  category: string | null;
  currencyCode: string;
  /** Nur Programme mit mindestens einer aktiven Promotion werden zurückgegeben */
  promotions: AwinPromotionPublic[];
}

/** Directus-Datensatz aus online_promotions */
interface OnlinePromotion {
  id: string;
  network: string;
  network_advertiser_id: string | null;
  partner_name: string;
  partner_url: string;
  logo_url: string | null;
  category: string | null;
  code: string;
  description: string;
  end_date: string;
  points_cost: number;
  status: string;
}

const AWIN_API_BASE = 'https://api.awin.com';

/**
 * Aktive (nicht abgelaufene) Promotions aus Directus laden.
 * Gibt leeres Array zurück wenn die Collection nicht erreichbar ist.
 */
async function fetchOnlinePromotions(fetchFn: typeof globalThis.fetch): Promise<OnlinePromotion[]> {
  const today = new Date().toISOString().split('T')[0];
  const params = new URLSearchParams({
    'filter[status][_eq]': 'active',
    'filter[end_date][_gte]': today,
    fields: 'id,network,network_advertiser_id,partner_name,partner_url,logo_url,category,description,end_date,points_cost',
    limit: '100'
  });

  const res = await fetchFn(`${PUBLIC_CMSURL}/items/online_promotions?${params}`, {
    headers: { Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}` }
  });

  if (!res.ok) {
    console.error(`[AWIN] Directus Promotions-Abruf fehlgeschlagen: ${res.status} ${res.statusText}`);
    return [];
  }

  const body = await res.json();
  return body.data ?? [];
}

/**
 * Alle genehmigten AWIN-Advertiser-Programme des Publishers abrufen.
 * Gibt leeres Array zurück wenn Publisher-ID noch nicht konfiguriert ist.
 */
export async function fetchAwinPrograms(
  apiToken: string,
  publisherId: string,
  fetchFn: typeof globalThis.fetch = fetch
): Promise<AwinProgram[]> {
  if (!publisherId || publisherId === 'DEINE_PUBLISHER_ID_HIER_EINTRAGEN') {
    return [];
  }

  const url = `${AWIN_API_BASE}/publishers/${publisherId}/programmes?relationship=joined`;
  const res = await fetchFn(url, {
    headers: { Authorization: `Bearer ${apiToken}` }
  });

  if (!res.ok) {
    console.error(`[AWIN] Programme-Abruf fehlgeschlagen: ${res.status} ${res.statusText}`);
    return [];
  }

  const data = await res.json();
  const programmes = Array.isArray(data) ? data : [];

  return programmes.map(
    (p: {
      id: number;
      name: string;
      url?: string;
      logoUrl?: string;
      displayUrl?: string;
      description?: string;
      primarySector?: { name?: string };
      currencyCode?: string;
    }) => ({
      id: p.id,
      name: p.name,
      url: p.url ?? '',
      logoUrl: p.logoUrl ?? null,
      displayUrl: p.displayUrl ?? p.url ?? '',
      description: p.description ?? null,
      category: p.primarySector?.name ?? null,
      currencyCode: p.currencyCode ?? 'EUR',
      promotions: []
    })
  );
}

/**
 * Online-Promotions als Programmliste servieren.
 * AWIN-Programme werden mit Daten aus der AWIN API angereichert wenn verfügbar.
 * Promotions anderer Netzwerke (Tradedoubler, direct) werden direkt aus Directus-Metadaten gebaut.
 * Code selbst wird NICHT mitgesendet (nur über /api/awin/unlock-code abrufbar).
 */
export async function fetchAwinProgramsWithPromotions(
  apiToken: string,
  publisherId: string,
  fetchFn: typeof globalThis.fetch = fetch
): Promise<AwinProgram[]> {
  // AWIN-Programme abrufen (optional – nur zur Datenanreicherung für AWIN-Promotions)
  let joinedPrograms: AwinProgram[] = [];
  try {
    joinedPrograms = await fetchAwinPrograms(apiToken, publisherId, fetchFn);
  } catch {
    /* AWIN API nicht erreichbar – Directus-Daten als Fallback */
  }
  const joinedMap = new Map(joinedPrograms.map((p) => [p.id, p]));

  // Alle aktiven Promotions aus Directus laden
  const promotions = await fetchOnlinePromotions(fetchFn);
  if (promotions.length === 0) return [];

  // Nach Partner gruppieren (network_advertiser_id oder partner_name als Schlüssel)
  // Verwende zusammengesetzten Schlüssel damit gleicher Advertiser über verschiedene
  // Netzwerke nicht zusammengemischt wird.
  const groupKey = (p: OnlinePromotion) =>
    p.network_advertiser_id ? `${p.network}:${p.network_advertiser_id}` : `direct:${p.partner_name}`;

  const byPartner = new Map<string, OnlinePromotion[]>();
  for (const promo of promotions) {
    const key = groupKey(promo);
    if (!byPartner.has(key)) byPartner.set(key, []);
    byPartner.get(key)!.push(promo);
  }

  const result: AwinProgram[] = [];
  let syntheticId = -1; // Negativer Fallback-ID für Nicht-AWIN-Partner

  for (const promos of byPartner.values()) {
    const first = promos[0];
    const awinId =
      first.network === 'awin' && first.network_advertiser_id
        ? Number(first.network_advertiser_id)
        : null;
    const joined = awinId !== null ? joinedMap.get(awinId) : undefined;

    const publicPromos: AwinPromotionPublic[] = promos.map((promo) => ({
      id: promo.id,
      type: 'voucher',
      description: promo.description,
      endDate: promo.end_date,
      pointsCost: promo.points_cost
      // code wird absichtlich NICHT mitgesendet
    }));

    result.push({
      id: awinId ?? syntheticId--,
      name: joined?.name ?? first.partner_name,
      url: joined?.url ?? '',
      logoUrl: joined?.logoUrl ?? first.logo_url ?? null,
      displayUrl: joined?.displayUrl ?? first.partner_url ?? '',
      description: joined?.description ?? null,
      category: joined?.category ?? first.category ?? null,
      currencyCode: joined?.currencyCode ?? 'EUR',
      promotions: publicPromos
    });
  }

  return result;
}

/**
 * AWIN-Deeplink generieren (serverseitig, damit publisherId nicht im Client-JS landet).
 * clickref = AustroFit User-ID für Attribution (optional).
 */
export function buildAwinDeeplink(
  publisherId: string,
  advertiserId: number,
  targetUrl: string,
  clickref?: string
): string {
  const params = new URLSearchParams({
    awinmid: String(advertiserId),
    awinaffid: publisherId,
    ued: targetUrl
  });
  if (clickref) params.set('clickref', clickref);

  return `https://www.awin1.com/cread.php?${params.toString()}`;
}
