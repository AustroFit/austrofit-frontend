// src/routes/api/app-config/+server.ts
// GET: App-weite Konfiguration aus Directus app_config Collection.
// Gibt immer einen gültigen Config-Datensatz zurück – Fallback auf sichere Defaults
// damit ein fehlendes CMS-Entry nie die App bricht.
import { json } from '@sveltejs/kit';
import { PUBLIC_CMSURL } from '$env/static/public';
import { PRIVATE_CMS_STATIC_TOKEN } from '$env/static/private';

interface AppConfig {
  maintenance_mode: boolean;
  min_app_version: string | null;
  announcement_banner: string | null;
  quiz_enabled: boolean;
  steps_formula_version: string | null;
  health_connect_enabled: boolean;
}

const DEFAULTS: AppConfig = {
  maintenance_mode: false,
  min_app_version: null,
  announcement_banner: null,
  quiz_enabled: true,
  steps_formula_version: 'v1',
  health_connect_enabled: true,
};

export async function GET({ fetch }: { fetch: typeof globalThis.fetch }) {
  try {
    const res = await fetch(
      `${PUBLIC_CMSURL}/items/app_config?limit=1` +
        `&fields=maintenance_mode,min_app_version,announcement_banner,quiz_enabled,steps_formula_version,health_connect_enabled`,
      { headers: { Authorization: `Bearer ${PRIVATE_CMS_STATIC_TOKEN}` } }
    );
    if (!res.ok) return json(DEFAULTS);

    const body = await res.json().catch(() => null);
    const row = body?.data?.[0];
    if (!row) return json(DEFAULTS);

    const config: AppConfig = {
      maintenance_mode: row.maintenance_mode ?? DEFAULTS.maintenance_mode,
      min_app_version: row.min_app_version ?? null,
      announcement_banner: row.announcement_banner ?? null,
      quiz_enabled: row.quiz_enabled ?? DEFAULTS.quiz_enabled,
      steps_formula_version: row.steps_formula_version ?? DEFAULTS.steps_formula_version,
      health_connect_enabled: row.health_connect_enabled ?? DEFAULTS.health_connect_enabled,
    };

    return json(config);
  } catch {
    return json(DEFAULTS);
  }
}
