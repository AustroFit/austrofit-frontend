// src/routes/api/auth/google/callback/+server.ts
// GET: Google OAuth 2.0 Callback.
// Tauscht den Authorization Code gegen Google-Tokens aus, liest User-Info,
// erstellt oder findet den Directus-User, erhält ein Directus-JWT und
// liefert eine HTML-Seite zurück, die das Token in localStorage speichert.
import type { RequestEvent } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { PUBLIC_CMSURL } from '$env/static/public';
import { DIRECTUS_WRITE_TOKEN } from '$env/static/private';
import crypto from 'crypto';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

function failRedirect(reason: string): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: `/login?google_error=${encodeURIComponent(reason)}` }
  });
}

export async function GET({ url, cookies, fetch }: RequestEvent) {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const oauthError = url.searchParams.get('error');

  if (oauthError || !code || !state) return failRedirect('aborted');

  // CSRF-Prüfung
  const storedState = cookies.get('google_oauth_state');
  cookies.delete('google_oauth_state', { path: '/' });
  if (!storedState || storedState !== state) return failRedirect('state_mismatch');

  const clientId = env.GOOGLE_CLIENT_ID ?? '';
  const clientSecret = env.GOOGLE_CLIENT_SECRET ?? '';
  if (!clientId || !clientSecret) return failRedirect('not_configured');

  // 1) Authorization Code → Google Access Token
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${url.origin}/api/auth/google/callback`,
      grant_type: 'authorization_code'
    }).toString()
  });

  if (!tokenRes.ok) {
    console.error('[Google OAuth] Token-Exchange fehlgeschlagen:', await tokenRes.text());
    return failRedirect('token_exchange');
  }

  const { access_token: googleToken } = (await tokenRes.json()) as { access_token: string };

  // 2) Google User-Info abrufen
  const userInfoRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${googleToken}` }
  });
  if (!userInfoRes.ok) return failRedirect('userinfo');

  const {
    email,
    given_name,
    family_name
  } = (await userInfoRes.json()) as {
    email?: string;
    given_name?: string;
    family_name?: string;
  };

  if (!email) return failRedirect('no_email');

  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${DIRECTUS_WRITE_TOKEN}`
  };

  // 3) Prüfen ob Directus-User mit dieser E-Mail bereits existiert
  let userId: string | null = null;
  const findRes = await fetch(
    `${PUBLIC_CMSURL}/users?filter[email][_eq]=${encodeURIComponent(email)}&fields=id&limit=1`,
    { headers: adminHeaders }
  );
  if (findRes.ok) {
    const body = await findRes.json();
    userId = (body?.data?.[0]?.id as string) ?? null;
  }

  // Einmalig generiertes temporäres Passwort für den Directus-Login
  const tempPw = crypto.randomUUID() + crypto.randomUUID();

  if (!userId) {
    // 4a) Neuen User anlegen (nutzt Directus-Standard-Rolle)
    const registerRes = await fetch(`${PUBLIC_CMSURL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: tempPw,
        first_name: given_name ?? '',
        last_name: family_name ?? ''
      })
    });

    if (!registerRes.ok && registerRes.status !== 204) {
      console.error('[Google OAuth] User-Anlage fehlgeschlagen:', await registerRes.text());
      return failRedirect('create_user');
    }

    // Neu angelegten User-ID ermitteln
    const findNewRes = await fetch(
      `${PUBLIC_CMSURL}/users?filter[email][_eq]=${encodeURIComponent(email)}&fields=id&limit=1`,
      { headers: adminHeaders }
    );
    if (findNewRes.ok) {
      const b = await findNewRes.json();
      userId = (b?.data?.[0]?.id as string) ?? null;
    }

    // User sofort aktivieren (analog zum normalen Register-Flow ohne E-Mail-Verifikation)
    if (userId) {
      await fetch(`${PUBLIC_CMSURL}/users/${userId}`, {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({ status: 'active' })
      });
    }
  } else {
    // 4b) Existierender User: Passwort rotieren damit Login möglich wird
    await fetch(`${PUBLIC_CMSURL}/users/${userId}`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ password: tempPw })
    });
  }

  if (!userId) return failRedirect('no_user_id');

  // 5) Mit temporärem Passwort einloggen → Directus JWT erhalten
  const loginRes = await fetch(`${PUBLIC_CMSURL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: tempPw })
  });

  if (!loginRes.ok) {
    console.error('[Google OAuth] Directus-Login fehlgeschlagen:', await loginRes.text());
    return failRedirect('directus_login');
  }

  const loginData = (await loginRes.json()) as {
    data?: { access_token: string; refresh_token: string; expires: number };
  };

  const accessToken = loginData?.data?.access_token;
  const refreshToken = loginData?.data?.refresh_token ?? '';
  const expires = loginData?.data?.expires ?? 900_000;

  if (!accessToken) return failRedirect('no_access_token');

  // 6) Passwort nochmals rotieren (temporäres PW ungültig machen)
  const finalPw = crypto.randomUUID() + crypto.randomUUID();
  fetch(`${PUBLIC_CMSURL}/users/${userId}`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({ password: finalPw })
  }).catch(() => {/* non-critical */});

  // 7) HTML-Seite zurückgeben: speichert Token in localStorage, ruft init-onboarding auf
  const expiresAt = Date.now() + expires;

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Anmelden…</title>
  <style>body{display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:sans-serif;background:#f5f5f5;}</style>
</head>
<body>
  <p style="color:#666;font-size:14px;">Wird angemeldet…</p>
  <script>
    (function() {
      try {
        localStorage.setItem('austrofit_access_token', ${JSON.stringify(accessToken)});
        localStorage.setItem('austrofit_refresh_token', ${JSON.stringify(refreshToken)});
        localStorage.setItem('austrofit_token_expires_at', ${JSON.stringify(String(expiresAt))});
        var group = localStorage.getItem('austrofit_activity_group') || 'adult';
        localStorage.removeItem('austrofit_activity_group');
        fetch('/api/auth/init-onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + ${JSON.stringify(accessToken)} },
          body: JSON.stringify({ activity_group: group })
        }).catch(function(){});
      } catch(e) {}
      window.location.replace('/dashboard');
    })();
  </script>
  <noscript>
    <p>JavaScript ist erforderlich. <a href="/login">Zurück zum Login</a></p>
  </noscript>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
