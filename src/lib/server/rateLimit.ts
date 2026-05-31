// Einfacher In-Memory Rate Limiter (pro Serverless-Instanz).
// Ausreichend gegen einfaches Brute-Forcing; für kross-instanz-Schutz wäre Redis nötig.

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

/** Bereinigt abgelaufene Einträge um Memory-Leak zu vermeiden. */
function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}

let lastCleanup = Date.now();

/**
 * Prüft ob eine Anfrage das Rate Limit überschreitet.
 * @param ip        IP-Adresse des Clients
 * @param bucket    Name des Limits (z.B. 'login', 'register')
 * @param max       Maximale Anfragen im Zeitfenster
 * @param windowMs  Zeitfenster in Millisekunden
 * @returns true wenn das Limit überschritten ist
 */
export function isRateLimited(ip: string, bucket: string, max: number, windowMs: number): boolean {
  const now = Date.now();

  // Gelegentlich aufräumen
  if (now - lastCleanup > 60_000) {
    cleanup();
    lastCleanup = now;
  }

  const key = `${bucket}:${ip}`;
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  if (entry.count > max) return true;

  return false;
}

/** Gibt die Standard-Antwort für Rate-Limit-Überschreitungen zurück. */
export function rateLimitResponse(): Response {
  return new Response(
    JSON.stringify({ error: 'Zu viele Anfragen. Bitte warte einen Moment.' }),
    { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '900' } }
  );
}

// ── Per-Account Auth-Failure Tracking ─────────────────────────────────────────
// Zählt fehlgeschlagene Login-Versuche pro E-Mail-Adresse.
// Sperrt das Konto temporär nach zu vielen Fehlversuchen (unabhängig von IP).

const failureStore = new Map<string, RateLimitEntry>();

/**
 * Speichert einen fehlgeschlagenen Login-Versuch für eine E-Mail-Adresse.
 * Fenster: 10 Minuten.
 */
export function recordAuthFailure(email: string): void {
  const key = `auth_fail:${email.toLowerCase()}`;
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const entry = failureStore.get(key);

  if (!entry || entry.resetAt < now) {
    failureStore.set(key, { count: 1, resetAt: now + windowMs });
  } else {
    entry.count += 1;
  }
}

/**
 * Gibt true zurück wenn das Konto nach zu vielen Fehlversuchen gesperrt ist.
 * Standard: 5 Fehlversuche / 10 Minuten.
 */
export function isAccountLocked(email: string, maxFailures = 5): boolean {
  const key = `auth_fail:${email.toLowerCase()}`;
  const now = Date.now();
  const entry = failureStore.get(key);
  if (!entry || entry.resetAt < now) return false;
  return entry.count >= maxFailures;
}
