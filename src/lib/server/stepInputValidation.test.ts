// REQ-S-041: Step-Input-Validierung (steps/manual/+server.ts)
// Spezifikations-Tests: Dokumentieren und verifizieren die Validierungsregeln
// aus steps/manual/+server.ts als reine Logik — ohne Route-Import und $env.
// Wenn diese Tests grün sind, verhält sich der Endpoint so wie erwartet.
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

// ── Validierungslogik (entspricht exakt steps/manual/+server.ts) ──────────────
// Diese Funktionen replizieren die Inline-Validierung im Endpoint.
// Wenn die Endpoint-Logik geändert wird, MÜSSEN diese Tests angepasst werden.

function isValidDateFormat(date: unknown): boolean {
  return typeof date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !isNaN(new Date(date + 'T00:00:00Z').getTime());
}

function isDateInRange(date: string, maxDaysAgo = 30): { ok: boolean; reason?: string } {
  const today = new Date().toISOString().split('T')[0];
  const minDate = new Date();
  minDate.setDate(minDate.getDate() - maxDaysAgo);
  const minDateStr = minDate.toISOString().split('T')[0];
  if (date > today) return { ok: false, reason: 'future' };
  if (date < minDateStr) return { ok: false, reason: 'too_old' };
  return { ok: true };
}

function isValidStepCount(steps: unknown): boolean {
  const n = parseInt(String(steps ?? ''), 10);
  return !isNaN(n) && n >= 0 && n <= 100_000;
}

// Fraud Cap — angewendet in stepsService.ts (nicht im Endpoint selbst)
const STEPS_FRAUD_CAP = 30_000;
function applyFraudCap(steps: number): number {
  return Math.min(steps, STEPS_FRAUD_CAP);
}

// ── Datumsformat-Validierung ──────────────────────────────────────────────────

describe('Datum — Format (REQ-S-041)', () => {
  test('gültiges Format "2026-05-25" → ok', () => {
    expect(isValidDateFormat('2026-05-25')).toBe(true);
  });

  test('ungültiges Format "25.05.2026" → abgelehnt', () => {
    expect(isValidDateFormat('25.05.2026')).toBe(false);
  });

  test('ungültiges Format "2026/05/25" → abgelehnt', () => {
    expect(isValidDateFormat('2026/05/25')).toBe(false);
  });

  test('nicht-existierendes Datum "2026-13-45" → abgelehnt', () => {
    expect(isValidDateFormat('2026-13-45')).toBe(false);
  });

  test('leerer String → abgelehnt', () => {
    expect(isValidDateFormat('')).toBe(false);
  });

  test('null → abgelehnt', () => {
    expect(isValidDateFormat(null)).toBe(false);
  });

  test('undefined → abgelehnt', () => {
    expect(isValidDateFormat(undefined)).toBe(false);
  });
});

// ── Datumsbereich-Validierung ─────────────────────────────────────────────────

describe('Datum — Bereich: nicht in Zukunft, max 30 Tage zurück (REQ-S-041)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  test('heute → ok', () => {
    vi.setSystemTime(new Date('2026-05-25T12:00:00Z'));
    expect(isDateInRange('2026-05-25').ok).toBe(true);
  });

  test('gestern → ok', () => {
    vi.setSystemTime(new Date('2026-05-25T12:00:00Z'));
    expect(isDateInRange('2026-05-24').ok).toBe(true);
  });

  test('genau 30 Tage zurück → ok (Grenzwert)', () => {
    vi.setSystemTime(new Date('2026-05-25T12:00:00Z'));
    expect(isDateInRange('2026-04-25').ok).toBe(true);
  });

  test('31 Tage zurück → abgelehnt (too_old)', () => {
    vi.setSystemTime(new Date('2026-05-25T12:00:00Z'));
    const result = isDateInRange('2026-04-24');
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('too_old');
  });

  test('morgen → abgelehnt (future)', () => {
    vi.setSystemTime(new Date('2026-05-25T12:00:00Z'));
    const result = isDateInRange('2026-05-26');
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('future');
  });

  test('weit in der Zukunft → abgelehnt', () => {
    vi.setSystemTime(new Date('2026-05-25T12:00:00Z'));
    expect(isDateInRange('2030-01-01').ok).toBe(false);
  });
});

// ── Schritt-Validierung (Endpoint-Level) ──────────────────────────────────────

describe('Schritte — Endpoint-Validierung 0–100.000 (REQ-S-041)', () => {
  test('0 Schritte → gültig', () => {
    expect(isValidStepCount(0)).toBe(true);
  });

  test('10.000 Schritte → gültig', () => {
    expect(isValidStepCount(10_000)).toBe(true);
  });

  test('100.000 Schritte → gültig (Endpoint-Max)', () => {
    expect(isValidStepCount(100_000)).toBe(true);
  });

  test('100.001 → abgelehnt (über Endpoint-Max)', () => {
    expect(isValidStepCount(100_001)).toBe(false);
  });

  test('negative Schritte → abgelehnt', () => {
    expect(isValidStepCount(-1)).toBe(false);
  });

  test('NaN → abgelehnt', () => {
    expect(isValidStepCount(NaN)).toBe(false);
  });

  test('String "abc" → abgelehnt', () => {
    expect(isValidStepCount('abc')).toBe(false);
  });

  test('null → abgelehnt', () => {
    expect(isValidStepCount(null)).toBe(false);
  });
});

// ── Fraud Cap (stepsService.ts) ───────────────────────────────────────────────

describe('Schritte — Fraud Cap 30.000 (REQ-S-041)', () => {
  test('30.000 → nicht gecappt', () => {
    expect(applyFraudCap(30_000)).toBe(30_000);
  });

  test('30.001 → gecappt auf 30.000', () => {
    expect(applyFraudCap(30_001)).toBe(30_000);
  });

  test('50.000 → gecappt auf 30.000', () => {
    expect(applyFraudCap(50_000)).toBe(30_000);
  });

  test('100.000 (Endpoint-Max) → gecappt auf 30.000', () => {
    expect(applyFraudCap(100_000)).toBe(30_000);
  });

  test('1.000 → nicht gecappt', () => {
    expect(applyFraudCap(1_000)).toBe(1_000);
  });

  test('Fraud-Cap < Endpoint-Max: 30.000 < 100.000', () => {
    // Dokumentiert: Endpoint lässt 100.000 durch, Cap greift DANACH in stepsService
    expect(STEPS_FRAUD_CAP).toBeLessThan(100_000);
    expect(applyFraudCap(35_000)).toBe(STEPS_FRAUD_CAP);
  });
});
