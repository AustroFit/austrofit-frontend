import { PUBLIC_CMSURL, PUBLIC_APP_URL } from '$env/static/public';
import { env as dynPublicEnv } from '$env/dynamic/public';
import { DIRECTUS_READ_TOKEN, DIRECTUS_WRITE_TOKEN } from '$env/static/private';
import { isRateLimited, rateLimitResponse } from '$lib/server/rateLimit';

export async function POST({ request, fetch }) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('cf-connecting-ip')
    ?? 'unknown';

  // Max. 5 Registrierungen pro 15 Minuten pro IP
  if (isRateLimited(ip, 'register', 5, 15 * 60 * 1000)) {
    return rateLimitResponse();
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Ungültige Anfrage' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // E-Mail-Existenz vorab prüfen (Directus gibt bei Duplikat sonst 204 zurück)
  const email = (payload as Record<string, unknown>)?.email;
  if (email) {
    try {
      const checkRes = await fetch(
        `${PUBLIC_CMSURL}/users?filter[email][_eq]=${encodeURIComponent(String(email))}&limit=1&fields=id`,
        { headers: { Authorization: `Bearer ${DIRECTUS_READ_TOKEN}` } }
      );
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData?.data?.length > 0) {
          return new Response(
            JSON.stringify({ errors: [{ message: 'Diese E-Mail-Adresse ist bereits registriert.', extensions: { code: 'EMAIL_EXISTS' } }] }),
            { status: 409, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    } catch { /* non-blocking – im Fehlerfall normal weiterregistrieren */ }
  }

  // Registrierung bei Directus
  const registrationPayload =
    dynPublicEnv.PUBLIC_EMAIL_VERIFICATION === 'true'
      ? { ...(payload as Record<string, unknown>), verification_url: `${PUBLIC_APP_URL}/auth/verify-email` }
      : payload;

  let upstream: Response;
  try {
    upstream = await fetch(`${PUBLIC_CMSURL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationPayload)
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Service nicht erreichbar' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
  }

  // Bei echtem Fehler sofort zurückgeben (204 = Erfolg in Directus-Standardkonfiguration)
  if (!upstream.ok) {
    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' }
    });
  }

  // Ohne Email-Verifikation: User sofort auf active setzen
  if (upstream.status === 204 && dynPublicEnv.PUBLIC_EMAIL_VERIFICATION !== 'true') {
    try {
      const userRes = await fetch(
        `${PUBLIC_CMSURL}/users?filter[email][_eq]=${encodeURIComponent(String(email))}&limit=1&fields=id`,
        { headers: { Authorization: `Bearer ${DIRECTUS_READ_TOKEN}` } }
      );
      const userData = await userRes.json();
      const userId = userData?.data?.[0]?.id;
      if (userId) {
        await fetch(`${PUBLIC_CMSURL}/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${DIRECTUS_WRITE_TOKEN}` },
          body: JSON.stringify({ status: 'active' })
        });
      }
    } catch { /* non-blocking */ }
    return new Response(null, { status: 204 });
  }

  if (upstream.status === 204) {
    return new Response(null, { status: 204 });
  }

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' }
  });
}
