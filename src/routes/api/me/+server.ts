// src/routes/api/me/+server.ts
// Proxy für /users/me — damit kein CORS-Problem mit direktem CMS-Aufruf
import { json } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { extractBearerToken } from '$lib/server/auth';

export async function GET({ request, fetch }: { request: Request; fetch: typeof globalThis.fetch }) {
  const token = extractBearerToken(request);
  if (!token) return json({ error: 'unauthorized' }, { status: 401 });

  const res = await fetch(`${PUBLIC_CMSURL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') ?? 'application/json' }
  });
}