// src/lib/server/awin.ts
// AWIN Publisher API v2 – Server-only (enthält Secrets)

export interface AwinProgram {
  id: number;
  name: string;
  url: string;
  logoUrl: string | null;
  displayUrl: string;
  description: string | null;
  category: string | null;
  currencyCode: string;
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
      currencyCode: p.currencyCode ?? 'EUR'
    })
  );
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
