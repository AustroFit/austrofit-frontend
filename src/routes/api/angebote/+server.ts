// src/routes/api/angebote/+server.ts
import { proxyDirectusCollection } from '$lib/server/directusProxy';

export async function GET({ url, fetch }: { url: URL; fetch: typeof globalThis.fetch }) {
  return proxyDirectusCollection('angebote', url.searchParams, fetch);
}
