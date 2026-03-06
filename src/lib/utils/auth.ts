const TOKEN_KEY = 'austrofit_access_token';

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
}

export function logout() {
  if (typeof window === 'undefined') return;

  // Auth-Token entfernen
  localStorage.removeItem(TOKEN_KEY);

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
  if (!res.ok) throw new Error(data?.errors?.[0]?.message ?? `Register failed (${res.status})`);

  return true;
}