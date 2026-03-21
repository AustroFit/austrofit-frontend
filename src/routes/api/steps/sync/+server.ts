// src/routes/api/steps/sync/+server.ts
// Automatic step sync endpoint – designed for multi-day batch sync.
// Unlike /api/steps/manual, duplicates return skipped:true (not 409).
// POST body: { date: 'YYYY-MM-DD', steps: number, mode?: 'automatic' | 'manual' }
// Authorization: Bearer <user-access-token>
import { json } from '@sveltejs/kit';
import { PRIVATE_CMS_STATIC_TOKEN, SCHRITTE_FLOW_ID } from '$env/static/private';
import { PUBLIC_CMSURL } from '$env/static/public';
import { recordStepEntry } from '$lib/server/stepsService';
import { extractBearerToken, resolveUserId } from '$lib/server/auth';

export async function POST({
  request,
  fetch
}: {
  request: Request;
  fetch: typeof globalThis.fetch;
}) {
  // 1. Auth
  const userToken = extractBearerToken(request);
  if (!userToken) return json({ error: 'Nicht autorisiert' }, { status: 401 });

  // 2. Resolve user_id
  const userId = await resolveUserId(userToken, PUBLIC_CMSURL, fetch);
  if (!userId) return json({ error: 'Nicht autorisiert' }, { status: 401 });

  // 3. Parse body
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Ungültige Anfrage' }, { status: 400 });
  }

  const { date, steps, mode = 'automatic' } = body ?? {};

  // 4. Validate date
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
    return json({ error: 'Ungültiges Datum (YYYY-MM-DD erwartet)' }, { status: 400 });
  }
  if (isNaN(new Date(date + 'T00:00:00Z').getTime())) {
    return json({ error: 'Ungültiges Datum' }, { status: 400 });
  }
  const today = new Date().toISOString().split('T')[0];
  const minDate = new Date();
  minDate.setDate(minDate.getDate() - 30);
  const minDateStr = minDate.toISOString().split('T')[0];

  if (date > today) {
    return json({ error: 'Datum darf nicht in der Zukunft liegen' }, { status: 400 });
  }
  if (date < minDateStr) {
    return json({ skipped: true, reason: 'date_too_old' });
  }

  // 5. Validate steps
  const stepsNum = parseInt(String(steps ?? ''), 10);
  if (isNaN(stepsNum) || stepsNum < 0 || stepsNum > 100000) {
    return json({ error: 'Schrittzahl ungültig' }, { status: 400 });
  }

  // 6a. Use Directus Flow if SCHRITTE_FLOW_ID is configured
  if (SCHRITTE_FLOW_ID) {
    try {
      const flowRes = await fetch(
        `${PUBLIC_CMSURL}/flows/trigger/${SCHRITTE_FLOW_ID}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}`
          },
          body: JSON.stringify({ user_id: userId, date, steps: stepsNum, mode })
        }
      );

      if (!flowRes.ok) {
        const errText = await flowRes.text();
        console.warn('[steps/sync] flow trigger failed:', flowRes.status, errText);
        // Fall through to direct API below
      } else {
        const flowBody = await flowRes.text();
        let flowData: any = {};
        try { flowData = flowBody ? JSON.parse(flowBody) : {}; } catch { /* ignore */ }
        return json({
          success: true,
          skipped: flowData?.skipped ?? false,
          punkte: flowData?.punkte ?? flowData?.points_delta ?? 0,
          ledger_id: flowData?.ledger_id ?? null,
          neue_streak_days: flowData?.neue_streak_days ?? 0,
          longest_streak: flowData?.longest_streak ?? 0,
          streak_bonus_awarded: flowData?.streak_bonus_awarded ?? false,
          streak_tag_bonus_awarded: flowData?.streak_tag_bonus_awarded ?? false
        });
      }
    } catch (e) {
      console.warn('[steps/sync] flow trigger exception:', e);
      // Fall through to direct API
    }
  }

  // 6b. Direct API (fallback or when SCHRITTE_FLOW_ID is not set)
  try {
    const result = await recordStepEntry({
      userId,
      date,
      steps: stepsNum,
      mode: mode === 'manual' ? 'manual' : 'automatic',
      cmsUrl: PUBLIC_CMSURL,
      adminToken: PRIVATE_CMS_STATIC_TOKEN,
      userToken,
      fetchFn: fetch
    });

    return json(result);
  } catch (e: any) {
    return json({ error: e?.message ?? 'Sync fehlgeschlagen' }, { status: 500 });
  }
}
