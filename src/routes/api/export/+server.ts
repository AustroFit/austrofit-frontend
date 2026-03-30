// src/routes/api/export/+server.ts
// DSGVO Art. 20 – Datenübertragbarkeit: vollständiger Export aller personenbezogenen Daten.
// GET /api/export  (Bearer Token erforderlich)
// Antwort: JSON-Datei zum Download (Content-Disposition: attachment)

import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';
import { extractBearerToken } from '$lib/server/auth';

export async function GET({ request, fetch }: { request: Request; fetch: typeof globalThis.fetch }) {
  const token = extractBearerToken(request);
  if (!token) {
    return new Response(JSON.stringify({ error: 'Nicht eingeloggt' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 1) User-ID + Basisdaten ermitteln
  const meRes = await fetch(`${PUBLIC_CMSURL}/users/me?fields=id,first_name,last_name,email,date_created`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!meRes.ok) {
    return new Response(JSON.stringify({ error: 'Nicht eingeloggt' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  const user = (await meRes.json()).data as {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    date_created: string;
  };
  const userId = user.id;

  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}`
  };

  // Hilfsfunktion: alle Seiten einer Collection laden
  async function fetchAll(url: string): Promise<unknown[]> {
    const res = await fetch(url, { headers: adminHeaders });
    if (!res.ok) return [];
    const body = await res.json().catch(() => null);
    return body?.data ?? [];
  }

  // 2) Alle Daten parallel laden
  const [profile, ledger, quizAttempts, redemptions, activityLogs] = await Promise.all([
    fetchAll(
      `${PUBLIC_CMSURL}/items/user_profiles?filter[user][_eq]=${userId}&limit=1` +
      `&fields=streak_days,longest_streak,quiz_streak_days,health_connected,onboarding_completed,activity_group,totalSteps`
    ),
    fetchAll(
      `${PUBLIC_CMSURL}/items/points_ledger?filter[user][_eq]=${userId}&limit=2000&sort=occurred_at` +
      `&fields=points_delta,source_type,source_ref,occurred_at,description`
    ),
    fetchAll(
      `${PUBLIC_CMSURL}/items/quiz_attempts?filter[user][_eq]=${userId}&limit=2000&sort=created_at` +
      `&fields=quiz,score,max_score,passed,eligible_points,points_claimed_at,created_at`
    ),
    fetchAll(
      `${PUBLIC_CMSURL}/items/reward_redemptions?filter[user][_eq]=${userId}&limit=500&sort=created_at` +
      `&fields=points_cost,status,created_at`
    ),
    fetchAll(
      `${PUBLIC_CMSURL}/items/activity_logs?filter[user_id][_eq]=${userId}&limit=2000&sort=date` +
      `&fields=date,week_key,workout_type,duration_seconds,equivalent_minutes,source,imported_at`
    )
  ]);

  // 3) Export-Dokument zusammenstellen
  const exportData = {
    export_info: {
      generated_at: new Date().toISOString(),
      legal_basis: 'Art. 20 DSGVO – Recht auf Datenübertragbarkeit',
      contact: 'datenschutz@austrofit.at'
    },
    account: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      date_created: user.date_created
    },
    profile: profile[0] ?? null,
    points_ledger: ledger,
    quiz_attempts: quizAttempts,
    reward_redemptions: redemptions,
    activity_logs: activityLogs
  };

  const filename = `austrofit-daten-${new Date().toISOString().slice(0, 10)}.json`;

  return new Response(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}
