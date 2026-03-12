// src/routes/api/ledger-entries/+server.ts
// Gibt paginierte Buchungseinträge eines Users zurück: { data: [], total: number }
import { json } from '@sveltejs/kit';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';
import { PUBLIC_CMSURL } from '$env/static/public';

export async function GET({ url, fetch }: { url: URL; fetch: typeof globalThis.fetch }) {
  const userId = url.searchParams.get('user');
  if (!userId) return json({ data: [], total: 0 });

  const limit = Math.min(500, parseInt(url.searchParams.get('limit') ?? '20'));
  const offset = parseInt(url.searchParams.get('offset') ?? '0');
  const sourceType = url.searchParams.get('source_type') ?? '';

  const params = new URLSearchParams({
    'filter[user][_eq]': userId,
    fields: 'id,points_delta,source_type,source_ref,occurred_at,created_at',
    sort: '-occurred_at,-created_at',
    limit: String(limit),
    offset: String(offset),
    meta: 'filter_count'
  });

  if (sourceType) params.set('filter[source_type][_eq]', sourceType);

  const res = await fetch(`${PUBLIC_CMSURL}/items/points_ledger?${params}`, {
    headers: { Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}` }
  });

  if (!res.ok) return json({ data: [], total: 0 });
  const body = await res.json();
  return json({ data: body.data ?? [], total: body.meta?.filter_count ?? 0 });
}
