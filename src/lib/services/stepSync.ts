// src/lib/services/stepSync.ts
// Client-side step sync service.
// Reads steps from Capacitor health APIs and posts them to /api/steps/sync.
import { browser } from '$app/environment';
import { Capacitor } from '@capacitor/core';
import { getAccessToken } from '$lib/utils/auth';

const LAST_SYNC_KEY = 'austrofit_last_step_sync';
const SYNC_THROTTLE_MS = 15 * 60 * 1000; // 15 minutes
const IDB_NAME = 'austrofit-flags';
const IDB_VERSION = 1;
const IDB_STORE = 'flags';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SyncResult {
  synced: number;        // days successfully recorded
  skipped: number;       // days already recorded (duplicates)
  punkte_total: number;  // total points awarded in this sync
  errors: string[];      // per-day error messages
  last_sync: string;     // ISO timestamp of this sync
}

// ── IndexedDB helper (shared with service worker) ─────────────────────────────

function openFlagDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(IDB_STORE, { keyPath: 'key' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function checkPendingSyncFlag(): Promise<boolean> {
  if (!browser) return false;
  try {
    const db = await openFlagDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get('pending_sync');
      req.onsuccess = () => resolve(req.result?.value === true);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

export async function clearPendingSyncFlag(): Promise<void> {
  if (!browser) return;
  try {
    const db = await openFlagDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).delete('pending_sync');
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch { /* ignore */ }
}

// ── Last sync time ────────────────────────────────────────────────────────────

export function getLastSyncTime(): string | null {
  if (!browser) return null;
  return localStorage.getItem(LAST_SYNC_KEY);
}

export function setLastSyncTime(iso: string): void {
  if (!browser) return;
  localStorage.setItem(LAST_SYNC_KEY, iso);
}

// ── Throttle check ────────────────────────────────────────────────────────────

export function shouldSync(): boolean {
  if (!browser) return false;
  const last = getLastSyncTime();
  if (!last) return true;
  return Date.now() - new Date(last).getTime() > SYNC_THROTTLE_MS;
}

// ── Background sync registration ──────────────────────────────────────────────

export async function registerBackgroundSync(): Promise<boolean> {
  if (!browser) return false;
  if (!('serviceWorker' in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    if (!('periodicSync' in registration)) {
      console.log('[stepSync] Periodic Background Sync not supported (iOS/Firefox)');
      return false;
    }

    const status = await navigator.permissions.query({
      name: 'periodic-background-sync' as PermissionName
    });

    if (status.state === 'granted') {
      await (registration as any).periodicSync.register('austrofit-step-sync', {
        minInterval: 24 * 60 * 60 * 1000 // 1 day
      });
      console.log('[stepSync] Periodic Background Sync registered');
      return true;
    }
  } catch (e) {
    console.log('[stepSync] Background Sync registration failed:', e);
  }
  return false;
}

// ── Main sync function ────────────────────────────────────────────────────────

export async function syncSteps(options: {
  days?: number;
  mode?: 'automatic' | 'manual';
  onProgress?: (day: number, total: number) => void;
} = {}): Promise<SyncResult> {
  const { days = 7, mode = 'automatic', onProgress } = options;

  const empty: SyncResult = {
    synced: 0,
    skipped: 0,
    punkte_total: 0,
    errors: [],
    last_sync: new Date().toISOString()
  };

  if (!browser) return empty;

  let isNative = false;
  try {
    isNative = Capacitor.isNativePlatform();
  } catch { /* Capacitor not available */ }

  if (!isNative) return empty;

  const token = getAccessToken();
  if (!token) return empty;

  // Read steps from native health APIs
  let stepData: Array<{ date: string; steps: number }> = [];
  try {
    const { getStepsForLastDays } = await import('$lib/services/health');
    stepData = await getStepsForLastDays(days);
  } catch (e) {
    console.warn('[stepSync] getStepsForLastDays failed:', e);
    return empty;
  }

  if (!stepData.length) return empty;

  const result: SyncResult = {
    synced: 0,
    skipped: 0,
    punkte_total: 0,
    errors: [],
    last_sync: new Date().toISOString()
  };

  for (let i = 0; i < stepData.length; i++) {
    const { date, steps } = stepData[i];
    onProgress?.(i + 1, stepData.length);

    try {
      const res = await fetch('/api/steps/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ date, steps, mode })
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        result.errors.push(`${date}: HTTP ${res.status} ${errBody}`);
        continue;
      }

      const data = await res.json();

      if (data?.skipped) {
        result.skipped++;
      } else if (data?.success) {
        result.synced++;
        result.punkte_total += data.punkte ?? 0;
      } else if (data?.error) {
        result.errors.push(`${date}: ${data.error}`);
      }
    } catch (e: any) {
      result.errors.push(`${date}: ${e?.message ?? 'Netzwerkfehler'}`);
    }
  }

  setLastSyncTime(result.last_sync);
  return result;
}
