// src/routes/api/cardio/summary/+server.ts
// GET – returns current week's cardio progress for the dashboard card.
// Response: { equivalentMinutes, pointsTotal, targets: { start, full }, activityGroup, consecutiveFullWeeks }
import { json } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';
import { extractBearerToken, resolveUserId } from '$lib/server/auth';
import { getWeekKey, getWeeklyTargets, type ActivityGroup } from '$lib/server/cardioService';

export async function GET({
  request,
  fetch
}: {
  request: Request;
  fetch: typeof globalThis.fetch;
}) {
  const userToken = extractBearerToken(request);
  if (!userToken) return json({ error: 'Nicht autorisiert' }, { status: 401 });

  const userId = await resolveUserId(userToken, PUBLIC_CMSURL, fetch);
  if (!userId) return json({ error: 'Nicht autorisiert' }, { status: 401 });

  const adminHeaders = { Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}` };
  const weekKey = getWeekKey();

  // 1) Activity group from user_profiles
  let activityGroup: ActivityGroup = 'adult';
  try {
    const profileRes = await fetch(
      `${PUBLIC_CMSURL}/items/user_profiles?filter[user][_eq]=${userId}&fields=activity_group&limit=1`,
      { headers: adminHeaders }
    );
    if (profileRes.ok) {
      const pd = await profileRes.json();
      const group = pd?.data?.[0]?.activity_group;
      if (['adult', 'senior', 'pregnant', 'chronic'].includes(group)) {
        activityGroup = group as ActivityGroup;
      }
    }
  } catch { /* default adult */ }

  // 2+3+4) Parallel: equivalent minutes, points total, consecutive weeks
  const logsParams = new URLSearchParams({
    'filter[user_id][_eq]': userId,
    'filter[week_key][_eq]': weekKey,
    fields: 'equivalent_minutes',
    limit: '100'
  });
  const ledgerParams = new URLSearchParams({
    'filter[user][_eq]': userId,
    'filter[source_type][_eq]': 'cardio',
    'filter[source_ref][_eq]': `cardio-${weekKey}`,
    fields: 'points_delta',
    limit: '1'
  });
  const streakParams = new URLSearchParams({
    'filter[user][_eq]': userId,
    'filter[source_type][_eq]': 'cardio',
    fields: 'points_delta',
    sort: '-occurred_at',
    limit: '4'
  });

  const [logsBody, ledgerBody, streakBody] = await Promise.all([
    fetch(`${PUBLIC_CMSURL}/items/activity_logs?${logsParams}`, { headers: adminHeaders })
      .then(r => r.ok ? r.json() : null).catch(() => null),
    fetch(`${PUBLIC_CMSURL}/items/points_ledger?${ledgerParams}`, { headers: adminHeaders })
      .then(r => r.ok ? r.json() : null).catch(() => null),
    fetch(`${PUBLIC_CMSURL}/items/points_ledger?${streakParams}`, { headers: adminHeaders })
      .then(r => r.ok ? r.json() : null).catch(() => null),
  ]);

  const equivalentMinutes = (logsBody?.data ?? []).reduce(
    (sum: number, row: { equivalent_minutes: number }) => sum + Number(row.equivalent_minutes ?? 0),
    0
  );
  const pointsTotal = Number(ledgerBody?.data?.[0]?.points_delta ?? 0);
  let consecutiveFullWeeks = 0;
  for (const entry of (streakBody?.data ?? [])) {
    if (Number(entry.points_delta ?? 0) >= 200) consecutiveFullWeeks++;
    else break;
  }

  const weeklyTargets = await getWeeklyTargets(PUBLIC_CMSURL, PRIVATE_CMS_STATIC_TOKEN, fetch);

  return json({
    equivalentMinutes,
    pointsTotal,
    targets: weeklyTargets[activityGroup],
    activityGroup,
    consecutiveFullWeeks
  });
}
