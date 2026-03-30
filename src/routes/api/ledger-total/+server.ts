// src/routes/api/ledger-total/+server.ts
// Gibt die Gesamtpunkte eines Users zurück: { total: number }
import { json } from '@sveltejs/kit';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';
import { PUBLIC_CMSURL } from '$env/static/public';
import { extractBearerToken, resolveUserId } from '$lib/server/auth';

export async function GET({ url, request, fetch }: { url: URL; request: Request; fetch: typeof globalThis.fetch }) {
  const token = extractBearerToken(request);
  if (!token) return json({ error: 'unauthorized' }, { status: 401 });

  // Wenn user-Param fehlt oder me=true → userId aus Token auflösen (kein Roundtrip vom Client nötig)
  let userId = url.searchParams.get('user');
  const resolveMe = !userId || url.searchParams.get('me') === 'true';
  if (resolveMe) {
    const resolved = await resolveUserId(token, PUBLIC_CMSURL, fetch);
    if (!resolved) return json({ error: 'unauthorized' }, { status: 401 });
    userId = resolved;
  } else {
    // Sicherstellen dass der Token zum angefragten User gehört
    const callerUserId = await resolveUserId(token, PUBLIC_CMSURL, fetch);
    if (!callerUserId || callerUserId !== userId) return json({ error: 'forbidden' }, { status: 403 });
  }

  const positiveOnly = url.searchParams.get('positive_only') === 'true';
  const sourceTypes = url.searchParams.get('source_types') ?? ''; // comma-separated

  const params = new URLSearchParams({
    'filter[user][_eq]': userId,
    'aggregate[sum]': 'points_delta',
    limit: '1'
  });
  if (positiveOnly) params.set('filter[points_delta][_gt]', '0');
  if (sourceTypes) params.set('filter[source_type][_in]', sourceTypes);

  const res = await fetch(
    `${PUBLIC_CMSURL}/items/points_ledger?${params}`,
    { headers: { Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}` } }
  );
  const data = res.ok ? await res.json() : { data: [] };
  const total = Number(data?.data?.[0]?.sum?.points_delta ?? 0);
  return json({ total });
}