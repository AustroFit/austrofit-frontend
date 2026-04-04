// src/service-worker.ts
// SvelteKit service worker – App Shell Caching + Periodic Background Sync.
//
// Strategie:
//   - App Shell (JS, CSS, HTML): Cache First → sofortige Navigation ohne Netzwerk
//   - API-Calls (/api/*): Network Only → immer frische Daten
//   - Sonstige Requests: Cache First, Fallback auf Network (runtime caching)

/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

declare const self: ServiceWorkerGlobalScope;

// Cache-Name enthält die Build-Version → bei neuem Deploy wird alter Cache automatisch geleert
const CACHE_NAME = `austrofit-shell-${version}`;

// App Shell = alle vom Build erzeugten Assets + statische Files
const APP_SHELL = [...build, ...files];

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

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  // Alte Cache-Versionen löschen
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch handler ─────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API-Calls und externe Requests: immer Network Only (keine Caching)
  if (url.pathname.startsWith('/api/') || url.origin !== self.location.origin) {
    return; // pass-through
  }

  // App Shell: Cache First, Fallback auf Network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        // Nur erfolgreiche GET-Responses cachen
        if (request.method !== 'GET' || !response.ok) return response;

        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      });
    })
  );
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
