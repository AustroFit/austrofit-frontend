import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';

const ONBOARDING_POINTS = 20;

export async function POST({ request, fetch }) {
  const payload = await request.json();
  const email: string = payload.email ?? '';

  // 1) Registrierung bei Directus
  const upstream = await fetch(`${PUBLIC_CMSURL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  // Bei echtem Fehler sofort zurückgeben (204 = Erfolg in Directus-Standardkonfiguration)
  if (!upstream.ok) {
    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' }
    });
  }

  // 2) Onboarding-Bonus buchen – Fehler hier blockieren nicht die Registrierung
  if (email) {
    try {
      const adminHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}`
      };

      // User-ID via E-Mail ermitteln
      const userRes = await fetch(
        `${PUBLIC_CMSURL}/users?filter[email][_eq]=${encodeURIComponent(email)}&fields=id&limit=1`,
        { headers: adminHeaders }
      );

      if (userRes.ok) {
        const userJson = await userRes.json();
        const userId: string | undefined = userJson?.data?.[0]?.id;

        if (userId) {
          // Idempotenz: Eintrag nur anlegen wenn noch keiner existiert
          const existRes = await fetch(
            `${PUBLIC_CMSURL}/items/points_ledger?filter[user][_eq]=${userId}&filter[source_type][_eq]=onboarding&limit=1&fields=id`,
            { headers: adminHeaders }
          );
          const existJson = existRes.ok ? await existRes.json() : null;
          const alreadyExists = (existJson?.data?.length ?? 0) > 0;

          if (!alreadyExists) {
            await fetch(`${PUBLIC_CMSURL}/items/points_ledger`, {
              method: 'POST',
              headers: adminHeaders,
              body: JSON.stringify({
                user: userId,
                points_delta: ONBOARDING_POINTS,
                source_type: 'onboarding',
                source_ref: `user:${userId}`,
                rule_version: 'v1',
                occurred_at: new Date().toISOString()
              })
            });
          }
        }
      }
    } catch {
      // Bonus-Fehler dürfen Registrierung nicht blockieren
    }
  }

  // 3) Erfolgs-Response – Directus liefert standardmäßig 204 (kein Body)
  if (upstream.status === 204) {
    return new Response(null, { status: 204 });
  }

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' }
  });
}
