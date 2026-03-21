// src/routes/api/awin/programs/+server.ts
// GET: AWIN-Programme mit aktiven Promotions abrufen.
// Nur Programme mit mindestens einem aktiven Rabattcode/Deal werden zurückgegeben.
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
const AWIN_API_TOKEN = env.AWIN_API_TOKEN ?? '';
const AWIN_PUBLISHER_ID = env.AWIN_PUBLISHER_ID ?? '';
import { fetchAwinProgramsWithPromotions } from '$lib/server/awin';

export async function GET({ fetch }) {
  const programs = await fetchAwinProgramsWithPromotions(AWIN_API_TOKEN, AWIN_PUBLISHER_ID, fetch);

  return json(
    { data: programs, meta: { total_count: programs.length } },
    {
      headers: {
        // 10 Minuten cachen – Promotions können sich öfter ändern als Programm-Liste
        'Cache-Control': 'public, max-age=600, s-maxage=600'
      }
    }
  );
}
