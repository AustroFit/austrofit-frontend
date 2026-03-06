/**
 * Analytics wrapper – PostHog EU Cloud (eu.i.posthog.com, Frankfurt)
 * DSGVO-konform: Daten verbleiben in der EU.
 * No npm dependency; analytics must never block app functionality.
 *
 * Setup: add PUBLIC_POSTHOG_TOKEN=phc_xxx to .env
 */
import { browser } from '$app/environment';

const PH_ENDPOINT = 'https://eu.i.posthog.com/capture/';

let _token = '';
let _anonId = '';     // anonymous distinct_id vor dem Login
let _distinctId = ''; // aktueller distinct_id (anon oder User-ID)

/**
 * Einmalig in root +layout.svelte onMount aufrufen.
 * Übernimmt austrofit_anonymous_id als distinct_id, damit pre-login
 * Quiz-Events mit der späteren Registration verlinkt werden können.
 */
export function initAnalytics(token: string) {
  if (!browser || !token || _token) return;
  _token = token;

  _anonId =
    localStorage.getItem('austrofit_anonymous_id') ??
    localStorage.getItem('austrofit_analytics_id') ??
    crypto.randomUUID();

  _distinctId = localStorage.getItem('austrofit_analytics_id') ?? _anonId;

  if (!localStorage.getItem('austrofit_analytics_id')) {
    localStorage.setItem('austrofit_analytics_id', _anonId);
  }
}

/**
 * Nach erfolgreichem Login/Register aufrufen.
 * Sendet PostHog $identify, um die anonyme Session mit der User-ID zu mergen.
 */
export function identifyUser(userId: string) {
  if (!browser || !_token || !userId || _distinctId === userId) return;

  capture('$identify', { $anon_distinct_id: _anonId }, userId);

  _distinctId = userId;
  localStorage.setItem('austrofit_analytics_id', userId);
}

/** Fire-and-forget Event – silent on failure by design. */
export function track(event: string, props: Record<string, unknown> = {}) {
  capture(event, props);
}

function capture(
  event: string,
  props: Record<string, unknown>,
  overrideDistinctId?: string
) {
  if (!browser || !_token) return;

  fetch(PH_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: _token,
      event,
      distinct_id: overrideDistinctId ?? _distinctId,
      timestamp: new Date().toISOString(),
      properties: props
    }),
    keepalive: true // überlebt Seitennavigation
  }).catch(() => {
    /* analytics dürfen die App nie crashen */
  });
}
