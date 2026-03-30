// Shared Proxy-Funktion für einfache Directus-Collection-Endpunkte
import { PUBLIC_CMSURL } from '$env/static/public';
import { DIRECTUS_READ_TOKEN } from '$env/static/private';

export async function proxyDirectusCollection(
  collection: string,
  searchParams: URLSearchParams,
  fetchFn: typeof globalThis.fetch,
  cacheControl?: string
): Promise<Response> {
  const upstream = await fetchFn(
    `${PUBLIC_CMSURL}/items/${collection}?${searchParams.toString()}`,
    { headers: { Authorization: `Bearer ${DIRECTUS_READ_TOKEN}` } }
  );
  const body = await upstream.text();
  const headers: Record<string, string> = {
    'Content-Type': upstream.headers.get('content-type') ?? 'application/json'
  };
  if (cacheControl) headers['Cache-Control'] = cacheControl;
  return new Response(body, { status: upstream.status, headers });
}
