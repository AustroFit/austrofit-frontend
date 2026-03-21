// src/lib/data/awinManualPromotions.ts
// Manuell gepflegte AWIN-Rabattcodes (AWIN Publisher API hat keinen Promotions-Endpoint).
// Codes aus dem AWIN-UI unter /promotions kopieren.
// Nach Aktualisierung: git commit + deploy (Vercel baut automatisch neu).

export interface AwinPromotionInternal {
  id: string;          // Stabiler Identifier (ändert sich nicht)
  type: 'voucher';
  code: string;        // Eigentlicher Rabattcode (wird NICHT an den Client gesendet)
  description: string;
  endDate: string;     // ISO-Datum YYYY-MM-DD
  pointsCost: number;  // Punkte die zum Freischalten benötigt werden
}

// Keyed by AWIN Advertiser-ID (number → string in JSON, daher als number key)
export const MANUAL_PROMOTIONS: Record<number, AwinPromotionInternal[]> = {
  // myfruits DE (ID: 103075)
  103075: [
    {
      id: 'myfruits-snacktime15',
      type: 'voucher',
      code: 'Snacktime15',
      description: 'Natürlich snacken & sparen – Gesunde Snacks jetzt günstiger',
      endDate: '2026-03-31',
      pointsCost: 50
    }
  ],

  // 100percentpure DE/AT (ID: 13991)
  13991: [
    {
      id: '100pp-praw264',
      type: 'voucher',
      code: 'PrAw264',
      description: '10% Gutschein + Kostenlose Lieferung – Der Neujahrsgutschein von 100% Pure',
      endDate: '2026-03-31',
      pointsCost: 50
    },
    {
      id: '100pp-praw834',
      type: 'voucher',
      code: 'PrAw834',
      description: '6€ Gutschein + Kostenlose Lieferung – Der Neujahrsgutschein von 100% Pure',
      endDate: '2026-03-31',
      pointsCost: 30
    }
  ]
};

/** Alle aktiven (nicht abgelaufenen) Promotions für einen Advertiser */
export function getActivePromotions(advertiserId: number): AwinPromotionInternal[] {
  const promos = MANUAL_PROMOTIONS[advertiserId] ?? [];
  const now = new Date();
  return promos.filter((p) => new Date(p.endDate) > now);
}

/** Advertiser-Metadaten (Fallback wenn AWIN-API keine Programmdaten liefert) */
export const PROGRAM_META: Record<number, { name: string; displayUrl: string; logoUrl: string | null; category: string | null }> = {
  103075: {
    name: 'myfruits',
    displayUrl: 'myfruits.eu',
    logoUrl: 'https://ui2.awin.com/merchant-logos/103075/logo.png',
    category: 'Food/Drink'
  },
  13991: {
    name: '100% Pure',
    displayUrl: '100percentpure.de',
    logoUrl: 'https://ui2.awin.com/merchant-logos/13991/logo.png',
    category: 'Health/Beauty'
  }
};

/** Advertiser-Namen (für Anzeige in der UI) */
export const PROGRAM_NAMES: Record<number, string> = {
  103075: 'myfruits',
  13991: '100% Pure'
};

/** Eine spezifische Promotion anhand ID suchen */
export function findPromoById(promoId: string): AwinPromotionInternal | null {
  for (const promos of Object.values(MANUAL_PROMOTIONS)) {
    const found = promos.find((p) => p.id === promoId);
    if (found) return found;
  }
  return null;
}

/** Promotion + zugehörige Advertiser-Infos suchen */
export function findPromoWithProgram(
  promoId: string
): { promo: AwinPromotionInternal; advertiserId: number; programName: string } | null {
  for (const [advertiserIdStr, promos] of Object.entries(MANUAL_PROMOTIONS)) {
    const advertiserId = Number(advertiserIdStr);
    const found = promos.find((p) => p.id === promoId);
    if (found) {
      return { promo: found, advertiserId, programName: PROGRAM_NAMES[advertiserId] ?? 'Online-Partner' };
    }
  }
  return null;
}
