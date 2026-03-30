// src/routes/api/challenges/+server.ts
import { proxyDirectusCollection } from '$lib/server/directusProxy';

export async function GET({ url, fetch }: { url: URL; fetch: typeof globalThis.fetch }) {
  return proxyDirectusCollection('challenges', url.searchParams, fetch, 'public, max-age=300, stale-while-revalidate=60');
}
