import { json } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';
import { qs } from '$lib/utils/qs';

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

  // Build safe payload from explicit allowlist – never trust client for scores or passed flag
  const safeScore = typeof payload.score === 'number' ? payload.score : null;
  const safeMaxScore = typeof payload.max_score === 'number' ? payload.max_score : null;
  const safeEligiblePoints = Math.max(
    0,
    Math.min(MAX_ELIGIBLE_POINTS, Number(payload.eligible_points) || 0)
  );

  let safePassed = false;
  let cooldownDays = 0;

  if (quizId) {
    // Fetch quiz: authoritative question count + cooldown_days (blocking – reject on failure)
    const quizRes = await fetch(
      `${PUBLIC_CMSURL}/items/quizzes/${quizId}?fields=id,cooldown_days,quiz_json`,
      { headers: adminHeaders }
    );

    if (!quizRes.ok) {
      return json({ error: 'quiz not found' }, { status: 400 });
    }

    const quizData = (await quizRes.json())?.data;
    cooldownDays = quizData?.cooldown_days ?? 0;

    // Validate max_score against authoritative question count (quiz_json may be string or object)
    const rawQuizJson = quizData?.quiz_json;
    let parsedQuizJson: any = rawQuizJson;
    if (typeof rawQuizJson === 'string') {
      try {
        parsedQuizJson = JSON.parse(rawQuizJson);
      } catch {
        parsedQuizJson = null;
      }
    }
    const authoritativeQuestionCount = Array.isArray(parsedQuizJson?.questions)
      ? parsedQuizJson.questions.length
      : null;

    if (authoritativeQuestionCount !== null) {
      if (safeMaxScore !== authoritativeQuestionCount) {
        return json({ error: 'invalid submission' }, { status: 400 });
      }
      if (safeScore !== null && safeScore > authoritativeQuestionCount) {
        return json({ error: 'invalid submission' }, { status: 400 });
      }
    }

  }

  safePassed =
    safeScore !== null && safeMaxScore !== null && safeMaxScore > 0
      ? safeScore >= safeMaxScore
      : false;

  const safePayload = {
    anonymous_id: anonymousId,
    quiz: quizId,
    score: safeScore,
    max_score: safeMaxScore,
    passed: safePassed,
    eligible_points: safeEligiblePoints,
    completed_at: new Date().toISOString()
  };

  // Server-side cooldown check (non-blocking: failure still allows attempt creation)
  if (quizId && anonymousId && cooldownDays > 0) {
    const cooldownDate = new Date();
    cooldownDate.setDate(cooldownDate.getDate() - cooldownDays);

    try {
      const dupRes = await fetch(
        `${PUBLIC_CMSURL}/items/quiz_attempts?${qs({
          'filter[anonymous_id][_eq]': anonymousId,
          'filter[quiz][_eq]': String(quizId),
          'filter[completed_at][_nnull]': 'true',
          'filter[completed_at][_gte]': cooldownDate.toISOString(),
          fields: 'id',
          limit: '1'
        })}`,
        { headers: adminHeaders }
      );

      if (dupRes.ok) {
        const dupData = await dupRes.json();
        if ((dupData?.data ?? []).length > 0) {
          return json({ skipped: true, reason: 'cooldown' });
        }
      }
    } catch (e) {
      console.warn('[quiz-attempts] cooldown check failed:', e);
    }
  }

  const upstream = await fetch(`${PUBLIC_CMSURL}/items/quiz_attempts`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify(safePayload)
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
