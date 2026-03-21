import { json } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';
import { qs } from '$lib/utils/qs';
import { resolveUserId } from '$lib/server/auth';
import { updateQuizStreak } from '$lib/utils/streak';

export const POST = async ({ request, fetch }) => {
  try {
    const { anonymous_id, access_token } = await request.json();

    if (!anonymous_id) return json({ error: 'missing anonymous_id' }, { status: 400 });
    if (!access_token) return json({ error: 'missing access_token' }, { status: 401 });

    // 1) user_id via users/me mit User-Token holen
    const user_id = await resolveUserId(access_token, PUBLIC_CMSURL, fetch);
    if (!user_id) return json({ error: 'users/me failed oder user_id konnte nicht ermittelt werden' }, { status: 401 });

    const adminHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}`
    };

    // 2) Offene Attempts holen (completed, noch nicht geclaimed)
    const attemptsUrl =
      `${PUBLIC_CMSURL}/items/quiz_attempts?` +
      qs({
        'filter[anonymous_id][_eq]': anonymous_id,
        'filter[completed_at][_nnull]': 'true',
        'filter[points_claimed_at][_null]': 'true',
        'filter[passed][_eq]': 'true',
        'limit': '200',
        'fields': 'id,eligible_points,points_ledger_ref'
      });

    const attemptsRes = await fetch(attemptsUrl, { headers: adminHeaders });
    const attemptsTxt = await attemptsRes.text();
    if (!attemptsRes.ok) {
      return json({ error: 'read quiz_attempts failed', details: attemptsTxt }, { status: 500 });
    }

    const attemptsJson = attemptsTxt ? JSON.parse(attemptsTxt) : null;
    const attempts: Array<{ id: string; eligible_points?: number; points_ledger_ref?: string | null }> =
      attemptsJson?.data ?? [];

    if (!attempts.length) {
      return json({ claimed: 0, message: 'no open attempts found' });
    }

    const nowIso = new Date().toISOString();

    let claimed = 0;
    const results: Array<{ attempt_id: string; ledger_id: string }> = [];

    for (const a of attempts) {
      // Safety: falls schon verlinkt, skip (idempotent)
      if (a.points_ledger_ref) continue;

      const source_ref = `quiz_attempts:${a.id}`;

      // 3) Prüfen ob Ledger schon existiert (idempotent bei mehrfachen Calls)
      const ledgerFindUrl =
        `${PUBLIC_CMSURL}/items/points_ledger?` +
        qs({
          'filter[user][_eq]': user_id,
          'filter[source_ref][_eq]': source_ref,
          'limit': '1',
          'fields': 'id'
        });

      const ledgerFindRes = await fetch(ledgerFindUrl, { headers: adminHeaders });
      const ledgerFindTxt = await ledgerFindRes.text();
      if (!ledgerFindRes.ok) {
        return json({ error: 'read points_ledger failed', details: ledgerFindTxt }, { status: 500 });
      }
      const ledgerFindJson = ledgerFindTxt ? JSON.parse(ledgerFindTxt) : null;
      const existingLedgerId = ledgerFindJson?.data?.[0]?.id as string | undefined;

      let ledgerId = existingLedgerId;

      // 4) Attempt sofort dem User zuordnen + claimed_at setzen (damit Read "leer" wird bei Retry)
      const updAttempt1 = await fetch(`${PUBLIC_CMSURL}/items/quiz_attempts/${a.id}`, {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({
          user: user_id,
          points_claimed_at: nowIso
        })
      });

      if (!updAttempt1.ok) {
        const t = await updAttempt1.text();
        return json({ error: 'update attempt (user/claimed_at) failed', details: t }, { status: 500 });
      }

      // 5) Ledger erstellen (wenn nicht vorhanden)
      if (!ledgerId) {
        const createLedgerRes = await fetch(`${PUBLIC_CMSURL}/items/points_ledger`, {
          method: 'POST',
          headers: adminHeaders,
          body: JSON.stringify({
            user: user_id,
            points_delta: a.eligible_points ?? 0,
            source_type: 'education',
            source_ref,
            rule_version: 'v1',
            occurred_at: nowIso
          })
        });

        const t = await createLedgerRes.text();
        if (!createLedgerRes.ok) {
          return json({ error: 'create ledger failed', details: t }, { status: 500 });
        }
        const j = t ? JSON.parse(t) : null;
        ledgerId = j?.data?.id;
        if (!ledgerId) return json({ error: 'create ledger: missing id' }, { status: 500 });
      }

      // 6) Ledger zurück in Attempt schreiben
      const updAttempt2 = await fetch(`${PUBLIC_CMSURL}/items/quiz_attempts/${a.id}`, {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({
          points_ledger_ref: ledgerId
        })
      });

      if (!updAttempt2.ok) {
        const t = await updAttempt2.text();
        return json({ error: 'update attempt (ledger_ref) failed', details: t }, { status: 500 });
      }

      claimed++;
      results.push({ attempt_id: a.id, ledger_id: ledgerId });
    }

    // Quiz-Streak aktualisieren (non-blocking)
    if (claimed > 0) {
      updateQuizStreak(user_id, {
        cmsUrl: PUBLIC_CMSURL,
        token: PRIVATE_CMS_STATIC_TOKEN,
        userToken: access_token,
        fetchFn: fetch
      }).catch((e) => console.warn('[claim] quiz streak update failed:', e));
    }

    return json({ claimed, results });
  } catch (e: any) {
    return json({ error: e?.message ?? 'unknown error' }, { status: 500 });
  }
};
