// REQ-S-012: JWT aus Authorization-Header (kein Body-Token)
// Testet extractBearerToken und resolveUserId aus src/lib/server/auth.ts.
import { describe, test, expect, vi } from 'vitest';
import { extractBearerToken, resolveUserId } from './auth';

// ── extractBearerToken ────────────────────────────────────────────────────────

function req(authHeader?: string): Request {
  return new Request('http://localhost/api/test', {
    headers: authHeader !== undefined ? { Authorization: authHeader } : {}
  });
}

describe('extractBearerToken (REQ-S-012)', () => {
  test('gültiger Bearer-Token → Token-String', () => {
    expect(extractBearerToken(req('Bearer abc123'))).toBe('abc123');
  });

  test('kein Authorization-Header → null', () => {
    expect(extractBearerToken(req())).toBeNull();
  });

  test('leerer Authorization-Header → null', () => {
    expect(extractBearerToken(req(''))).toBeNull();
  });

  test('"Bearer " ohne Token → null', () => {
    expect(extractBearerToken(req('Bearer '))).toBeNull();
  });

  test('"Bearer  " nur Whitespace → null', () => {
    expect(extractBearerToken(req('Bearer   '))).toBeNull();
  });

  test('lowercase "bearer" → Token erkannt (case-insensitiv)', () => {
    expect(extractBearerToken(req('bearer mytoken'))).toBe('mytoken');
  });

  test('BEARER uppercase → Token erkannt', () => {
    expect(extractBearerToken(req('BEARER mytoken'))).toBe('mytoken');
  });

  test('Whitespace um Token wird getrimmt', () => {
    expect(extractBearerToken(req('Bearer  abc  '))).toBe('abc');
  });

  test('Token darf Sonderzeichen enthalten (JWT-Format)', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    expect(extractBearerToken(req(`Bearer ${jwt}`))).toBe(jwt);
  });
});

// ── resolveUserId ─────────────────────────────────────────────────────────────

describe('resolveUserId', () => {
  test('gültiger Token + /users/me → User-ID zurück', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { id: 'user-abc-123' } }), { status: 200 })
    );
    const id = await resolveUserId('valid-token', 'https://cms.test', mockFetch);
    expect(id).toBe('user-abc-123');
  });

  test('/users/me aufgerufen mit korrekter URL und Bearer-Header', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { id: 'u1' } }), { status: 200 })
    );
    await resolveUserId('tok', 'https://cms.test', mockFetch);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://cms.test/users/me',
      expect.objectContaining({ headers: { Authorization: 'Bearer tok' } })
    );
  });

  test('HTTP 401 von Directus → null', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response('Unauthorized', { status: 401 })
    );
    expect(await resolveUserId('invalid', 'https://cms.test', mockFetch)).toBeNull();
  });

  test('HTTP 403 → null', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response('Forbidden', { status: 403 })
    );
    expect(await resolveUserId('token', 'https://cms.test', mockFetch)).toBeNull();
  });

  test('Response mit data aber ohne id → null', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { email: 'x@y.at' } }), { status: 200 })
    );
    expect(await resolveUserId('token', 'https://cms.test', mockFetch)).toBeNull();
  });

  test('leere data-Response → null', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 })
    );
    expect(await resolveUserId('token', 'https://cms.test', mockFetch)).toBeNull();
  });
});
