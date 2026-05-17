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

## Project Documentation

- `docs/features.yaml` — Maschinenlesbare Feature-Registry (54 Features, 12 Kategorien). Primäre Referenz für Roadmap, Feature-Status (implemented/in-progress/planned/to-discuss/rejected) und regulatorische Checks. Bei neuen Features oder Statusänderungen hier aktualisieren.
- `Directus-JSON-AustroFit/austrofit-business-plan.yaml` — Business Plan v1.3 (Markt, Finanzen, Gamification-Formeln)
- `Directus-JSON-AustroFit/service-blueprint.html` — Service Blueprint B2C v1.1 (User Journey, Phasen)

## Architecture Overview

**SvelteKit** (Svelte 5 runes) + **Tailwind CSS v4** + **Directus 11** CMS + **Capacitor 8** for Android.

### Key Architectural Patterns

**Auth**: Pure client-side localStorage token (`austrofit_access_token`). No httpOnly cookies, no SSR auth. All protected routes check `getAccessToken()` from `$lib/utils/auth.ts` in `onMount`. Server routes read the Bearer token from `Authorization` headers forwarded by the client.

**API Proxy Pattern**: All CMS/Directus calls go through SvelteKit API routes in `src/routes/api/`. Client code never calls Directus directly. Server routes use `DIRECTUS_WRITE_TOKEN` or `PRIVATE_CMS_STATIC_TOKEN` (not the user's token) for privileged operations. Always use `qs()` from `$lib/utils/qs` to build Directus query strings — never `new URLSearchParams()` directly.

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

### MCP Server (Directus)

`scripts/mcp-directus.mjs` — read-only Directus MCP Server, konfiguriert in `.claude/settings.json` (`node --env-file=.env scripts/mcp-directus.mjs`). Nach Session-Neustart verfügbar.

Verfügbare Tools: `list_collections`, `get_fields`, `get_relations`, `read_items`, `read_item`, `schema_snapshot`, `read_ledger_entries`, `read_user_profile`, `check_quiz_status`.

**Wichtig**: Vor `?fields=`-Queries immer `get_fields` aufrufen — ein ungültiger Feldname bricht die gesamte Directus-Response ohne Fehlermeldung (gibt `{"data":[]}` zurück).

### Known Gotchas

**Directus `points_ledger.source_ref` is type `string`** — Directus rejects `_gte`/`_lte` on string fields with a 400 error. For date-range queries, generate an explicit `_in` list in the API route (see `/api/ledger-entries/+server.ts`). Max ~31 dates for a month view, ~7 for a week view.

**Directus: two simultaneous `_in` filters on different fields returns empty** — When combining `filter[source_type][_in]` (for multiple source types) with `filter[source_ref][_in]` (for date ranges), Directus 11 returns `{"data":[],"total":0}`. Fix: switch `source_type` to `_eq` (not `_in`) when filtering a single type — then `source_ref[_in]` works. Avoid `occurred_at[_gte/_lte]` as a workaround (see next gotcha).

**`occurred_at` unreliable for retroactive syncs** — Historical catch-up syncs set `occurred_at = NOW()` (sync time), not the activity date/week. Month-view queries using `occurred_at` ranges silently miss retroactively synced entries. (1) **Schritte** (`schritte/+page.svelte`): fetch all entries without date filter (`limit: 500`, no `occurred_at`), filter client-side by `source_ref` (= step date YYYY-MM-DD). (2) **Cardio** (`cardio/history/+server.ts`): `source_ref = 'cardio-YYYY-Wnn'` — generate ISO week keys for the viewed month and filter with `source_ref[_in]` (safe since `source_type` uses `_eq`, avoiding the two-`_in` clash).

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

**Directus field query with invalid field name breaks entire response** — If a `?fields=` list includes a field that doesn't exist in the Directus schema (e.g. `description` on `points_ledger`), Directus rejects the entire query and returns `{"data":[]}` with no error. Always verify field names via MCP `get_fields` before adding them to a query.

**Gamification Security Guardrails** — Several patterns were hardened after a security review (Mai 2026). Do not revert them:

- **`/api/quiz-attempts` — Allowlist-Payload + max_score-Validierung**: Der Client-Body wird NICHT direkt an Directus weitergeleitet. Stattdessen wird ein `safePayload` mit explizitem Allowlist gebaut. `passed` wird server-seitig aus `score >= max_score` abgeleitet (nie vom Client übernommen); `max_score > 0` ist Pflicht, sonst ist `passed = false`. `eligible_points` wird via `Math.min(200, Number(...))` gecappt (nicht `typeof`-Check, da Strings sonst durchkommen). `completed_at` kommt immer vom Server. **Neu (Mai 2026):** Wenn `quiz`-ID angegeben, wird das Quiz aus Directus geladen (`quiz_json`-Feld) und die autoritative Fragenzahl (`quiz_json.questions.length`) gegen den Client-submitted `max_score` geprüft — Abweichung → 400. Ist Directus nicht erreichbar, schlägt die gesamte Anfrage fehl (fail-closed). Dadurch kann ein Angreifer nicht mehr mit `score:1, max_score:1` beliebige Quizze bestehen.

- **`/api/claim` — Token im Authorization-Header**: Als einziger Endpoint hatte `claim` den JWT im Request-Body (`access_token`). Das ist behoben: Token kommt jetzt aus `extractBearerToken(request)`, `access_token` existiert nicht mehr im Body. Client (`Quiz.svelte`) setzt `Authorization: Bearer <token>` Header. Nicht rückgängig machen.

- **`/api/claim` — Per-User-Cooldown (Bypass-Schutz)**: Der 30-Tage-Cooldown wird jetzt AUCH serverseitig bei `/api/claim` pro User+Quiz durchgesetzt (zusätzlich zum anonymen Check in `/api/quiz-attempts`). Vor dem Ledger-Write wird geprüft ob der User das jeweilige Quiz (`a.quiz`) bereits innerhalb des Cooldown-Fensters geclaimed hat. Verhindert Bypass durch beliebig viele neue `anonymous_id`s. Das `quiz`-Feld muss in der Attempts-Query mitgeladen werden (`fields: id,eligible_points,points_ledger_ref,quiz`).

- **`/api/cardio/sync` — Input-Grenzen**: Max. 50 Workouts pro Request. Jeder Workout wird validiert: `date` muss `/^\d{4}-\d{2}-\d{2}$/` matchen und im Fenster ≤90 Tage Vergangenheit / ≤2 Tage Zukunft liegen; `startDate` muss ein parsbares ISO-8601-Datum sein. Ungültige Einträge werden herausgefiltert (kein 400-Fehler für den ganzen Batch).

- **`cardioService.ts` — durationSeconds Cap**: `getEquivalentMinutes()` cappt `durationSeconds` auf max. 4 Stunden (14.400 s) bevor die Äquivalenz-Minuten berechnet werden. Der Cap liegt in der Funktion selbst, nicht im Endpoint.

- **`streak.ts` — Streak-Wochen-Bonus Dedup**: Der Wochen-Bonus (Abschnitt 6 in `updateStreak`) hat jetzt wie der Quiz-Wochen-Bonus einen Dedup-Check vor dem Schreiben. Fehlt dieser Check, kann ein paralleler API-Call den Bonus doppelt schreiben.

- **`/api/redeem` — Dedup vor Einlösung**: Vor dem Schreiben des `reward_redemptions`-Eintrags wird geprüft ob bereits eine `active`/`used` Einlösung für `(user, reward)` existiert (409 bei Fund). Verhindert Double-Spend durch parallele Requests.

**`PRIVATE_CMS_STATIC_TOKEN` cannot access `directus_users`** — This token's policy covers only custom collections (`points_ledger`, `user_profiles`, `Badges`, etc.), not Directus system collections. Calling `/users/me` or `/users/{id}` with this token returns an error. To read user data (first_name, email, etc.), always use the user's own JWT. Use `/users/me` **without** a `?fields=` parameter — field selection can cause Directus to silently omit fields that the user's role technically has access to.

**`user_profiles.totalSteps` is camelCase** — Unlike all other Directus fields (snake_case), this field is named `totalSteps` (camelCase). Using `total_steps` in a `?fields=` query silently returns no data (same failure mode as an invalid field name). Always write `totalSteps` when querying or patching this field.

**`npm run cap:build:dev` schlägt auf Windows fehl** — Inline-Env-Vars (`PUBLIC_API_BASE=... npx vite build`) funktionieren in PowerShell nicht. Workaround — drei Befehle separat ausführen:
```powershell
node scripts/generate-safelist.js
$env:BUILD_TARGET="capacitor"; $env:PUBLIC_API_BASE="https://dev.austrofit.at"; npx vite build
npx cap sync android
```

### Environment Variables

| Variable | Verwendet von | Hinweis |
|---|---|---|
| `PUBLIC_CMSURL` | Alle Server-Routes | Directus Base-URL |
| `DIRECTUS_READ_TOKEN` | `/api/badges`, `/api/partner`, `/api/quizzes` | Policy „Read Content API" — nur publizierten Content |
| `PRIVATE_CMS_STATIC_TOKEN` | `/api/claim`, `/api/ledger-*`, `/api/profile`, `/api/redeem` | Policy „Static Token API" — Writes auf custom Collections; kein Zugriff auf `directus_users` |
| `DIRECTUS_WRITE_TOKEN` | `/api/auth/*` | Admin-Token für Auth-Flows |
| `PUBLIC_API_BASE` | Client `apiUrl()` | Leer für Web/Vercel; `https://austrofit.at` für Capacitor-Build |
| `PUBLIC_POSTHOG_TOKEN` | `$lib/utils/mixpanel.ts` | PostHog EU Cloud (`phc_...`) |
| `PUBLIC_EMAIL_VERIFICATION` | `/registrierung` | Steuert ob Schritt 3 (E-Mail-Bestätigung) angezeigt wird |
| `SCHRITTE_FLOW_ID` | `/api/steps/sync` | Optional — triggert Directus Flow statt direktem stepsService |

**Policy-Gotcha**: `PRIVATE_CMS_STATIC_TOKEN` bekommt keinen automatischen Zugriff auf neue Collections. Bei jeder neuen Directus-Collection beide Policies aktualisieren: „Read Content API" (DIRECTUS_READ_TOKEN) und „Static Token API" (PRIVATE_CMS_STATIC_TOKEN).

### Deployment

- `dev` branch → Vercel preview → `dev.austrofit.at`
- `main` branch → Vercel production → `austrofit.at`
- Always commit/test on `dev` first, then merge to `main`.
- Env vars are set in Vercel (not in repo). Local `.env` has dev values.
- **Vercel** uses `adapter-vercel` (default, no BUILD_TARGET env var set).
- **Capacitor native APK**: `npm run cap:build` → uses `adapter-static` (BUILD_TARGET=capacitor) → `build/` bundle → Android Studio → Play Store.
- `vercel.json` sets CORS headers for `/api/*` routes to allow `https://localhost` origin (Capacitor 8 Android WebView origin).
- `src/hooks.server.ts` handles OPTIONS preflight requests globally (returns 204) — required for POST/PATCH/DELETE from the native app.
