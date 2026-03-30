// src/routes/api/tradedoubler/programs/+server.ts
// GET: Tradedoubler-Voucher-Programme abrufen (ohne Codes).
// Codes sind nur über /api/tradedoubler/unlock-code abrufbar.
import { json } from '@sveltejs/kit';
import { fetchTdVouchers, groupVouchersAsPrograms } from '$lib/server/tradedoubler';

export async function GET({ fetch }) {
  const vouchers = await fetchTdVouchers(fetch);
  const programs = groupVouchersAsPrograms(vouchers);

  return json(
    { data: programs, meta: { total_count: programs.length } },
    {
      headers: {
        'Cache-Control': 'public, max-age=600, s-maxage=600'
      }
    }
  );
}
