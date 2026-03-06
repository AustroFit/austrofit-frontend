// Zentralisierte Auth-Utilities für API-Routen
// Ersetzt inkonsistente Token-Extraktion und duplizierte /users/me-Aufrufe

/** Extrahiert den Bearer-Token aus dem Authorization-Header. Gibt null zurück wenn kein Token vorhanden. */
export function extractBearerToken(request: Request): string | null {
  const header = request.headers.get('authorization') ?? '';
  const token = header.replace(/^Bearer\s+/i, '').trim();
  return token || null;
}

/** Löst die Directus-User-ID via /users/me auf. Gibt null zurück bei ungültigem Token. */
export async function resolveUserId(
  token: string,
  cmsUrl: string,
  fetchFn: typeof globalThis.fetch
): Promise<string | null> {
  const res = await fetchFn(`${cmsUrl}/users/me?fields=id`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return null;
  const body = await res.json();
  return (body?.data?.id as string) || null;
}
