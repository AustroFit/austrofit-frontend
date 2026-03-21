// src/routes/api/ledger-total/+server.ts
// Gibt die Gesamtpunkte eines Users zurück: { total: number }
import { json } from '@sveltejs/kit';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';
import { PUBLIC_CMSURL } from '$env/static/public';
import { extractBearerToken, resolveUserId } from '$lib/server/auth';

export async function GET({ url, request, fetch }: { url: URL; request: Request; fetch: typeof globalThis.fetch }) {
  const userId = url.searchParams.get('user');
  if (!userId) return json({ total: 0 });

  // Auth: sicherstellen dass der Token zum angefragten User gehört
  const token = extractBearerToken(request);
  if (!token) return json({ error: 'unauthorized' }, { status: 401 });
  const callerUserId = await resolveUserId(token, PUBLIC_CMSURL, fetch);
  if (!callerUserId || callerUserId !== userId) return json({ error: 'forbidden' }, { status: 403 });

  const positiveOnly = url.searchParams.get('positive_only') === 'true';
  const filter = positiveOnly
    ? `filter[user][_eq]=${userId}&filter[points_delta][_gt]=0`
    : `filter[user][_eq]=${userId}`;

  const res = await fetch(
    `${PUBLIC_CMSURL}/items/points_ledger?${filter}&aggregate[sum]=points_delta&limit=1`,
    { headers: { Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}` } }
  );
  const data = res.ok ? await res.json() : { data: [] };
  const total = Number(data?.data?.[0]?.sum?.points_delta ?? 0);
  return json({ total });
}