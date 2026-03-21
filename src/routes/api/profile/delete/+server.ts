// src/routes/api/profile/delete/+server.ts
// DSGVO-konformes Account-Löschen:
// 1. points_ledger-Einträge löschen
// 2. quiz_attempts-Einträge löschen
// 3. reward_redemptions-Einträge löschen
// 4. User-Account löschen
import { json } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';

export async function DELETE({
  request,
  fetch
}: {
  request: Request;
  fetch: typeof globalThis.fetch;
}) {
  const token = (request.headers.get('authorization') ?? '').replace('Bearer ', '');
  if (!token) return json({ error: 'unauthorized' }, { status: 401 });

  // 1) User-ID ermitteln
  const meRes = await fetch(`${PUBLIC_CMSURL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!meRes.ok) return json({ error: 'unauthorized' }, { status: 401 });
  const me = await meRes.json();
  const userId = me?.data?.id as string | undefined;
  if (!userId) return json({ error: 'user not found' }, { status: 404 });

  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}`
  };

  try {
    // 2) Alle points_ledger-Einträge des Users löschen
    const ledgerRes = await fetch(
      `${PUBLIC_CMSURL}/items/points_ledger?filter[user][_eq]=${userId}&fields=id&limit=500`,
      { headers: adminHeaders }
    );
    if (ledgerRes.ok) {
      const ld = await ledgerRes.json();
      const ids: string[] = (ld.data ?? []).map((e: { id: string }) => e.id);
      if (ids.length > 0) {
        await fetch(`${PUBLIC_CMSURL}/items/points_ledger`, {
          method: 'DELETE',
          headers: adminHeaders,
          body: JSON.stringify(ids)
        });
      }
    }

    // 3) Alle quiz_attempts des Users löschen
    const attemptsRes = await fetch(
      `${PUBLIC_CMSURL}/items/quiz_attempts?filter[user][_eq]=${userId}&fields=id&limit=500`,
      { headers: adminHeaders }
    );
    if (attemptsRes.ok) {
      const at = await attemptsRes.json();
      const ids: string[] = (at.data ?? []).map((e: { id: string }) => e.id);
      if (ids.length > 0) {
        await fetch(`${PUBLIC_CMSURL}/items/quiz_attempts`, {
          method: 'DELETE',
          headers: adminHeaders,
          body: JSON.stringify(ids)
        });
      }
    }

    // 3b) Alle reward_redemptions des Users löschen
    const redemptionsRes = await fetch(
      `${PUBLIC_CMSURL}/items/reward_redemptions?filter[user][_eq]=${userId}&fields=id&limit=500`,
      { headers: adminHeaders }
    );
    if (redemptionsRes.ok) {
      const rd = await redemptionsRes.json();
      const ids: string[] = (rd.data ?? []).map((e: { id: string }) => e.id);
      if (ids.length > 0) {
        await fetch(`${PUBLIC_CMSURL}/items/reward_redemptions`, {
          method: 'DELETE',
          headers: adminHeaders,
          body: JSON.stringify(ids)
        });
      }
    }

    // 4) User-Account löschen
    const deleteRes = await fetch(`${PUBLIC_CMSURL}/users/${userId}`, {
      method: 'DELETE',
      headers: adminHeaders
    });
    if (!deleteRes.ok) {
      const t = await deleteRes.text();
      return json({ error: 'Benutzer konnte nicht gelöscht werden', details: t }, { status: 500 });
    }

    return json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unbekannter Fehler';
    return json({ error: msg }, { status: 500 });
  }
}
