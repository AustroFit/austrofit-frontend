// src/routes/api/ledger-total/+server.ts
// Gibt die Gesamtpunkte eines Users zurück: { total: number }
import { json } from '@sveltejs/kit';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';
import { PUBLIC_CMSURL } from '$env/static/public';

export async function GET({ url, fetch }: { url: URL; fetch: typeof globalThis.fetch }) {
  const userId = url.searchParams.get('user');
  if (!userId) return json({ total: 0 });

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