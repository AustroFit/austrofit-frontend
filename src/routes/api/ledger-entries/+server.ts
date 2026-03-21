// src/routes/api/ledger-entries/+server.ts
// Gibt paginierte Buchungseinträge eines Users zurück: { data: [], total: number }
import { json } from '@sveltejs/kit';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';
import { PUBLIC_CMSURL } from '$env/static/public';
import { extractBearerToken, resolveUserId } from '$lib/server/auth';

export async function GET({ url, request, fetch }: { url: URL; request: Request; fetch: typeof globalThis.fetch }) {
  const userId = url.searchParams.get('user');
  if (!userId) return json({ data: [], total: 0 });

  // Auth: sicherstellen dass der Token zum angefragten User gehört
  const token = extractBearerToken(request);
  if (!token) return json({ error: 'unauthorized' }, { status: 401 });
  const callerUserId = await resolveUserId(token, PUBLIC_CMSURL, fetch);
  if (!callerUserId || callerUserId !== userId) return json({ error: 'forbidden' }, { status: 403 });

  const limit = Math.min(500, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20', 10) || 20));
  const offset = Math.max(0, parseInt(url.searchParams.get('offset') ?? '0', 10) || 0);
  const sourceType = url.searchParams.get('source_type') ?? '';

  const params = new URLSearchParams({
    'filter[user][_eq]': userId,
    fields: 'id,points_delta,source_type,source_ref,occurred_at,created_at',
    sort: '-occurred_at,-created_at',
    limit: String(limit),
    offset: String(offset),
    meta: 'filter_count'
  });

  if (sourceType === 'streak') {
    // Beide Streak-Typen einschließen: täglicher Tag-Bonus (streak_tag) + Wochen-Bonus (streak)
    params.set('filter[source_type][_in]', 'streak,streak_tag');
  } else if (sourceType) {
    params.set('filter[source_type][_eq]', sourceType);
  }

  const res = await fetch(`${PUBLIC_CMSURL}/items/points_ledger?${params}`, {
    headers: { Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}` }
  });

  if (!res.ok) return json({ data: [], total: 0 });
  const body = await res.json();
  return json({ data: body.data ?? [], total: body.meta?.filter_count ?? 0 });
}
