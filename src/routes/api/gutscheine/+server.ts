// src/routes/api/gutscheine/+server.ts
// GET: Alle eingelösten Gutscheine (reward_redemptions) des eingeloggten Users
//   Auth: Authorization Bearer aus localStorage (austrofit_access_token)
//
// Gibt zurück:
//   { aktiv: [], verwendet: [], abgelaufen: [] }
//   aktiv     = status='active' UND ablaeuft_am > now
//   verwendet = status='used'
//   abgelaufen = status='active' UND ablaeuft_am < now
//
// Zwei-Schritt-Ansatz:
//   1. reward_redemptions mit User-JWT lesen (Row-Level-Permissions → nur eigene Records)
//   2. rewards-Daten separat per DIRECTUS_READ_TOKEN nachladen
//
// Warum User-JWT statt PRIVATE_CMS_STATIC_TOKEN:
//   PRIVATE_CMS_STATIC_TOKEN hat in Directus nur Schreibrechte auf reward_redemptions
//   (wird nur im /api/redeem Endpoint zum Erstellen gebraucht). Das Lesen eigener
//   Einträge erfolgt korrekt über den User-JWT mit Directus Row-Level-Permissions.
import { json } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { DIRECTUS_READ_TOKEN } from '$env/static/private';
import { extractBearerToken, resolveUserId } from '$lib/server/auth';

export interface GutscheinData {
  id: string;
  code: string;
  reward_titel: string;
  beschreibung: string | null;
  punkte_kosten: number;
  partner_name: string;
  erstellt_am: string;
  ablaeuft_am: string;
  eingeloest_am: string | null;
  status: 'active' | 'used';
}

export async function GET({ request, fetch }: { request: Request; fetch: typeof globalThis.fetch }) {
  const token = extractBearerToken(request);
  if (!token) return json({ error: 'unauthorized' }, { status: 401 });

  // 1. User-ID via JWT ermitteln
  const user_id = await resolveUserId(token, PUBLIC_CMSURL, fetch);
  if (!user_id) return json({ error: 'Nicht eingeloggt' }, { status: 401 });

  // 2. reward_redemptions mit User-JWT lesen
  //    Directus Row-Level-Permissions liefern automatisch nur eigene Records.
  //    Expliziter user-Filter als zusätzliche Sicherheit.
  const rdParams = new URLSearchParams({
    'filter[user][_eq]': user_id,
    fields: 'id,status,points_cost,created_at,reward',
    sort: '-created_at',
    limit: '200'
  });

  const rdRes = await fetch(`${PUBLIC_CMSURL}/items/reward_redemptions?${rdParams}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!rdRes.ok) {
    const detail = await rdRes.text().catch(() => '');
    console.error('[gutscheine] reward_redemptions query failed:', rdRes.status, detail);
    return json(
      { error: `Gutscheine konnten nicht geladen werden (${rdRes.status})` },
      { status: 502 }
    );
  }

  const rdBody = await rdRes.json();
  const redemptions: Array<{
    id: number | string;
    status: 'active' | 'used';
    points_cost: number;
    created_at: string;
    reward: number | null;
  }> = rdBody.data ?? [];

  if (redemptions.length === 0) {
    return json({ aktiv: [], verwendet: [], abgelaufen: [] });
  }

  // 3. Eindeutige reward-IDs sammeln und Reward-Daten separat laden
  const rewardIds = [...new Set(redemptions.map((r) => r.reward).filter((id) => id != null))];

  const rewardMap = new Map<
    number,
    {
      id: number;
      title: string;
      description?: string;
      points_cost: number;
      coupon_code?: string;
      partner_name?: string;
    }
  >();

  if (rewardIds.length > 0) {
    const rwParams = new URLSearchParams({
      'filter[id][_in]': rewardIds.join(','),
      fields: 'id,title,description,points_cost,coupon_code,partner_id.name',
      limit: String(rewardIds.length)
    });

    const rwRes = await fetch(`${PUBLIC_CMSURL}/items/rewards?${rwParams}`, {
      headers: { Authorization: `Bearer ${DIRECTUS_READ_TOKEN}` }
    });

    if (rwRes.ok) {
      const rwBody = await rwRes.json();
      for (const r of rwBody.data ?? []) {
        rewardMap.set(r.id, r);
      }
    }
    // Reward-Fehler ist nicht fatal – Gutscheine werden mit Fallback-Daten angezeigt
  }

  // 4. Gutscheine aufbauen und kategorisieren
  const now = Date.now();
  const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

  const aktiv: GutscheinData[] = [];
  const verwendet: GutscheinData[] = [];
  const abgelaufen: GutscheinData[] = [];

  for (const item of redemptions) {
    const ablaeuft_am = new Date(
      new Date(item.created_at).getTime() + NINETY_DAYS_MS
    ).toISOString();

    const reward = item.reward != null ? rewardMap.get(Number(item.reward)) : undefined;

    // Unique code: gleiche Logik wie in /api/redeem – deterministisch aus der redemption-ID.
    const idStr = String(item.id);
    const codeBase = /^\d+$/.test(idStr)
      ? idStr.padStart(6, '0')
      : idStr.slice(-8).toUpperCase();
    const uniqueCode = `AF-${codeBase}`;

    const gutschein: GutscheinData = {
      id: idStr,
      code: uniqueCode,
      reward_titel: reward?.title ?? 'Angebot',
      beschreibung: reward?.description ?? null,
      punkte_kosten: item.points_cost ?? reward?.points_cost ?? 0,
      partner_name: (reward as any)?.partner_id?.name ?? reward?.partner_name ?? '',
      erstellt_am: item.created_at,
      ablaeuft_am,
      eingeloest_am: item.status === 'used' ? item.created_at : null,
      status: item.status
    };

    if (item.status === 'used') {
      verwendet.push(gutschein);
    } else if (new Date(ablaeuft_am).getTime() < now) {
      abgelaufen.push(gutschein);
    } else {
      aktiv.push(gutschein);
    }
  }

  // aktiv: bald ablaufende zuerst (ASC nach ablaeuft_am)
  aktiv.sort((a, b) => a.ablaeuft_am.localeCompare(b.ablaeuft_am));

  return json({ aktiv, verwendet, abgelaufen });
}
