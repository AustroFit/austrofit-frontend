import { PUBLIC_CMSURL } from '$env/static/public';

export async function POST({ request }) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Ungültige Anfrage' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${PUBLIC_CMSURL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Service nicht erreichbar' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
  }

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' }
  });
}
