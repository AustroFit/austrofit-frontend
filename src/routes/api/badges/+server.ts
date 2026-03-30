// src/routes/api/badges/+server.ts
// Liefert alle publizierten Directus-Badges mit earned-Flag basierend auf total_steps des Users.
import { json } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN, DIRECTUS_READ_TOKEN } from '$env/static/private';
import { extractBearerToken, resolveUserId } from '$lib/server/auth';

export async function GET({ request, fetch }: { request: Request; fetch: typeof globalThis.fetch }) {
  const token = extractBearerToken(request);
  if (!token) return json({ error: 'unauthorized' }, { status: 401 });

  const userId = await resolveUserId(token, PUBLIC_CMSURL, fetch);
  if (!userId) return json({ error: 'unauthorized' }, { status: 401 });

  const [badgesRes, profileRes] = await Promise.all([
    fetch(
      `${PUBLIC_CMSURL}/items/Badges?filter[status][_eq]=published&sort[]=sort&limit=-1` +
        `&fields=id,slug,name,description,hint,step_threshold,condition_type,kategorie,typ,sort,images`,
      { headers: { Authorization: `Bearer ${DIRECTUS_READ_TOKEN}` } }
    ),
    fetch(
      `${PUBLIC_CMSURL}/items/user_profiles?filter[user][_eq]=${userId}&fields=total_steps&limit=1`,
      { headers: { Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}` } }
    )
  ]);

  const badgesData = badgesRes.ok ? await badgesRes.json().catch(() => null) : null;
  const profileData = profileRes.ok ? await profileRes.json().catch(() => null) : null;

  const badges: DirectusBadge[] = badgesData?.data ?? [];
  const totalSteps = Number(profileData?.data?.[0]?.total_steps ?? 0);

  const result = badges.map((b) => ({
    ...b,
    earned: b.condition_type === 'total_steps' ? totalSteps >= b.step_threshold : false,
    image_url: b.images ? `${PUBLIC_CMSURL}/assets/${b.images}` : null
  }));

  return json({ badges: result, total_steps: totalSteps });
}

interface DirectusBadge {
  id: number;
  slug: string;
  name: string;
  description: string;
  hint: string;
  step_threshold: number;
  condition_type: string;
  kategorie: string;
  typ: string;
  sort: number;
  images: string | null;
}
