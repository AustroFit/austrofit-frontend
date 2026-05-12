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
  const info = await resolveUserInfo(token, cmsUrl, fetchFn);
  return info?.id ?? null;
}

/** Löst User-ID und Registrierungsdatum via /users/me auf. */
export async function resolveUserInfo(
  token: string,
  cmsUrl: string,
  fetchFn: typeof globalThis.fetch
): Promise<{ id: string; date_created: string | null } | null> {
  const res = await fetchFn(`${cmsUrl}/users/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return null;
  const body = await res.json();
  const id = body?.data?.id as string | undefined;
  if (!id) return null;
  return {
    id,
    date_created: (body?.data?.date_created as string) ?? null
  };
}
