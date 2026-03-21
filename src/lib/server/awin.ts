// src/lib/server/awin.ts
// AWIN Publisher API v2 – Server-only (enthält Secrets)
// Hinweis: Die AWIN Publisher-REST-API hat keinen öffentlichen Promotions-Endpoint.
// Codes werden manuell in src/lib/data/awinManualPromotions.ts gepflegt.

import { getActivePromotions, MANUAL_PROMOTIONS, PROGRAM_NAMES } from '$lib/data/awinManualPromotions';

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

const AWIN_API_BASE = 'https://api.awin.com';

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
 * Manuelle Promotions als Programmliste servieren.
 * Basis-Programmdaten (Name, URL, Logo) werden von der AWIN API ergänzt falls verfügbar –
 * manuelle Promotions werden aber immer angezeigt, unabhängig vom Joined-Status.
 * Code selbst wird NICHT mitgesendet (nur über /api/awin/unlock-code abrufbar).
 */
export async function fetchAwinProgramsWithPromotions(
  apiToken: string,
  publisherId: string,
  fetchFn: typeof globalThis.fetch = fetch
): Promise<AwinProgram[]> {
  // Joined-Programme von AWIN abrufen (optional – nur zur Datenanreicherung)
  const joinedPrograms = await fetchAwinPrograms(apiToken, publisherId, fetchFn);
  const joinedMap = new Map(joinedPrograms.map((p) => [p.id, p]));

  const result: AwinProgram[] = [];

  for (const [advertiserIdStr, _promos] of Object.entries(MANUAL_PROMOTIONS)) {
    const advertiserId = Number(advertiserIdStr);
    const activePromos = getActivePromotions(advertiserId);
    if (activePromos.length === 0) continue;

    const publicPromos: AwinPromotionPublic[] = activePromos.map((promo) => ({
      id: promo.id,
      type: promo.type,
      description: promo.description,
      endDate: promo.endDate,
      pointsCost: promo.pointsCost
      // code wird absichtlich NICHT mitgesendet
    }));

    // Programmdaten aus AWIN-API nehmen falls vorhanden, sonst Fallback
    const joined = joinedMap.get(advertiserId);
    result.push({
      id: advertiserId,
      name: joined?.name ?? PROGRAM_NAMES[advertiserId] ?? String(advertiserId),
      url: joined?.url ?? '',
      logoUrl: joined?.logoUrl ?? null,
      displayUrl: joined?.displayUrl ?? '',
      description: joined?.description ?? null,
      category: joined?.category ?? null,
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
