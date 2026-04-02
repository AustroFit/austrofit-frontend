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

/** Returns YYYY-MM-DD strings for Mon–Sun of the current ISO week (local timezone) */
export function getISOWeekDates(): string[] {
  const now = new Date();
  const dow = now.getDay(); // 0=Sun, 1=Mon, ...
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
}

/** "Do, Mär. 26" – short weekday + date label for card headers */
export function formatCardDateLabel(date: Date = new Date()): string {
  const weekday = date.toLocaleDateString('de-AT', { weekday: 'short' }).replace(/\.$/, '');
  const day = date.getDate();
  const month = date.toLocaleDateString('de-AT', { month: 'short' });
  return `${weekday}, ${month} ${day}`;
}
