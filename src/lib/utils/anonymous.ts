// src/lib/utils/anonymous.ts
const KEY = 'austrofit_anonymous_id';

export function getOrCreateAnonymousId(): string {
  // localStorage gibt es nur im Browser
  if (typeof window === 'undefined') return '';

  let anon = localStorage.getItem(KEY);
  if (!anon) {
    anon = crypto.randomUUID();
    localStorage.setItem(KEY, anon);
  }
  return anon;
}

export function getAnonymousId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(KEY) ?? '';
}

export function clearAnonymousId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}