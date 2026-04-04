// src/routes/api/cardio/history/+server.ts
// GET /api/cardio/history?year=2026&month=4
// Returns per-day equivalent minutes for the given month from activity_logs.
// Response: { dailyMinutes: [{ date: "YYYY-MM-DD", minutes: number }] }
import { json } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';
import { extractBearerToken, resolveUserId } from '$lib/server/auth';
import { isValidDateString } from '$lib/utils/date';

export async function GET({
  request,
  url,
  fetch
}: {
  request: Request;
  url: URL;
  fetch: typeof globalThis.fetch;
}) {
  const userToken = extractBearerToken(request);
  if (!userToken) return json({ error: 'Nicht autorisiert' }, { status: 401 });

  const userId = await resolveUserId(userToken, PUBLIC_CMSURL, fetch);
  if (!userId) return json({ error: 'Nicht autorisiert' }, { status: 401 });

  const year  = parseInt(url.searchParams.get('year')  ?? String(new Date().getFullYear()), 10);
  const month = parseInt(url.searchParams.get('month') ?? String(new Date().getMonth() + 1), 10); // 1-based

  const mm       = String(month).padStart(2, '0');
  const lastDay  = new Date(year, month, 0).getDate();
  const dateFrom = `${year}-${mm}-01`;
  const dateTo   = `${year}-${mm}-${String(lastDay).padStart(2, '0')}`;

  const logsParams = new URLSearchParams({
    'filter[user_id][_eq]': userId,
    'filter[date][_between]': JSON.stringify([dateFrom, dateTo]),
    'filter[start_date][_nnull]': 'true',
    fields: 'date,equivalent_minutes',
    limit: '500'
  });
  const ledgerParams = new URLSearchParams({
    'filter[user][_eq]': userId,
    'filter[source_type][_eq]': 'cardio',
    'filter[occurred_at][_gte]': `${dateFrom}T00:00:00`,
    'filter[occurred_at][_lte]': `${dateTo}T23:59:59`,
    fields: 'points_delta',
    limit: '500'
  });

  const adminHeaders = { Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}` };
  let rows: { date?: string; equivalent_minutes?: number }[] = [];
  let ledgerRows: { points_delta?: number }[] = [];
  try {
    const [logsRes, ledgerRes] = await Promise.all([
      fetch(`${PUBLIC_CMSURL}/items/activity_logs?${logsParams}`, { headers: adminHeaders }),
      fetch(`${PUBLIC_CMSURL}/items/points_ledger?${ledgerParams}`, { headers: adminHeaders })
    ]);
    if (logsRes.ok) rows = (await logsRes.json())?.data ?? [];
    if (ledgerRes.ok) ledgerRows = (await ledgerRes.json())?.data ?? [];
  } catch { /* return empty */ }

  const dailyMap: Record<string, number> = {};
  for (const row of rows) {
    const d = String(row.date ?? '').substring(0, 10);
    if (isValidDateString(d)) {
      dailyMap[d] = (dailyMap[d] ?? 0) + Number(row.equivalent_minutes ?? 0);
    }
  }

  const totalMonthPoints = ledgerRows.reduce((sum, r) => sum + Number(r.points_delta ?? 0), 0);
  const dailyMinutes = Object.entries(dailyMap).map(([date, minutes]) => ({ date, minutes }));
  return json({ dailyMinutes, totalMonthPoints });
}
