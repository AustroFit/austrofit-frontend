// src/routes/api/badges-summary/+server.ts
// Kombiniert alle Badge-Erkennungs-Abfragen in einem einzigen Request.
// Ersetzt 4 separate /api/ledger-entries?source_type=... Aufrufe.
// Response: { quizPassCount, hasSchritte, hasEinloesung }
import { json } from '@sveltejs/kit';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';
import { PUBLIC_CMSURL } from '$env/static/public';
import { extractBearerToken, resolveUserId } from '$lib/server/auth';

export async function GET({ url, request, fetch }: { url: URL; request: Request; fetch: typeof globalThis.fetch }) {
  const userId = url.searchParams.get('user');
  if (!userId) return json({ quizPassCount: 0, hasSchritte: false, hasEinloesung: false });

  // Auth: sicherstellen dass der Token zum angefragten User gehört
  const token = extractBearerToken(request);
  if (!token) return json({ error: 'unauthorized' }, { status: 401 });
  const callerUserId = await resolveUserId(token, PUBLIC_CMSURL, fetch);
  if (!callerUserId || callerUserId !== userId) return json({ error: 'forbidden' }, { status: 403 });

  const base = `${PUBLIC_CMSURL}/items/points_ledger`;
  const headers = { Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}` };

  const makeUrl = (sourceType: string) => {
    const p = new URLSearchParams({
      'filter[user][_eq]': userId,
      'filter[source_type][_eq]': sourceType,
      fields: 'id',
      limit: '1',
      meta: 'filter_count'
    });
    return `${base}?${p}`;
  };

  const [eduRes, schrittRes, einloeseRes, awinRes] = await Promise.all([
    fetch(makeUrl('education'), { headers }),
    fetch(makeUrl('schritte'),  { headers }),
    fetch(makeUrl('einloesung'), { headers }),
    fetch(makeUrl('awin_unlock'), { headers })
  ]);

  const eduCount     = eduRes.ok     ? Number((await eduRes.json()).meta?.filter_count     ?? 0) : 0;
  const schrittCount = schrittRes.ok ? Number((await schrittRes.json()).meta?.filter_count ?? 0) : 0;
  const einloesung   = einloeseRes.ok ? Number((await einloeseRes.json()).meta?.filter_count ?? 0) > 0 : false;
  const awinUnlock   = awinRes.ok     ? Number((await awinRes.json()).meta?.filter_count    ?? 0) > 0 : false;

  return json({
    quizPassCount: eduCount,
    hasSchritte:   schrittCount > 0,
    schrittDays:   schrittCount,
    hasEinloesung: einloesung || awinUnlock
  });
}
