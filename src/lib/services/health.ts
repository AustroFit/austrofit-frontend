// src/lib/services/health.ts
// Capacitor Health integration via @capgo/capacitor-health.
// Handles both Android (Health Connect) and iOS (HealthKit) with a unified API.
// Falls back to test mode when not running in a native Capacitor build.
import { browser } from '$app/environment';
import { Capacitor } from '@capacitor/core';
import { Health } from '@capgo/capacitor-health';

const PERMISSION_KEY = 'austrofit_health_permission';
const TEST_MODE_KEY = 'austrofit_test_mode';

// ── Helpers ────────────────────────────────────────────────────────────────

function isNative(): boolean {
  if (!browser) return false;
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * True if health data can be sourced:
 *  - test mode active (manual entry available), OR
 *  - running in a native Capacitor build
 */
export function isHealthAvailable(): boolean {
  if (!browser) return false;
  return localStorage.getItem(TEST_MODE_KEY) === 'true' || isNative();
}

/**
 * Returns the current health permission status.
 * 'unknown' means the user has not been asked yet.
 */
export async function checkHealthPermission(): Promise<'granted' | 'denied' | 'unknown'> {
  if (!browser) return 'unknown';

  // Test mode → bypass native permission
  if (localStorage.getItem(TEST_MODE_KEY) === 'true') return 'granted';

  // Browser / PWA – no native permission available
  if (!isNative()) return 'unknown';

  // Check cached answer first
  const cached = localStorage.getItem(PERMISSION_KEY);
  if (cached === 'granted') return 'granted';
  if (cached === 'denied') return 'denied';

  try {
    const result = await Health.checkAuthorization({ read: ['steps'] });
    const granted = result.readAuthorized.includes('steps');
    return granted ? 'granted' : 'unknown';
  } catch {
    /* plugin not available – treat as unknown */
  }
  return 'unknown';
}

/**
 * Shows the native OS permission dialog.
 * Only works in a Capacitor native build.
 */
export async function requestHealthPermission(): Promise<'granted' | 'denied'> {
  if (!browser || !isNative()) return 'denied';

  try {
    await Health.requestAuthorization({ read: ['steps'], write: [] });
    localStorage.setItem(PERMISSION_KEY, 'granted');
    return 'granted';
  } catch (e) {
    console.warn('[health] requestHealthPermission failed:', e);
    localStorage.setItem(PERMISSION_KEY, 'denied');
    return 'denied';
  }
}

/**
 * Reads total steps for a given date ('YYYY-MM-DD').
 * Returns null when data is unavailable or permission is missing.
 */
export async function getStepsForDate(date: string): Promise<number | null> {
  if (!browser || !isNative()) return null;

  const start = new Date(date + 'T00:00:00');
  const end = new Date(date + 'T23:59:59.999');

  try {
    const result = await Health.queryAggregated({
      dataType: 'steps',
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      bucket: 'day',
      aggregation: 'sum'
    });
    return result.samples?.[0]?.value ?? 0;
  } catch (e) {
    console.warn('[health] getStepsForDate failed:', e);
  }
  return null;
}

/**
 * Reads steps for the last N days as a batch query (newest first).
 */
export async function getStepsForLastDays(
  days: number
): Promise<Array<{ date: string; steps: number }>> {
  if (!browser || !isNative()) return [];

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);

  try {
    const result = await Health.queryAggregated({
      dataType: 'steps',
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      bucket: 'day',
      aggregation: 'sum'
    });

    return (result.samples ?? [])
      .map((s) => {
        // Use local date (not UTC) so Vienna UTC+1 users don't get yesterday's date
        const d = new Date(s.startDate);
        const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return { date: localDate, steps: s.value ?? 0 };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch (e) {
    console.warn('[health] getStepsForLastDays failed:', e);
  }
  return [];
}
