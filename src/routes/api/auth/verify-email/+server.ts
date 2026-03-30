import { PUBLIC_CMSURL } from '$env/static/public';

export async function GET({ url, fetch }) {
  const token = url.searchParams.get('token');
  if (!token) {
    return new Response(JSON.stringify({ error: 'Token fehlt' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${PUBLIC_CMSURL}/users/register/verify-email?token=${encodeURIComponent(token)}`);
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
