// src/lib/server/tradedoubler.ts
// Tradedoubler Publisher API – Server-only (enthält Secrets)
// Im Gegensatz zu AWIN hat Tradedoubler eine echte Voucher-API mit Codes.
// Codes werden NIE an den Client gesendet – nur über /api/tradedoubler/unlock-code.

import { env } from '$env/dynamic/private';

const TD_API_BASE = 'https://api.tradedoubler.com/1.0';
const TD_CLICK_BASE = 'https://clkde.tradedoubler.com/click';
const DEFAULT_POINTS_COST = 50;

// ── Types ──────────────────────────────────────────────────────────────────

/** Rohdaten aus der Tradedoubler Voucher API */
interface TdVoucherRaw {
  id?: number | string;
  voucherId?: number | string;
  programId?: number | string;
  advertiserId?: number | string;
  programName?: string;
  advertiserName?: string;
  programLogoUrl?: string;
  logoUrl?: string;
  programUrl?: string;
  advertiserUrl?: string;
  code?: string;
  voucherCode?: string;
  title?: string;
  voucherTitle?: string;
  description?: string;
  startDate?: string;
  validFrom?: string;
  endDate?: string;
  expirationDate?: string;
  validTo?: string;
  category?: string;
  categoryName?: string;
  deepLink?: string;
  trackingUrl?: string;
}

/** Promotion-Objekt das an den Client gesendet wird (KEIN code-Feld) */
export interface TdPromotionPublic {
  id: string;          // Voucher-ID als String
  type: 'voucher';
  description: string;
  endDate: string | null;
  pointsCost: number;
}

/** Interne Voucher-Darstellung mit Code (nur server-side) */
export interface TdVoucherInternal {
  id: string;
  programId: number;
  programName: string;
  programLogoUrl: string | null;
  programUrl: string;
  code: string;
  description: string;
  endDate: string | null;
  category: string | null;
  pointsCost: number;
}

/** Programm-Objekt mit gleicher Form wie AwinProgram (für einheitliche UI) */
export interface TdProgram {
  id: number;          // programId
  name: string;
  url: string;
  logoUrl: string | null;
  displayUrl: string;
  description: string | null;
  category: string | null;
  currencyCode: string;
  promotions: TdPromotionPublic[];
  source: 'tradedoubler';
}

// ── In-Memory Cache ────────────────────────────────────────────────────────

let voucherCache: TdVoucherInternal[] | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 Minuten

// ── API-Abruf ──────────────────────────────────────────────────────────────

/**
 * Alle verfügbaren Voucher des Publishers abrufen (mit Codes – nur server-side!).
 * Gibt leeres Array zurück wenn Token fehlt oder API nicht erreichbar ist.
 */
export async function fetchTdVouchers(
  fetchFn: typeof globalThis.fetch = fetch
): Promise<TdVoucherInternal[]> {
  const token = env.TRADEDOUBLER_TOKEN ?? '';
  if (!token) {
    console.warn('[TD] TRADEDOUBLER_TOKEN fehlt – keine Voucher geladen');
    return [];
  }

  // Cache prüfen
  if (voucherCache && Date.now() < cacheExpiry) {
    return voucherCache;
  }

  const url = `${TD_API_BASE}/vouchers.json?token=${token}`;

  let raw: unknown;
  try {
    const res = await fetchFn(url);
    if (!res.ok) {
      console.error(`[TD] Voucher-API fehlgeschlagen: ${res.status} ${res.statusText}`);
      return voucherCache ?? [];
    }
    raw = await res.json();
  } catch (e) {
    console.error('[TD] Voucher-API nicht erreichbar:', e);
    return voucherCache ?? [];
  }

  // Response-Format ermitteln (TD kann Array oder Objekt zurückgeben)
  let rawList: TdVoucherRaw[] = [];
  if (Array.isArray(raw)) {
    rawList = raw as TdVoucherRaw[];
  } else if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    // Mögliche Wrapper-Felder
    const candidates = ['vouchers', 'items', 'data', 'result', 'products'];
    for (const key of candidates) {
      if (Array.isArray(obj[key])) {
        rawList = obj[key] as TdVoucherRaw[];
        break;
      }
    }
    if (rawList.length === 0) {
      // Rohdaten loggen damit wir das Format sehen können
      console.log('[TD] Unbekanntes API-Response-Format:', JSON.stringify(raw).slice(0, 500));
    }
  }

  const now = new Date();
  const result: TdVoucherInternal[] = [];

  for (const v of rawList) {
    const voucherId = String(v.id ?? v.voucherId ?? '');
    const programId = Number(v.programId ?? v.advertiserId ?? 0);
    const code = (v.code ?? v.voucherCode ?? '').trim();
    const endDateRaw = v.endDate ?? v.expirationDate ?? v.validTo ?? null;

    // Ohne ID, programId oder Code überspringen
    if (!voucherId || !programId || !code) continue;

    // Abgelaufene Voucher überspringen
    if (endDateRaw && new Date(endDateRaw) <= now) continue;

    result.push({
      id: voucherId,
      programId,
      programName: v.programName ?? v.advertiserName ?? String(programId),
      programLogoUrl: v.programLogoUrl ?? v.logoUrl ?? null,
      programUrl: v.programUrl ?? v.advertiserUrl ?? v.deepLink ?? v.trackingUrl ?? '',
      code,
      description: v.title ?? v.voucherTitle ?? v.description ?? '',
      endDate: endDateRaw,
      category: v.category ?? v.categoryName ?? null,
      pointsCost: DEFAULT_POINTS_COST
    });
  }

  console.log(`[TD] ${result.length} aktive Voucher geladen (${rawList.length} gesamt)`);

  voucherCache = result;
  cacheExpiry = Date.now() + CACHE_TTL_MS;
  return result;
}

/**
 * Voucher nach ID suchen (nutzt Cache).
 */
export async function findTdVoucherById(
  voucherId: string,
  fetchFn: typeof globalThis.fetch = fetch
): Promise<TdVoucherInternal | null> {
  const vouchers = await fetchTdVouchers(fetchFn);
  return vouchers.find((v) => v.id === voucherId) ?? null;
}

/**
 * Voucher-Liste als TdProgram[] gruppiert nach programId zurückgeben.
 * Codes werden NICHT inkludiert.
 */
export function groupVouchersAsPrograms(vouchers: TdVoucherInternal[]): TdProgram[] {
  const map = new Map<number, TdProgram>();

  for (const v of vouchers) {
    let prog = map.get(v.programId);
    if (!prog) {
      // Display-URL aus programUrl extrahieren
      let displayUrl = '';
      try {
        displayUrl = new URL(v.programUrl).hostname.replace(/^www\./, '');
      } catch { /* ignore */ }

      prog = {
        id: v.programId,
        name: v.programName,
        url: v.programUrl,
        logoUrl: v.programLogoUrl,
        displayUrl,
        description: null,
        category: v.category,
        currencyCode: 'EUR',
        promotions: [],
        source: 'tradedoubler'
      };
      map.set(v.programId, prog);
    }

    prog.promotions.push({
      id: v.id,
      type: 'voucher',
      description: v.description,
      endDate: v.endDate,
      pointsCost: v.pointsCost
    });
  }

  return Array.from(map.values());
}

/**
 * Tradedoubler UTS-Tracking-Link generieren (Publisher-ID bleibt serverseitig).
 * epi = AustroFit User-ID für Attribution (optional).
 */
export function buildTdDeeplink(
  programId: number,
  targetUrl: string,
  epi?: string
): string {
  const publisherId = env.TRADEDOUBLER_PUBLISHER_ID ?? '';
  const siteId = env.TRADEDOUBLER_SITE_ID ?? '';

  const params = new URLSearchParams({
    p: String(programId),
    a: publisherId,
    g: siteId,
    url: targetUrl
  });
  if (epi) params.set('epi', epi);

  return `${TD_CLICK_BASE}?${params.toString()}`;
}

/** Cache manuell leeren (z.B. für Tests) */
export function clearTdVoucherCache() {
  voucherCache = null;
  cacheExpiry = 0;
}
