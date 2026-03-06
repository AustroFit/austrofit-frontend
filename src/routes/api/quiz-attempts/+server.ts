import { json } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';

const MAX_ELIGIBLE_POINTS = 200;

const adminHeaders = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}`
};

export async function POST({ request }) {
  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'invalid json' }, { status: 400 });
  }

  const quizId = payload.quiz ?? null;
  const anonymousId = payload.anonymous_id ?? null;

  // Cap eligible_points for security – client must not be trusted for point values
  if (typeof payload.eligible_points === 'number') {
    payload.eligible_points = Math.max(0, Math.min(MAX_ELIGIBLE_POINTS, payload.eligible_points));
  }

  // Server-side cooldown check: if quiz ID + anonymous_id provided,
  // check whether a completed attempt for this quiz still exists within cooldown_days
  if (quizId && anonymousId) {
    try {
      const quizRes = await fetch(
        `${PUBLIC_CMSURL}/items/quizzes/${quizId}?fields=id,cooldown_days`,
        { headers: adminHeaders }
      );

      if (quizRes.ok) {
        const quizJson = await quizRes.json();
        const cooldownDays: number = quizJson?.data?.cooldown_days ?? 0;

        if (cooldownDays > 0) {
          const cooldownDate = new Date();
          cooldownDate.setDate(cooldownDate.getDate() - cooldownDays);

          const dupParams = new URLSearchParams({
            'filter[anonymous_id][_eq]': anonymousId,
            'filter[quiz][_eq]': String(quizId),
            'filter[completed_at][_nnull]': 'true',
            'filter[completed_at][_gte]': cooldownDate.toISOString(),
            fields: 'id',
            limit: '1'
          });

          const dupRes = await fetch(
            `${PUBLIC_CMSURL}/items/quiz_attempts?${dupParams}`,
            { headers: adminHeaders }
          );

          if (dupRes.ok) {
            const dupData = await dupRes.json();
            if ((dupData?.data ?? []).length > 0) {
              // Still within cooldown – return success with skipped flag (no error, no duplicate)
              return json({ skipped: true, reason: 'cooldown' });
            }
          }
        }
      }
    } catch (e) {
      // Non-blocking: log and continue – the attempt is still created
      console.warn('[quiz-attempts] cooldown check failed:', e);
    }
  }

  const upstream = await fetch(`${PUBLIC_CMSURL}/items/quiz_attempts`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify(payload)
  });

  // 204 must not have a body
  if (upstream.status === 204) {
    return new Response(null, { status: 204 });
  }

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' }
  });
}
