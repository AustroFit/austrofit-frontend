// src/routes/api/tradedoubler/click/[programId]/+server.ts
// GET: Erzeugt Tradedoubler UTS-Tracking-Link und leitet weiter.
// Publisher-ID und Site-ID bleiben serverseitig.
// ?url=https://... (Ziel-URL; ohne Parameter wird programUrl aus TD-Daten verwendet)
import { redirect } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { buildTdDeeplink, fetchTdVouchers } from '$lib/server/tradedoubler';
import { extractBearerToken, resolveUserId } from '$lib/server/auth';

export async function GET({ params, url, request, fetch }) {
  const programId = parseInt(params.programId, 10);
  if (isNaN(programId)) {
    return new Response('Ungültige Programm-ID', { status: 400 });
  }

  // Ziel-URL: Query-Param ?url= oder erste passende programUrl aus Voucher-Cache
  let targetUrl = url.searchParams.get('url') ?? '';

  if (!targetUrl) {
    const vouchers = await fetchTdVouchers(fetch);
    const match = vouchers.find((v) => v.programId === programId);
    targetUrl = match?.programUrl ?? 'https://austrofit.at';
  }

  // User-ID als epi für Attribution (optional)
  let epi: string | undefined;
  const token = extractBearerToken(request);
  if (token) {
    const userId = await resolveUserId(token, PUBLIC_CMSURL, fetch);
    if (userId) epi = userId;
  }

  const deeplink = buildTdDeeplink(programId, targetUrl, epi);

  redirect(302, deeplink);
}
