import { PUBLIC_CMSURL } from '$env/static/public';

export async function POST({ request, fetch }) {
  let payload: { email?: string };
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Ungültige Anfrage' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  if (!payload.email) {
    return new Response(JSON.stringify({ error: 'E-Mail fehlt' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const origin = new URL(request.url).origin;

  let upstream: Response;
  try {
    upstream = await fetch(`${PUBLIC_CMSURL}/users/register/request-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: payload.email,
        verification_url: `${origin}/auth/verify-email`
      })
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Service nicht erreichbar' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
  }

  if (upstream.ok || upstream.status === 204) {
    return new Response(null, { status: 204 });
  }

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' }
  });
}
