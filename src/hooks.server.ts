import type { Handle } from '@sveltejs/kit';

// CORS-Preflight für Capacitor native App (Origin: https://localhost)
// Ohne diesen Handler antwortet SvelteKit auf OPTIONS mit 405 → Preflight schlägt fehl
// → POST/PATCH/DELETE-Requests (Login, Sync, etc.) werden vom Browser blockiert.
export const handle: Handle = async ({ event, resolve }) => {
  if (event.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': 'https://localhost',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  }

  const response = await resolve(event);
  return response;
};
