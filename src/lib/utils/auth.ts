const TOKEN_KEY = 'austrofit_access_token';
const REFRESH_TOKEN_KEY = 'austrofit_refresh_token';
const EXPIRES_AT_KEY = 'austrofit_token_expires_at';
const REFRESH_BUFFER_MS = 60_000; // 60s vor Ablauf refreshen

export function getAccessToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(TOKEN_KEY) ?? '';
}

export function setAccessToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
}

export async function refreshToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY) ?? '';
  if (!refresh) return null;
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh })
    });
    if (!res.ok) {
      clearAccessToken();
      return null;
    }
    const data = await res.json();
    const { access_token, refresh_token, expires } = data?.data ?? {};
    if (!access_token) return null;
    setAccessToken(access_token);
    if (refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
    if (expires) localStorage.setItem(EXPIRES_AT_KEY, String(Date.now() + expires));
    return access_token;
  } catch {
    return null;
  }
}

export async function getValidAccessToken(): Promise<string> {
  if (typeof window === 'undefined') return '';
  const token = getAccessToken();
  if (!token) return '';
  const expiresAt = parseInt(localStorage.getItem(EXPIRES_AT_KEY) ?? '0', 10);
  const soon = expiresAt > 0 && Date.now() > expiresAt - REFRESH_BUFFER_MS;
  if (soon) return (await refreshToken()) ?? '';
  return token;
}

export function logout() {
  if (typeof window === 'undefined') return;

  // Auth-Token entfernen
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);

  // Anonyme Quiz-Daten bereinigen – damit beim nächsten Quiz-Durchlauf
  // eine neue anonymousId erzeugt wird und keine alten Duplikatbremsen greifen
  localStorage.removeItem('austrofit_anonymous_id');
  localStorage.removeItem('austrofit_last_quiz_result');
  localStorage.removeItem('austrofit_pending_claim');

  // Alle Duplikatbremsen-Keys entfernen (austrofit_attempt_created:*)
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('austrofit_attempt_created:')) keysToRemove.push(key);
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}

export async function login(email: string, password: string) {
  const res = await fetch(`/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.errors?.[0]?.message ?? `Login failed (${res.status})`);

  const token = data?.data?.access_token;
  if (!token) throw new Error('Login: access_token fehlt in Response');

  setAccessToken(token);
  if (data?.data?.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, data.data.refresh_token);
    localStorage.setItem(EXPIRES_AT_KEY, String(Date.now() + (data.data.expires ?? 900_000)));
  }
  return token;
}

export async function register(email: string, password: string, first_name: string, last_name: string) {
  const payload: Record<string, string> = { email, password };
  if (first_name) payload.first_name = first_name;
  if (last_name) payload.last_name = last_name;

  const res = await fetch(`/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.errors?.[0]?.message ?? `Register failed (${res.status})`) as any;
    err.status = res.status;
    err.code = data?.errors?.[0]?.extensions?.code;
    throw err;
  }

  return true;
}