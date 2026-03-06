// src/service-worker.ts
// SvelteKit service worker – handles Periodic Background Sync for step tracking.
// Note: Periodic Background Sync is only supported in Chrome/Android.
//       On iOS (Safari), sync happens exclusively via Trigger A (app open).

/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

const IDB_NAME = 'austrofit-flags';
const IDB_VERSION = 1;
const IDB_STORE = 'flags';

// ── IndexedDB helper ──────────────────────────────────────────────────────────

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

async function setPendingSyncFlag(): Promise<void> {
  const db = await openFlagDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put({ key: 'pending_sync', value: true });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

self.addEventListener('install', () => {
  // Activate immediately without waiting for old SW to be removed
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ── Periodic Background Sync ──────────────────────────────────────────────────
// Fires at most once per day on Android Chrome when permission is granted.
// Cannot access Capacitor/HealthKit APIs from a service worker context,
// so we set a flag in IndexedDB that the app reads on next open (Trigger A).

self.addEventListener('periodicsync', (event: any) => {
  if (event.tag === 'austrofit-step-sync') {
    event.waitUntil(
      setPendingSyncFlag().catch((e) =>
        console.warn('[SW] setPendingSyncFlag failed:', e)
      )
    );
  }
});

// ── Fetch handler (pass-through, no caching) ──────────────────────────────────
// Add caching strategies here if offline support is needed in the future.

self.addEventListener('fetch', () => {
  // pass-through: no caching implemented yet
});
