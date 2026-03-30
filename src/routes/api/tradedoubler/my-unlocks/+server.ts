// src/routes/api/tradedoubler/my-unlocks/+server.ts
// GET: Alle freigeschalteten Tradedoubler-Rabattcodes des eingeloggten Users.
// Metadaten werden aus points_ledger.meta gelesen (kein erneuter TD API-Aufruf nötig).
// Der Code selbst wird NICHT zurückgegeben – Client ruft /unlock-code idempotent ab.
import { json } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';
import { extractBearerToken, resolveUserId } from '$lib/server/auth';

export interface TdUnlockEntry {
  promoId: string;     // voucherId
  programId: number;
  programName: string;
  description: string;
  pointsCost: number;
  endDate: string;
  unlockedAt: string;
  isExpired: boolean;
}

export async function GET({ request, fetch }) {
  const token = extractBearerToken(request);
  if (!token) return json({ error: 'Nicht eingeloggt' }, { status: 401 });

  const userId = await resolveUserId(token, PUBLIC_CMSURL, fetch);
  if (!userId) return json({ error: 'Nicht eingeloggt' }, { status: 401 });

  const adminHeaders = { Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}` };

  const params = new URLSearchParams({
    'filter[user][_eq]': userId,
    'filter[source_type][_eq]': 'td_unlock',
    fields: 'source_ref,occurred_at,meta',
    sort: '-occurred_at',
    limit: '100'
  });

  const res = await fetch(`${PUBLIC_CMSURL}/items/points_ledger?${params}`, {
    headers: adminHeaders
  });

  if (!res.ok) {
    return json({ error: 'Daten konnten nicht geladen werden' }, { status: 500 });
  }

  const body = await res.json();
  const entries: { source_ref: string; occurred_at: string; meta: Record<string, unknown> | null }[] =
    body.data ?? [];

  const now = new Date();
  const seen = new Set<string>();
  const unlocks: TdUnlockEntry[] = [];

  for (const entry of entries) {
    // source_ref format: 'td_unlock:{voucherId}'
    const voucherId = entry.source_ref.replace(/^td_unlock:/, '');
    if (seen.has(voucherId)) continue;
    seen.add(voucherId);

    const meta = entry.meta ?? {};
    const endDate = String(meta.endDate ?? '');

    unlocks.push({
      promoId: voucherId,
      programId: Number(meta.programId ?? 0),
      programName: String(meta.programName ?? ''),
      description: String(meta.description ?? ''),
      pointsCost: Number(meta.pointsCost ?? 0),
      endDate,
      unlockedAt: entry.occurred_at,
      isExpired: endDate ? new Date(endDate) <= now : false
    });
  }

  return json({ data: unlocks });
}
