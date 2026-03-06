// src/routes/api/steps/manual/+server.ts
// Records a manual step entry for a given date and awards points.
// POST body: { date: 'YYYY-MM-DD', steps: number }
// Authorization: Bearer <user-access-token>
import { json } from '@sveltejs/kit';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';
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

  // 2. Verify user identity via Directus
  const userId = await resolveUserId(userToken, PUBLIC_CMSURL, fetch);
  if (!userId) return json({ error: 'Nicht autorisiert' }, { status: 401 });

  // 3. Parse body
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Ungültige Anfrage' }, { status: 400 });
  }

  const { date, steps } = body ?? {};

  // 4. Validate date
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
    return json({ error: 'Ungültiges Datum (YYYY-MM-DD erwartet)' }, { status: 400 });
  }
  const today = new Date().toISOString().split('T')[0];
  const minDate = new Date();
  minDate.setDate(minDate.getDate() - 30);
  const minDateStr = minDate.toISOString().split('T')[0];

  if (date > today) {
    return json({ error: 'Datum darf nicht in der Zukunft liegen' }, { status: 400 });
  }
  if (date < minDateStr) {
    return json(
      { error: 'Datum darf max. 30 Tage in der Vergangenheit liegen' },
      { status: 400 }
    );
  }

  // 5. Validate steps
  const stepsNum = parseInt(String(steps ?? ''), 10);
  if (isNaN(stepsNum) || stepsNum < 0 || stepsNum > 100000) {
    return json({ error: 'Schrittzahl ungültig (0–100.000)' }, { status: 400 });
  }

  // 6. Record step entry via shared service
  try {
    const result = await recordStepEntry({
      userId,
      date,
      steps: stepsNum,
      mode: 'manual',
      cmsUrl: PUBLIC_CMSURL,
      adminToken: PRIVATE_CMS_STATIC_TOKEN,
      fetchFn: fetch
    });

    if (result.skipped) {
      return json(
        { error: 'Für diesen Tag wurde bereits ein Eintrag gemacht' },
        { status: 409 }
      );
    }

    return json({
      success: true,
      punkte: result.punkte,
      ledger_id: result.ledger_id,
      neue_streak_days: result.neue_streak_days,
      longest_streak: result.longest_streak,
      streak_bonus_awarded: result.streak_bonus_awarded
    });
  } catch (e: any) {
    return json(
      { error: e?.message ?? 'Eintrag konnte nicht gespeichert werden' },
      { status: 500 }
    );
  }
}
