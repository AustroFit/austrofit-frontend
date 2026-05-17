// src/routes/api/auth/google/+server.ts
// GET: Startet den Google OAuth 2.0 Flow.
// Erzeugt einen CSRF-State-Cookie und leitet zu accounts.google.com weiter.
import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import crypto from 'crypto';

export async function GET({ cookies, url }: RequestEvent) {
  const clientId = env.GOOGLE_CLIENT_ID ?? '';
  if (!clientId) {
    return new Response('Google OAuth nicht konfiguriert (GOOGLE_CLIENT_ID fehlt)', { status: 503 });
  }

  const state = crypto.randomUUID();
  cookies.set('google_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600, // 10 Minuten
    path: '/'
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${url.origin}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account'
  });

  redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
