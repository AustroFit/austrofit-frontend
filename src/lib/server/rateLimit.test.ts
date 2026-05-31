// REQ-S-017: Rate Limiting + Account Lockout
// Testet isRateLimited, rateLimitResponse, recordAuthFailure, isAccountLocked.
// Jeder Test verwendet eine eindeutige IP/E-Mail um den geteilten Modul-State zu vermeiden.
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { isRateLimited, rateLimitResponse, recordAuthFailure, isAccountLocked } from './rateLimit';

let ipSeed = 0;
function ip(): string { return `10.0.0.${++ipSeed % 254 || 1}.${Math.floor(ipSeed / 254)}`; }
function email(): string { return `test-${++ipSeed}-${Date.now()}@austrofit.at`; }

// ── isRateLimited — Sliding Window ────────────────────────────────────────────

describe('isRateLimited — Grundverhalten', () => {
  test('erste Anfrage → nicht limitiert', () => {
    expect(isRateLimited(ip(), 'test', 5, 60_000)).toBe(false);
  });

  test('genau max Anfragen → nicht limitiert', () => {
    const addr = ip();
    for (let i = 0; i < 5; i++) expect(isRateLimited(addr, 'test', 5, 60_000)).toBe(false);
  });

  test('max + 1 → limitiert', () => {
    const addr = ip();
    for (let i = 0; i < 5; i++) isRateLimited(addr, 'test', 5, 60_000);
    expect(isRateLimited(addr, 'test', 5, 60_000)).toBe(true);
  });

  test('verschiedene Buckets sind pro IP isoliert', () => {
    const addr = ip();
    for (let i = 0; i < 6; i++) isRateLimited(addr, 'claim', 5, 60_000);
    // 'redeem'-Bucket derselben IP ist noch nicht limitiert
    expect(isRateLimited(addr, 'redeem', 5, 60_000)).toBe(false);
  });

  test('verschiedene IPs sind isoliert', () => {
    const addr1 = ip();
    const addr2 = ip();
    for (let i = 0; i < 6; i++) isRateLimited(addr1, 'test', 5, 60_000);
    expect(isRateLimited(addr2, 'test', 5, 60_000)).toBe(false);
  });
});

describe('isRateLimited — Fenster-Reset (Fake Timers)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  test('Fenster abgelaufen → Zähler wird zurückgesetzt', () => {
    const addr = ip();
    for (let i = 0; i < 6; i++) isRateLimited(addr, 'window', 5, 60_000);
    expect(isRateLimited(addr, 'window', 5, 60_000)).toBe(true);

    vi.advanceTimersByTime(60_001); // Fenster abgelaufen
    expect(isRateLimited(addr, 'window', 5, 60_000)).toBe(false);
  });

  test('kurz vor Ablauf → immer noch limitiert', () => {
    const addr = ip();
    for (let i = 0; i < 6; i++) isRateLimited(addr, 'exp', 5, 60_000);
    vi.advanceTimersByTime(59_999); // fast abgelaufen, aber noch nicht
    expect(isRateLimited(addr, 'exp', 5, 60_000)).toBe(true);
  });
});

// ── REQ-S-017 — Konkrete Limits je Endpoint ───────────────────────────────────

describe('isRateLimited — claim: 20/Stunde (REQ-S-017)', () => {
  test('20 Anfragen → ok, 21. → 429', () => {
    const addr = ip();
    for (let i = 0; i < 20; i++) {
      expect(isRateLimited(addr, 'claim', 20, 60 * 60 * 1000)).toBe(false);
    }
    expect(isRateLimited(addr, 'claim', 20, 60 * 60 * 1000)).toBe(true);
  });
});

describe('isRateLimited — redeem: 10/Stunde (REQ-S-017)', () => {
  test('10 Anfragen → ok, 11. → 429', () => {
    const addr = ip();
    for (let i = 0; i < 10; i++) {
      expect(isRateLimited(addr, 'redeem', 10, 60 * 60 * 1000)).toBe(false);
    }
    expect(isRateLimited(addr, 'redeem', 10, 60 * 60 * 1000)).toBe(true);
  });
});

describe('isRateLimited — steps_manual: 5/15min (REQ-S-017)', () => {
  test('5 Anfragen → ok, 6. → 429', () => {
    const addr = ip();
    for (let i = 0; i < 5; i++) {
      expect(isRateLimited(addr, 'steps_manual', 5, 15 * 60 * 1000)).toBe(false);
    }
    expect(isRateLimited(addr, 'steps_manual', 5, 15 * 60 * 1000)).toBe(true);
  });
});

// ── rateLimitResponse ─────────────────────────────────────────────────────────

describe('rateLimitResponse', () => {
  test('Status 429', () => {
    expect(rateLimitResponse().status).toBe(429);
  });

  test('Retry-After: 900', () => {
    expect(rateLimitResponse().headers.get('Retry-After')).toBe('900');
  });

  test('Content-Type: application/json', () => {
    expect(rateLimitResponse().headers.get('Content-Type')).toBe('application/json');
  });

  test('Body enthält error-Feld', async () => {
    const body = await rateLimitResponse().json();
    expect(body.error).toBeTruthy();
  });
});

// ── Account Lockout (recordAuthFailure + isAccountLocked) ─────────────────────

describe('Account Lockout — recordAuthFailure + isAccountLocked (REQ-S-017)', () => {
  test('keine Fehlversuche → nicht gesperrt', () => {
    expect(isAccountLocked(email())).toBe(false);
  });

  test('4 Fehlversuche → noch nicht gesperrt', () => {
    const addr = email();
    for (let i = 0; i < 4; i++) recordAuthFailure(addr);
    expect(isAccountLocked(addr)).toBe(false);
  });

  test('5 Fehlversuche → gesperrt', () => {
    const addr = email();
    for (let i = 0; i < 5; i++) recordAuthFailure(addr);
    expect(isAccountLocked(addr)).toBe(true);
  });

  test('E-Mail ist case-insensitiv', () => {
    const addr = email();
    for (let i = 0; i < 5; i++) recordAuthFailure(addr.toUpperCase());
    expect(isAccountLocked(addr.toLowerCase())).toBe(true);
  });

  test('custom maxFailures-Schwelle', () => {
    const addr = email();
    for (let i = 0; i < 3; i++) recordAuthFailure(addr);
    expect(isAccountLocked(addr, 3)).toBe(true);
    expect(isAccountLocked(addr, 4)).toBe(false);
  });
});

describe('Account Lockout — Fenster-Reset (Fake Timers)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  test('Sperre läuft nach 10 Minuten ab', () => {
    const addr = email();
    for (let i = 0; i < 5; i++) recordAuthFailure(addr);
    expect(isAccountLocked(addr)).toBe(true);

    vi.advanceTimersByTime(10 * 60 * 1000 + 1);
    expect(isAccountLocked(addr)).toBe(false);
  });
});
