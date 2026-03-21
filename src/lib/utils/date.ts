// src/lib/utils/date.ts
// Zentrale Datums-Formatierung für die gesamte App (Locale: de-AT)

/** "14. Mär. 2026" – kurzer Monatsname, z.B. für Buchungshistorie */
export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('de-AT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/** "14.03.2026" – numerisch, z.B. für Gutschein-Gültigkeit */
export function formatDateNumeric(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('de-AT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/** "14. März" – Tag + langer Monatsname, kein Jahr, z.B. für Dashboard-Karten */
export function formatDateMonthOnly(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('de-AT', {
    day: 'numeric',
    month: 'long'
  });
}

/** Verbleibende Tage bis zum Datum (positiv = noch gültig, 0/negativ = abgelaufen) */
export function daysUntilExpiry(iso: string | null | undefined): number {
  if (!iso) return 0;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
