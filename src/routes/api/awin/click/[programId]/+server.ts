// src/routes/api/awin/click/[programId]/+server.ts
// GET: Erzeugt AWIN-Deeplink und leitet weiter (Publisher-ID bleibt serverseitig)
// ?url=https://... (optionale Ziel-URL, sonst Advertiser-Homepage)
import { redirect } from '@sveltejs/kit';
import { AWIN_API_TOKEN, AWIN_PUBLISHER_ID } from '$env/dynamic/private';
import { PUBLIC_CMSURL } from '$env/static/public';
import { buildAwinDeeplink, fetchAwinPrograms } from '$lib/server/awin';
import { extractBearerToken, resolveUserId } from '$lib/server/auth';

export async function GET({ params, url, request, fetch }) {
  const advertiserId = parseInt(params.programId, 10);
  if (isNaN(advertiserId)) {
    return new Response('Ungültige Programm-ID', { status: 400 });
  }

  // Ziel-URL: Query-Param ?url= oder Advertiser-Homepage via API
  let targetUrl = url.searchParams.get('url') ?? '';

  if (!targetUrl) {
    // Advertiser-Homepage aus Program-Liste ermitteln
    const programs = await fetchAwinPrograms(AWIN_API_TOKEN, AWIN_PUBLISHER_ID, fetch);
    const program = programs.find((p) => p.id === advertiserId);
    targetUrl = program?.url ?? 'https://austrofit.at';
  }

  // User-ID als clickref für Attribution (optional, kein Pflichtfeld)
  let clickref: string | undefined;
  const token = extractBearerToken(request);
  if (token) {
    const userId = await resolveUserId(token, PUBLIC_CMSURL, fetch);
    if (userId) clickref = userId;
  }

  const deeplink = buildAwinDeeplink(AWIN_PUBLISHER_ID, advertiserId, targetUrl, clickref);

  // 302 statt 301 → nicht permanent cachen (clickref ändert sich je User)
  redirect(302, deeplink);
}
