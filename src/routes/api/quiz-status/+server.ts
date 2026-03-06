// src/routes/api/quiz-status/+server.ts
import { json } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';
import { qs } from '$lib/utils/qs';
import { extractBearerToken, resolveUserId } from '$lib/server/auth';

const DEFAULT_COOLDOWN_DAYS = 30;

interface QuizStatus {
  status: 'open' | 'passed' | 'repeatable';
  repeatable_at?: string;
  points_earned?: number;
}

export async function GET({ request, url, fetch }: { request: Request; url: URL; fetch: typeof globalThis.fetch }) {
  const userToken = extractBearerToken(request);

  const quizIdParam = url.searchParams.get('quizId');
  const quizIdsParam = url.searchParams.get('quizIds');

  const quizIds: number[] = [];
  if (quizIdParam) quizIds.push(Number(quizIdParam));
  if (quizIdsParam) quizIdsParam.split(',').forEach((id: string) => quizIds.push(Number(id)));

  if (!quizIds.length) {
    return json({ error: 'quizId or quizIds required' }, { status: 400 });
  }

  const adminHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}`
  };

  // Cooldown-Tage laden
  const quizzesRes = await fetch(
    `${PUBLIC_CMSURL}/items/quizzes?` +
      qs({ 'filter[id][_in]': quizIds.join(','), fields: 'id,cooldown_days', limit: String(quizIds.length) }),
    { headers: adminHeaders }
  );
  const quizzesJson = quizzesRes.ok ? await quizzesRes.json() : { data: [] };
  const cooldownMap: Record<number, number> = {};
  for (const q of quizzesJson.data ?? []) {
    cooldownMap[Number(q.id)] = q.cooldown_days ?? DEFAULT_COOLDOWN_DAYS;
  }

  // Kein Token → alle open
  if (!userToken) {
    const result: Record<number, QuizStatus> = {};
    for (const id of quizIds) result[id] = { status: 'open' };
    return json(result);
  }

  // User-ID holen
  const userId = await resolveUserId(userToken, PUBLIC_CMSURL, fetch);
  if (!userId) {
    const result: Record<number, QuizStatus> = {};
    for (const id of quizIds) result[id] = { status: 'open' };
    return json(result);
  }

  // Letzte Attempts laden
  const attemptsRes = await fetch(
    `${PUBLIC_CMSURL}/items/quiz_attempts?` +
      qs({
        'filter[user][_eq]': userId,
        'filter[quiz][_in]': quizIds.join(','),
        'filter[passed][_eq]': 'true',
        'filter[points_claimed_at][_nnull]': 'true',
        fields: 'id,quiz,points_claimed_at,eligible_points',
        sort: '-points_claimed_at',
        limit: String(quizIds.length * 5)
      }),
    { headers: adminHeaders }
  );
  const attemptsJson = attemptsRes.ok ? await attemptsRes.json() : { data: [] };

  const latestAttempt: Record<number, { points_claimed_at: string; eligible_points: number }> = {};
  for (const a of attemptsJson.data ?? []) {
    const qid = Number(a.quiz);
    if (!latestAttempt[qid]) {
      latestAttempt[qid] = { points_claimed_at: a.points_claimed_at, eligible_points: a.eligible_points ?? 0 };
    }
  }

  // Status berechnen
  const now = Date.now();
  const result: Record<number, QuizStatus> = {};

  for (const id of quizIds) {
    const attempt = latestAttempt[id];
    if (!attempt) { result[id] = { status: 'open' }; continue; }

    const cooldownDays = cooldownMap[id] ?? DEFAULT_COOLDOWN_DAYS;
    const repeatableAt = new Date(new Date(attempt.points_claimed_at).getTime() + cooldownDays * 864e5);

    result[id] = {
      status: repeatableAt.getTime() <= now ? 'repeatable' : 'passed',
      repeatable_at: repeatableAt.toISOString(),
      points_earned: attempt.eligible_points
    };
  }

  return json(result);
}
