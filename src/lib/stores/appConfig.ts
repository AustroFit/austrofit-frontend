// src/lib/stores/appConfig.ts
// App-weite Konfiguration aus Directus app_config.
// Initialisiert mit sicheren Defaults (sofort verfügbar, kein Flicker).
// Wird in +layout.svelte via /api/app-config mit CMS-Daten überschrieben.
import { writable } from 'svelte/store';

export interface AppConfig {
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

export const appConfig = writable<AppConfig>(DEFAULTS);
