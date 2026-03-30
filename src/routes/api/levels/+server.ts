// src/routes/api/levels/+server.ts
// GET: Level-Definitionen aus Directus laden.
// Fällt auf hardcoded LEVEL_DEFS in level.ts zurück wenn Directus nicht erreichbar.
import { json } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { DIRECTUS_READ_TOKEN } from '$env/static/private';
import { LEVEL_DEFS } from '$lib/utils/level';

export async function GET({ fetch }) {
  const params = new URLSearchParams({
    fields: 'id,name,min_points,max_points',
    sort: 'id',
    limit: '25'
  });

  const res = await fetch(`${PUBLIC_CMSURL}/items/levels?${params}`, {
    headers: { Authorization: `Bearer ${DIRECTUS_READ_TOKEN}` }
  });

  if (!res.ok) {
    // Fallback auf hardcoded Werte
    const fallback = LEVEL_DEFS.map((l) => ({
      level: l.level,
      name: l.name,
      min_points: l.min,
      max_points: l.max
    }));
    return json({ data: fallback }, { status: 200 });
  }

  const body = await res.json();
  // Directus liefert 'id' (auto-increment 1–20) als Level-Nummer
  const levels: { level: number; name: string; min_points: number; max_points: number }[] =
    (body.data ?? []).map((r: { id: number; name: string; min_points: number; max_points: number }) => ({
      level: r.id,
      name: r.name,
      min_points: r.min_points,
      max_points: r.max_points
    }));

  if (levels.length === 0) {
    const fallback = LEVEL_DEFS.map((l) => ({
      level: l.level,
      name: l.name,
      min_points: l.min,
      max_points: l.max
    }));
    return json({ data: fallback });
  }

  return json(
    { data: levels },
    {
      headers: {
        // 1 Stunde cachen – Level ändern sich selten
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
      }
    }
  );
}
