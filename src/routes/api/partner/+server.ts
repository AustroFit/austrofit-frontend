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
      'valid_until',
      'partner_id.id',
      'partner_id.name',
      'partner_id.kategorie',
      'partner_id.region',
      'partner_id.esg_zertifiziert',
      'partner_id.logo_url',
      'partner_id.adresse'
    ].join(','),
    'filter[active][_eq]': 'true',
    sort: 'partner_id.name,points_cost',
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
    valid_until?: string | null;
    partner_id?: {
      id: number;
      name: string;
      kategorie?: string[] | null;
      region?: string | null;
      esg_zertifiziert?: boolean;
      logo_url?: string | null;
      adresse?: string | null;
    } | null;
  }> = body.data ?? [];

  // Nach partner_id gruppieren → ein Objekt pro Partner mit allen Rewards
  const partnerMap = new Map<
    number | string,
    {
      id: string;
      name: string;
      logo_url: string | null;
      kategorie: string[];
      region: string | null;
      esg_zertifiziert: boolean;
      adresse: string | null;
      rewards: object[];
    }
  >();

  for (const r of rewards) {
    const p = r.partner_id;
    const key = p?.id ?? `orphan-${r.id}`;
    const name = p?.name ?? 'Unbekannter Partner';

    if (!partnerMap.has(key)) {
      // logo_url ist eine Directus-File-UUID → Asset-URL konstruieren
      const logoUuid = p?.logo_url ?? null;
      const logoUrl = logoUuid ? `${PUBLIC_CMSURL}/assets/${logoUuid}` : null;

      partnerMap.set(key, {
        id: String(key),
        name,
        logo_url: logoUrl,
        kategorie: p?.kategorie ?? [],
        region: p?.region ?? null,
        esg_zertifiziert: p?.esg_zertifiziert ?? false,
        adresse: p?.adresse ?? null,
        rewards: []
      });
    }

    partnerMap.get(key)!.rewards.push({
      id: String(r.id),
      titel: r.title,
      beschreibung: r.description ?? null,
      punkte_kosten: r.points_cost,
      gueltig_bis: r.valid_until ?? null
    });
  }

  const data = Array.from(partnerMap.values());
  return json({ data, meta: { total_count: data.length } });
}
