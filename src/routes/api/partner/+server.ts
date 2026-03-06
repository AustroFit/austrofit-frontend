// src/routes/api/partner/+server.ts
// GET: Rewards laden, nach Partner gruppieren, inkl. kategorie/region/esg via Relation
import { json } from '@sveltejs/kit';
import { DIRECTUS_READ_TOKEN } from '$env/static/private';
import { PUBLIC_CMSURL } from '$env/static/public';

export async function GET({ fetch }: { fetch: typeof globalThis.fetch }) {
  const params = new URLSearchParams({
    fields: [
      'id',
      'title',
      'description',
      'points_cost',
      'partner_name',
      'partner_url',
      'coupon_code',
      // Relation zu partner collection (falls partner_id gesetzt ist)
      'partner_id.kategorie',
      'partner_id.region',
      'partner_id.esg_zertifiziert'
    ].join(','),
    'filter[active][_eq]': 'true',
    sort: 'partner_name,points_cost',
    limit: '500'
  });

  const res = await fetch(`${PUBLIC_CMSURL}/items/rewards?${params}`, {
    headers: { Authorization: `Bearer ${DIRECTUS_READ_TOKEN}` }
  });

  if (!res.ok) {
    return json({ data: [] }, { status: res.status });
  }

  const body = await res.json();
  const rewards: Array<{
    id: number;
    title: string;
    description?: string;
    points_cost: number;
    partner_name?: string;
    partner_url?: string;
    coupon_code?: string;
    partner_id?: {
      kategorie?: string;
      region?: string;
      esg_zertifiziert?: boolean;
    } | null;
  }> = body.data ?? [];

  // Nach partner_name gruppieren → synthetische Partner-Objekte
  const partnerMap = new Map<
    string,
    {
      id: string;
      name: string;
      logo_url: string | null;
      kategorie: string | null;
      region: string | null;
      esg_zertifiziert: boolean;
      rewards: object[];
    }
  >();

  for (const r of rewards) {
    const name = r.partner_name ?? 'Unbekannter Partner';
    if (!partnerMap.has(name)) {
      partnerMap.set(name, {
        id: name,
        name,
        logo_url: r.partner_url ?? null,
        kategorie: r.partner_id?.kategorie ?? null,
        region: r.partner_id?.region ?? null,
        esg_zertifiziert: r.partner_id?.esg_zertifiziert ?? false,
        rewards: []
      });
    }
    partnerMap.get(name)!.rewards.push({
      id: String(r.id),
      titel: r.title,
      beschreibung: r.description ?? null,
      punkte_kosten: r.points_cost
    });
  }

  const data = Array.from(partnerMap.values());
  return json({ data, meta: { total_count: data.length } });
}
