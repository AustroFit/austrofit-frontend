# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (also runs generate-safelist first)
npm run build        # Production build (also runs generate-safelist first)
npm run preview      # Preview production build locally
npm run check        # TypeScript/Svelte type checking
npm run lint         # Prettier + ESLint check
npm run format       # Auto-format with Prettier

# Android / Capacitor
npm run cap:sync        # Sync web build to Android project
npm run cap:open        # Open Android Studio
npm run cap:run         # Run on connected Android device
npm run cap:build       # Static SPA build for release → build/ + cap sync (PUBLIC_API_BASE=https://austrofit.at)
npm run cap:build:dev   # Static SPA build for dev testing → build/ + cap sync (PUBLIC_API_BASE=https://dev.austrofit.at)
```

No test suite is configured in this project.

## Architecture Overview

**SvelteKit** (Svelte 5 runes) + **Tailwind CSS v4** + **Directus 11** CMS + **Capacitor 8** for Android.

### Key Architectural Patterns

**Auth**: Pure client-side localStorage token (`austrofit_access_token`). No httpOnly cookies, no SSR auth. All protected routes check `getAccessToken()` from `$lib/utils/auth.ts` in `onMount`. Server routes read the Bearer token from `Authorization` headers forwarded by the client.

**API Proxy Pattern**: All CMS/Directus calls go through SvelteKit API routes in `src/routes/api/`. Client code never calls Directus directly. Server routes use `DIRECTUS_WRITE_TOKEN` or `PRIVATE_CMS_STATIC_TOKEN` (not the user's token) for privileged operations.

**Tailwind v4**: No `tailwind.config.js`. All theme configuration lives in `src/styles/tokens.css` (color tokens) and the `@theme {}` block in `src/app.css` (spacing, typography, radii). Import order in `app.css`: `@import 'tailwindcss'` → `tokens.css` → `utilities.css` → `component.css`. Dynamically constructed Tailwind classes require `src/lib/tailwind-safelist.svelte` + the `generate-safelist` script.

**Design System**: `src/lib/design-system/classes.js` exports utility functions (`getButtonClasses`, `getCardClasses`, etc.) that compose Tailwind class strings. Use these instead of raw utility classes in new components.

**Svelte 5 Runes**: Use `$state`, `$derived`, `$props`, `$effect` throughout. No Svelte stores pattern for local component state.

**Capacitor Build Modes**: Two modes exist — toggle via `server.url` in `capacitor.config.ts`:
- **Local Build Mode** (default, for releases): `server.url` is commented out. App loads JS/CSS from bundled `build/` (instant navigation). API calls go to `https://austrofit.at` via `PUBLIC_API_BASE`. Build with `npm run cap:build`.
- **Live Server Mode** (for dev iteration): Uncomment `server.url`. App loads everything from the deployed server URL. No build needed, but navigations are slow (network round-trip for every page).

**API URL Helper**: All client-side `fetch()` calls use `apiUrl(path)` from `$lib/utils/api.ts`. This prepends `PUBLIC_API_BASE` (empty string for web/Vercel, `https://austrofit.at` for Capacitor builds). Never use raw `fetch('/api/...')` in client code — always use `fetch(apiUrl('/api/...'))`.

Native health data (steps) is accessed via `$lib/services/health.ts` using `@capgo/capacitor-health`. All health calls are guarded with `isNative()` — they silently no-op in the browser.

### Directory Structure

```
src/
  routes/           # SvelteKit pages + API routes
    api/            # All backend proxy routes (server-side only)
  lib/
    components/     # Svelte components (organized by feature)
    design-system/  # classes.js – Tailwind class composition utilities
    server/         # Server-only utilities (Directus calls, stepsService, cardioService)
    services/       # Client-side services (health.ts, stepSync.ts, cardioSync.ts)
    utils/          # Shared utilities (auth.ts, level.ts, streak.ts, badges.ts)
    stores/         # Svelte stores (for cross-component reactive state)
    data/           # Static data files
  styles/
    tokens.css      # ALL color tokens (single source of truth)
    utilities.css   # Custom Tailwind utilities
    component.css   # Component-level base styles
  app.css           # Entry CSS: imports + @theme block (spacing, fonts, radii)
scripts/
  generate-safelist.js  # Generates Tailwind safelist from dynamic class usage
Directus-JSON-AustroFit/  # CMS export files, CSVs for import
android/              # Capacitor Android project
```

### Gamification Data Flow

Points are recorded in Directus `points_ledger` (append-only). The current balance is always a `SUM(points_delta)` query. **Level** is derived client-side from `earnedPoints` (positive-only sum) via `getLevelInfo()` in `$lib/utils/level.ts` — 20 levels, 0–480.000P, AustroFit branding every 5 levels.

**Steps** → native health → `/api/steps/sync` → `stepsService.ts` (dedup, points calc, tiered streak update via `updateStreak()` in `streak.ts`). Streak-Tag-Bonus tiered: +20/30/45/60P (Tier 1–4). Weekly milestone: +60/90/120/150P.

**Workouts** → native health → `/api/cardio/sync` → `cardioService.ts` (intensity mapping, weekly aggregation, group-specific targets). Cardio streak bonus tiered: +100/200/300/400P per consecutive full week (Tier 1–4).

**Quiz** → anonymous attempt → `/api/quiz-attempts` → `/api/claim` links to user + awards points → `updateQuizStreak()` in `streak.ts` awards daily streak bonus (tiered +5/10/15/20P) and weekly milestone (+30/50/75/100P). Quiz cooldown: 30 days per quiz (configured in Directus `cooldown_days` field).

**Milestones** → one-time bonuses awarded via `awardMilestoneIfNew()` in `$lib/server/milestoneService.ts`. Slugs + points defined in `$lib/utils/milestones.ts`. Dedup: `source_type='milestone'`, `source_ref='milestone-{slug}'`. 22 milestones across steps/cardio/quiz covering first achievements and first 4 weeks of streaks.

### Dev / Test Tools (Browser-only)

Toggle-Sektion in `/profil` → "Entwickler-Tools" (nur sichtbar wenn `!isNativePlatform`).
Alle Flags sind localStorage-Keys und werden im Dashboard/Profil bei `onMount` gelesen:

| localStorage-Key | Flag | Effekt |
|---|---|---|
| `austrofit_dev_native` | `devNativeMode` | Zeigt alle nativen Karten (Schritte, Cardio, Streaks) im Browser |
| `austrofit_test_mode` | `testMode` | Ersetzt Schritt-Karte durch `ManuelleSchrittEingabe.svelte` |
| `austrofit_test_mode_cardio` | `cardioTestMode` | Ersetzt Cardio-Karte durch `ManuelleCardioEingabe.svelte` |

**Wichtig**: `devNativeMode` steuert nur UI-Sichtbarkeit (`showNativeFeatures = isNativePlatform || devNativeMode`).
Die echten Health-Sync-Calls (Capacitor) laufen weiterhin nur wenn `isNativePlatform` true ist.

### Known Gotchas

**Directus `points_ledger.source_ref` is type `string`** — Directus rejects `_gte`/`_lte` on string fields with a 400 error. For date-range queries, generate an explicit `_in` list in the API route (see `/api/ledger-entries/+server.ts`). Max ~31 dates for a month view, ~7 for a week view.

**Directus: two simultaneous `_in` filters on different fields returns empty** — When combining `filter[source_type][_in]` (for multiple source types) with `filter[source_ref][_in]` (for date ranges), Directus 11 returns `{"data":[],"total":0}`. Use `occurred_at_from`/`occurred_at_to` (datetime field, supports `_gte`/`_lte`) instead of `source_ref_from`/`source_ref_to` whenever `source_types` is also filtered.

**`syncSteps()` concurrency** — The service has a module-level `_syncing` flag to block concurrent calls. Background sync + dashboard `onMount` can fire simultaneously; without this guard, multiple ledger entries for the same date accumulate (delta-correction entries). Do not call `syncSteps()` in parallel.

**CircleRing color logic (lap-based)** — `percent` is uncapped (0–∞). Color logic lives in `$lib/utils/progress.ts` (`lapCssColor` for SVG rings, `lapTailwindBg` for progress bars): gray (<100%), primary green (=100%), alternating primary / primary-dark per additional lap. The `displayPercent` for SVG fill is `(percent - 1) % 100 + 1` per lap. The `color` prop is deprecated and ignored.

**Back button on Android (Capacitor)** — `window.history.back()` is unreliable in the Capacitor WebView because SvelteKit's client router doesn't always populate `window.history` as expected. Use `goto(-1)` instead, with a fallback to `/dashboard`. Handler lives in `src/routes/+layout.svelte`.

**Capacitor Local Build Mode – CORS** — Capacitor 8 on Android uses `https://localhost` as the WebView Origin (not `capacitor://localhost`). `vercel.json` must set `Access-Control-Allow-Origin: https://localhost`. Additionally, SvelteKit has no built-in OPTIONS handler — POST/PATCH/DELETE requests trigger a CORS preflight that returns 405 without `src/hooks.server.ts`. The hooks file intercepts OPTIONS and returns 204 with the correct CORS headers.

**Capacitor Local Build Mode – Page loads** — In `adapter-static` SPA mode there is no server. Pages with `+page.server.js` that use `url.searchParams` cannot be prerendered (SvelteKit throws at build time). Rules:
- Public pages with server loads that don't use `url.searchParams`: add `export const prerender = true` to `+page.server.js`.
- Dynamic routes (`[slug]`): convert to a universal `+page.js` that fetches from an `/api/...` proxy route via `apiUrl()`. Never use `+page.server.js` for dynamic routes in Capacitor builds.
- `svelte.config.js`: set `prerender: { crawl: false }` for Capacitor to prevent form-action routes from being crawled.

**`$env/static/public` vs `$env/dynamic/public` in Capacitor builds** — `$env/dynamic/public` requires a running server to inject values at runtime — it always returns `undefined` in a static SPA bundle. Always use `$env/static/public` for values needed client-side in Capacitor (e.g. `PUBLIC_API_BASE`). For Vercel compatibility, provide a `.env.production` file with an empty value (`PUBLIC_API_BASE=`) and add `!.env.production` to `.gitignore`.

**`adapter-static` import in `svelte.config.js`** — Do not statically import `@sveltejs/adapter-static` at the top of `svelte.config.js`. Vercel installs only `devDependencies` that are needed for its build and may not have `adapter-static`. Use a conditional dynamic import: `const adapterStatic = isCapacitor ? (await import('@sveltejs/adapter-static')).default : null`.

### Deployment

- `dev` branch → Vercel preview → `dev.austrofit.at`
- `main` branch → Vercel production → `austrofit.at`
- Always commit/test on `dev` first, then merge to `main`.
- Env vars are set in Vercel (not in repo). Local `.env` has dev values.
- **Vercel** uses `adapter-vercel` (default, no BUILD_TARGET env var set).
- **Capacitor native APK**: `npm run cap:build` → uses `adapter-static` (BUILD_TARGET=capacitor) → `build/` bundle → Android Studio → Play Store.
- `vercel.json` sets CORS headers for `/api/*` routes to allow `https://localhost` origin (Capacitor 8 Android WebView origin).
- `src/hooks.server.ts` handles OPTIONS preflight requests globally (returns 204) — required for POST/PATCH/DELETE from the native app.
