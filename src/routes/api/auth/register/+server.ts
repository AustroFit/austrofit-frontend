import { PUBLIC_CMSURL } from '$env/static/public';
import { DIRECTUS_READ_TOKEN } from '$env/static/private';

export async function POST({ request, fetch }) {
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
  let upstream: Response;
  try {
    upstream = await fetch(`${PUBLIC_CMSURL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
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

  // Erfolgs-Response – Directus liefert standardmäßig 204 (kein Body)
  if (upstream.status === 204) {
    return new Response(null, { status: 204 });
  }

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' }
  });
}
