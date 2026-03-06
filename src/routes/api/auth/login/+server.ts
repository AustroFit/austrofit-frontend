import { PUBLIC_CMSURL } from '$env/static/public';

export async function POST({ request }) {
  const payload = await request.json();

  const upstream = await fetch(`${PUBLIC_CMSURL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (upstream.status === 204) {
    return new Response(null, { status: 204 });
  }

  const body = await upstream.text();

  return new Response(body, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' }
  });
}