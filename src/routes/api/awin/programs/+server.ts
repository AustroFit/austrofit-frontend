// src/routes/api/awin/programs/+server.ts
// GET: Genehmigte AWIN-Advertiser-Programme abrufen
import { json } from '@sveltejs/kit';
import { AWIN_API_TOKEN, AWIN_PUBLISHER_ID } from '$env/dynamic/private';
import { fetchAwinPrograms } from '$lib/server/awin';

export async function GET({ fetch }) {
  const programs = await fetchAwinPrograms(AWIN_API_TOKEN, AWIN_PUBLISHER_ID, fetch);

  return json(
    { data: programs, meta: { total_count: programs.length } },
    {
      headers: {
        // 30 Minuten cachen (Programme ändern sich selten)
        'Cache-Control': 'public, max-age=1800, s-maxage=1800'
      }
    }
  );
}
