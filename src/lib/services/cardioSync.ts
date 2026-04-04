// src/lib/services/cardioSync.ts
// Client-side cardio sync service.
// Reads workout sessions from Capacitor health APIs and posts them to /api/cardio/sync.
// Mirrors the pattern of stepSync.ts.
import { browser } from '$app/environment';
import { Capacitor } from '@capacitor/core';
import { getAccessToken } from '$lib/utils/auth';
import { apiUrl } from '$lib/utils/api';

const LAST_CARDIO_SYNC_KEY = 'austrofit_last_cardio_sync';
const SYNC_THROTTLE_MS = 15 * 60 * 1000; // 15 minutes

// ── Types ──────────────────────────────────────────────────────────────────

export interface CardioSyncClientResult {
  success: boolean;
  weekKey: string;
  equivalentMinutes: number;
  pointsTotal: number;
  pointsDelta: number;
  activityLogsCreated: number;
  skipped: boolean;
  error?: string;
}

// ── Throttle helpers ───────────────────────────────────────────────────────

export function getLastCardioSyncTime(): string | null {
  if (!browser) return null;
  return localStorage.getItem(LAST_CARDIO_SYNC_KEY);
}

export function setLastCardioSyncTime(iso: string): void {
  if (!browser) return;
  localStorage.setItem(LAST_CARDIO_SYNC_KEY, iso);
}

export function shouldSyncCardio(): boolean {
  if (!browser) return false;
  const last = getLastCardioSyncTime();
  if (!last) return true;
  return Date.now() - new Date(last).getTime() > SYNC_THROTTLE_MS;
}

// ── Main sync function ─────────────────────────────────────────────────────

/**
 * Reads workout sessions for the last 9 days (covers current ISO week + 2-day buffer),
 * then posts them to /api/cardio/sync for server-side aggregation + points.
 */
export async function syncCardio(): Promise<CardioSyncClientResult | null> {
  if (!browser) return null;

  let isNative = false;
  try {
    isNative = Capacitor.isNativePlatform();
  } catch { /* Capacitor not available */ }

  if (!isNative) return null;

  const token = getAccessToken();
  if (!token) return null;

  // Read workouts from native health APIs (9 days = current week + 2-day overlap)
  let workouts: Array<{
    workoutType: string;
    durationSeconds: number;
    date: string;
    startDate: string;
    endDate: string;
    sourceName?: string;
  }> = [];

  try {
    const { getWorkoutsForLastDays } = await import('$lib/services/health');
    workouts = await getWorkoutsForLastDays(9);
  } catch (e) {
    console.warn('[cardioSync] getWorkoutsForLastDays failed:', e);
    return null;
  }

  // Determine platform for source tracking
  let platform = 'android';
  try {
    platform = Capacitor.getPlatform();
  } catch { /* default to android */ }

  try {
    const res = await fetch(apiUrl('/api/cardio/sync'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ workouts, platform })
    });

    if (!res.ok) {
      console.warn('[cardioSync] sync failed:', res.status);
      return null;
    }

    const data: CardioSyncClientResult = await res.json();
    setLastCardioSyncTime(new Date().toISOString());
    return data;
  } catch (e) {
    console.warn('[cardioSync] network error:', e);
    return null;
  }
}
