import { PUBLIC_CMSURL } from '$env/static/public';
import { isRateLimited, rateLimitResponse } from '$lib/server/rateLimit';

export async function POST({ request }) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('cf-connecting-ip')
    ?? 'unknown';

  // Max. 10 Login-Versuche pro 15 Minuten pro IP
  if (isRateLimited(ip, 'login', 10, 15 * 60 * 1000)) {
    return rateLimitResponse();
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Ungültige Anfrage' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${PUBLIC_CMSURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Service nicht erreichbar' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
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