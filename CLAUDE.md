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

npm run test          # Vitest Unit Tests (113 Tests, ~400ms)
npm run test:watch    # Tests im Watch-Modus

# Phase 1 (done): src/lib/utils/ — level.ts, streak.ts, progress.ts (51 Tests)
# Phase 2 (done): src/lib/server/ — rateLimit.ts, auth.ts, stepInputValidation (62 Tests)
#   REQ-S-017: isRateLimited (claim 20/h, redeem 10/h, steps_manual 5/15min), Account Lockout
#   REQ-S-012: extractBearerToken (Bug via Test gefunden: "Bearer" ohne Token → null, gefixt 2026-05-25)
#   REQ-S-041: Datum-Validierung, Fraud-Cap (30.000), Steps-Bereich (0–100.000)
# Phase 3 (geplant): E2E mit Playwright nach Go-Live
# Konfiguration: vite.config.js → test.include / test.alias ($lib)

## Project Documentation

- `docs/features.yaml` — Maschinenlesbare Feature-Registry (80 Features, 12 Kategorien). Primäre Referenz für Roadmap, Feature-Status (implemented/in-progress/planned/to-discuss/rejected) und regulatorische Checks. Bei neuen Features oder Statusänderungen hier aktualisieren.
- `docs/compliance.yaml` — Regulierungs-Registry (maschinenlesbare Zusammenfassung mit `law_ref`-Pointern). Enthält Anwendbarkeit, Anforderungen mit Status, Nachweis-Typ und priorisierte `open_actions`. Bei neuen Features auf regulatorische Auswirkungen prüfen und Status hier pflegen.
- `docs/laws/` — **Rechtliche Source of Truth** (Artikel-genaues Screening + Volltext-Analyse). Hierarchie: `docs/laws/[gesetz]/_screening.md` (alle Artikel, Anwendbarkeit) → `docs/laws/[gesetz]/art-XX.md` (Detail, nur anwendbare Artikel). DSGVO vollständig dokumentiert (art-05 bis art-35). Index: `docs/laws/_index.md`.
- `docs/tom.yaml` — TOM-Dokument (Technische und Organisatorische Maßnahmen, Art. 32 DSGVO, Mai 2026). 9 Kategorien, 29 Maßnahmen. Erforderlich für DPIA und DSB-Anfragen. Offene Punkte: Backup-Konzept, AVV-Ablage.
- `docs/market-research/competitive-analysis.yaml` — Wettbewerbsanalyse v1.3 (24 Apps, 11 hoch-übereinstimmend, 13 MI-IDs, User Sentiment, Österreich-Kontext). Basis für REQ-P-Validierung und Förderanträge. Sektionen: `hoch_uebereinstimmend`, `user_sentiment`, `oesterreich_kontext`, `derived_insights`. Aktualisierungsrhythmus: vor jedem Meilenstein (Go-Live, Förderantrag, Pitch) + jährlich vollständig.
- `docs/watchlist.yaml` — Strategische Beobachtungsliste (Technologie, Regulierung, Wettbewerb, Markt, Förderungen). 6 Kategorien, Horizont akut/strategisch/langfristig. Enthält timing-kritische Förderungs-Fenster (NeuFöG, SVS Gründerbegünstigung, aws, FFG, WA Wien). Bei /weekly-review relevante Einträge prüfen.
- `docs/requirements/` — Requirements-Driven Development (REQ-IDs). Fünf YAML-Dateien für Entwicklungssteuerung und Fördernachweis:
  - `product-requirements.yaml` — REQ-P-001–056: Produkt-Anforderungen (MVP P1/P2/P3), feature_ref → features.yaml. Enthält eigene Sektion **Österreichische Gesundheitsziele** (REQ-P-049–056, Ziele 1/2/3/5/6/7/8/9) für Fördernachweis (aws, FFG, WA Wien) und B2G-Positionierung.
  - `regulatory-requirements.yaml` — REQ-R-001–031: Regulatorische Pflichten, compliance_ref → compliance.yaml
  - `system-requirements.yaml` — REQ-S-001–042: Architektur, Security-Guardrails, Performance, Integrationen
  - `user-requirements.yaml` — REQ-U-001–015: User Stories (4 Personas: Anna/Walter/Laura/Thomas)
  - `business-requirements.yaml` — REQ-B-001–027: Unternehmerische Voraussetzungen (Solopreneur). Kategorien: Rechtsstatus (Gewerbe, Gesellschaftsform), IP (Marke, Domains), Finanzen, Versicherung, Verträge (AVV, App Stores, Partner), Rechtsberatung (AGB, DPIA, VVT), Förderungen (aws, FFG, WA Wien), Kommunikation (Impressum, DSA)
- `docs/validation-plan.yaml` — V&V-Plan (Verification & Validation). Drei Ebenen: Phase 1 Unit Tests (51, done), Phase 2 API Security Tests (geplant: claim/redeem/steps/manual), Phase 3 E2E (deferred). Enthält Traceability-Matrix REQ→Test und Validation-Plan (Beta-Testing, PostHog Funnels, UAT-Szenarien). Nachweis für Art. 32 DSGVO TOM und Förderanträge.
- `docs/strategy/milestones.yaml` — Strategische Meilensteine (go-live, nutzer-200, direktpartner-aufbau, break-even, b2g-pilot) mit `requires_features`/`requires_reqs`-Referenzen und Förderantrags-Deadlines. **Primäre Referenz für Phasenziele und Timing.** Status wird NICHT hier gepflegt — ergibt sich durch Lesen von features.yaml + requirements/*.yaml.
- `docs/strategy/financials.yaml` — Finanzplan (Erlösmodell, ARPU-Szenarien, Umsatzprognosen Jahr 1–5, Kostenstruktur, GuV, Break-Even, Kapitalbedarf, Ampelsystem). Zahlen hier updaten wenn sich Annahmen ändern.
- `docs/strategy/marketing.yaml` — Marketingstrategie (AARRR-Funnel + KPIs, Kanäle, Budget nach Phase, AWIN-Status, B2B-Vertrieb). KPIs aktiv tracken und hier pflegen.
- `Directus-JSON-AustroFit/austrofit-business-plan.yaml` — Business Plan v1.3 (statische Narrative: Branche, Porter, ESG, Social Impact, Gründerprofil). Wird durch `/businessplan`-Skill mit aktuellen Daten aus docs/strategy/ angereichert.
- `Directus-JSON-AustroFit/service-blueprint.html` — Service Blueprint B2C v1.1 (User Journey, Phasen)

### Docs-Abhängigkeiten (Single Source of Truth)

```
docs/laws/                    ← Rechtstexte (Primärquelle)
    ↑ law_ref
docs/compliance.yaml          ← Regulierungs-Status
    ↑ compliance_ref
docs/requirements/            ← REQ-IDs (P/R/S/U/B)
    ↑ feature_ref             ↑ req_ref
docs/features.yaml            docs/strategy/milestones.yaml
    ↑ milestone_ref               ↑ milestone_ref
docs/strategy/financials.yaml     docs/strategy/marketing.yaml
```

`/businessplan [zielgruppe]` — generiert aktuellen BP aus allen Docs (aws/ffg/investor/wa-wien/allgemein)

### Requirements-Driven Development (REQ-IDs)

REQ-IDs referenzieren in Commit-Messages, PR-Beschreibungen und Förderanträgen (aws, FFG, WA Wien).
Format: `REQ-P-001` (Produkt), `REQ-R-001` (Regulatorisch), `REQ-S-001` (System), `REQ-U-001` (User), `REQ-B-001` (Business).
Cross-References: `feature_ref` → `docs/features.yaml` (slug), `compliance_ref` → `docs/compliance.yaml`.

**Gesundheitsziele Österreich (REQ-P-049–056):** AustroFit adressiert 8 der 10 Gesundheitsziele (Ziele 1/2/3/5/6/7/8/9). Die Sektion in `product-requirements.yaml` bildet den Fördernachweis (Business Plan Anhang A4, [gesundheitsziele-oesterreich.at](https://gesundheitsziele-oesterreich.at/)) als traceable REQ-IDs ab. Bei Förderanträgen diese IDs in der Wirkungsbeschreibung referenzieren.

## Compliance

**Source of Truth:** `docs/laws/[gesetz]/` (Artikel-Screening + Volltext) → `docs/compliance.yaml` (maschinenlesbare Zusammenfassung) → `docs/requirements/regulatory-requirements.yaml` (REQ-R-IDs).

Anwendbare Regularien: DSGVO/DSG, ePrivacy/TKG 2021, MDR (Disclaimer-Pflicht), ECG/KSchG, UWG, DSA, EU AI Act (ab 08/2026). Nicht anwendbar: BFSG (Kleinstunternehmen), GSpG (§ 1 kein Zufallselement + § 2 kein Einsatz → vollständig gescreent in `docs/laws/gspg/_screening.md`; **Watchlist:** § 58 Abs. 3 bei zufallsbasierten Verlosungen → 5% Abgabe wenn Preiswert > €10.000), ZaDiG (keine Bargeld-Einlösung), NIS2 (Schwellenwert nicht erreicht), GTelG 2012 (kein Gesundheitsdiensteanbieter § 2 Z 2; ELGA/eImpfpass/Datensicherheits-§§ 3–8 nicht anwendbar — gescreent 2026-05-24; Trigger: ELGA-Anbindung oder DiGA-Zertifizierung Phase 3+).

**Compliance-Workflow:**
- Vor neuer Feature-Implementierung: `/compliance <Beschreibung>` — prüft relevante Gesetze und gibt Freigabe
- Vor Go-Live / Sprint-Ende: `/go-live-check` — vollständiger Blocker-Report mit technischen Checks

**Qualitäts- und Test-Workflow:**
- Vor Beta-Launch: `/persona-test [anna|walter|laura|thomas]` — simulierte Nutzer-Validierung (Journey-first, REQ-U-001–015). Kein Ersatz für echte Nutzertests; dient als Pre-Beta UX-Desk-Review. Prüft: User Journeys je Persona, Accessibility für Walter (55+), Pregnant/Chronic-Gruppen-Logik, österreichisches Messaging.
- Für ein spezifisches Feature: `/test-plan <Feature>` — Verifikation (Unit Tests, Security) + Validation + Compliance + DoD
- Wöchentlich: `/weekly-review` — P1-Blocker, Git-Aktivität, Business-Duties

**Offene Go-Live Blocker (P1 — alle blockend):**
- **Hetzner AVV** — Kundencenter → Datenschutz → AV-Vertrag (~5 min, kostenlos). Hetzner hostet alle Nutzerdaten inkl. Gesundheitsdaten.
- **Vercel Pro-Upgrade** — DPA gilt nur für Pro/Enterprise. Hobby-Plan: kein AVV verfügbar.
- **Art. 9-Consent-Text Rechtscheck** — Technisch ✅ implementiert (2026-05-24): Checkbox in Registrierung Step 2, Logging (`gesundheitsdaten_consent_at` / `gesundheitsdaten_consent_version` = `"v1"`) via `/api/auth/init-onboarding`, Widerruf via `/api/consent/revoke` + UI in Profil → Datenschutz. Offen: Wortlaut von Anwalt auf Art.-9-Tauglichkeit prüfen lassen. Bei Textänderung `CONSENT_VERSION` in `registrierung/+page.svelte` von `"v1"` auf `"v2"` bumpen.
- **DPIA** (Art. 35 DSGVO) für Gesundheitsdaten — erfordert Rechtsberatung
- **AGB** — Entwurf in `docs/agb-entwurf.md` (12 §§, Mai 2026). Erfordert Rechtsberatung. Entschieden: kein Punkte-Verfall (§ 4.4), § 9 Änderungsklausel ohne Zustimmungsfiktion (Kündigungsrecht bei Widerspruch, analog MoveEffect). Offen für Anwalt: § 8 Haftung (KSchG § 6 Abs. 1 Z 9 — kein Haftungsausschluss für Körperschäden!), § 9 „fortgesetzte Nutzung = Zustimmung" OGH-konform?, Widerrufsrecht bei kostenloser App (FAGG), Google-OAuth-Consent-Lücke (§ 3). Technisch fehlt noch: AGB-Checkbox im Registrierungsflow + AGB als PDF downloadbar (§ 11 ECG).
- ~~**§ 5a KSchG Informationspflichten**~~ — ✅ erledigt (2026-05-24): Info-Box in Registrierung Step 1 (REQ-R-030)
- **VVT** (Art. 30 DSGVO) — Entwurf in `docs/laws/dsgvo/art-30.md`, muss unterzeichnet werden
- **DSA Art. 16 Meldeverfahren** — ⏳ wartet auf abuse@austrofit.at (E-Mail-Einrichtung). Danach: Link im Impressum/DSE ergänzen (~15 min Code, REQ-R-028)

**Consent-Banner** (`src/lib/components/dashboard/ConsentBanner.svelte`):
- Analytics (PostHog) wird erst nach Einwilligung initialisiert (localStorage `austrofit_analytics_consent`)
- Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) — NICHT berechtigtes Interesse
- `identifyUser()` nach Login verknüpft PostHog-Session mit Nutzer-ID (pseudonymisiert)

**Art. 9-Consent (Gesundheitsdaten)** — implementiert 2026-05-24:
- Explizite Checkbox in Registrierung Step 2 (`src/routes/registrierung/+page.svelte`). Text trägt `RECHTSCHECK`-Kommentar — Anwalt-Freigabe ausstehend.
- `CONSENT_VERSION = 'v1'` in `registrierung/+page.svelte` — bei Textänderung auf `'v2'` bumpen, damit alle v1-Einwilligungen identifizierbar bleiben.
- Logging: `confirmGroup()` ruft `/api/auth/init-onboarding` mit `{ consent_given: true, consent_version: 'v1' }` → schreibt `gesundheitsdaten_consent_at` + `gesundheitsdaten_consent_version` in `user_profiles` (idempotent).
- Widerruf: `POST /api/consent/revoke` → setzt `gesundheitsdaten_consent_revoked_at` + `health_connected = false`. UI in Profil → Datenschutz (zeigt Erteilungsdatum, Widerruf-Button + Bestätigungs-Dialog).
- ~~Lücke: Google-OAuth-Nutzer haben keinen Step-2-Consent~~ ✅ behoben (2026-05-29): Callback (`/api/auth/google/callback`) prüft `user_profiles.gesundheitsdaten_consent_at` — fehlt der Consent → Redirect auf `/registrierung?oauth_onboarding=1`, wo Step 2 (Gruppenauswahl + Art. 9-Checkbox) erzwungen wird. Registrierungsseite erkennt den URL-Parameter im `onMount` und springt direkt zu Step 2.

## Architecture Overview

**SvelteKit** (Svelte 5 runes) + **Tailwind CSS v4** + **Directus 11** CMS + **Capacitor 8** for Android.

### Key Architectural Patterns

**Auth**: Pure client-side localStorage token (`austrofit_access_token`). No httpOnly cookies, no SSR auth. All protected routes check `getAccessToken()` from `$lib/utils/auth.ts` in `onMount`. Server routes read the Bearer token from `Authorization` headers forwarded by the client.

**Google OAuth**: Custom SvelteKit flow (independent of Directus SSO). `GET /api/auth/google` sets CSRF state cookie → redirects to Google. `GET /api/auth/google/callback` exchanges code, finds/creates Directus user via `DIRECTUS_ADMIN_TOKEN`, rotates a temp password to obtain a Directus JWT, stores tokens in localStorage via an HTML response, then redirects to `/dashboard`. New Google users are auto-registered and immediately activated (`status: active`). Existing users get their password rotated per login. Redirect URIs registered in Google Cloud Console: `https://dev.austrofit.at/api/auth/google/callback` and `https://austrofit.at/api/auth/google/callback`.

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

**Milestones** → one-time bonuses awarded via `awardMilestoneIfNew()` in `$lib/server/milestoneService.ts`. Slugs + points defined in `$lib/utils/milestones.ts`. Dedup: `source_type='milestone'`, `source_ref='milestone-{slug}'`. 18 milestones across steps/cardio/quiz covering first achievements and first 4 weeks of streaks.

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

**Directus error messages are always in English — never pass them through to the UI** — Directus returns English error messages (e.g. `"Invalid user credentials"`, `"Field value has to be unique."`). The `translateDirectusError(rawMessage, code)` helper in `$lib/utils/auth.ts` maps known Directus codes/messages to German. Always use this helper (or extend it) when throwing errors from `login()` / `register()`. Never forward `data?.errors?.[0]?.message` directly to the UI. For logic that depends on error type (e.g. "email not verified" → show resend button), check `e?.code` (a stable normalized value set by `login()`) — not `e?.message`, which is now German and would break string matching.

**Gamification Security Guardrails** — Several patterns were hardened after a security review (Mai 2026). Do not revert them:

- **`/api/quiz-attempts` — Allowlist-Payload + max_score-Validierung**: Der Client-Body wird NICHT direkt an Directus weitergeleitet. Stattdessen wird ein `safePayload` mit explizitem Allowlist gebaut. `passed` wird server-seitig aus `score >= max_score` abgeleitet (nie vom Client übernommen); `max_score > 0` ist Pflicht, sonst ist `passed = false`. `eligible_points` wird via `Math.min(200, Number(...))` gecappt (nicht `typeof`-Check, da Strings sonst durchkommen). `completed_at` kommt immer vom Server. **Neu (Mai 2026):** Wenn `quiz`-ID angegeben, wird das Quiz aus Directus geladen (`quiz_json`-Feld) und die autoritative Fragenzahl (`quiz_json.questions.length`) gegen den Client-submitted `max_score` geprüft — Abweichung → 400. Ist Directus nicht erreichbar, schlägt die gesamte Anfrage fehl (fail-closed). Dadurch kann ein Angreifer nicht mehr mit `score:1, max_score:1` beliebige Quizze bestehen.

- **`/api/claim` — Token im Authorization-Header**: Als einziger Endpoint hatte `claim` den JWT im Request-Body (`access_token`). Das ist behoben: Token kommt jetzt aus `extractBearerToken(request)`, `access_token` existiert nicht mehr im Body. Client (`Quiz.svelte`) setzt `Authorization: Bearer <token>` Header. Nicht rückgängig machen.

- **`/api/claim` — Per-User-Cooldown (Bypass-Schutz)**: Der 30-Tage-Cooldown wird jetzt AUCH serverseitig bei `/api/claim` pro User+Quiz durchgesetzt (zusätzlich zum anonymen Check in `/api/quiz-attempts`). Vor dem Ledger-Write wird geprüft ob der User das jeweilige Quiz (`a.quiz`) bereits innerhalb des Cooldown-Fensters geclaimed hat. Verhindert Bypass durch beliebig viele neue `anonymous_id`s. Das `quiz`-Feld muss in der Attempts-Query mitgeladen werden (`fields: id,eligible_points,points_ledger_ref,quiz`).

- **`/api/cardio/sync` — Input-Grenzen**: Max. 50 Workouts pro Request. Jeder Workout wird validiert: `date` muss `/^\d{4}-\d{2}-\d{2}$/` matchen und im Fenster ≤90 Tage Vergangenheit / ≤2 Tage Zukunft liegen; `startDate` muss ein parsbares ISO-8601-Datum sein. Ungültige Einträge werden herausgefiltert (kein 400-Fehler für den ganzen Batch).

- **`stepsService.ts` — STEPS_FRAUD_CAP**: Max. 30.000 Schritte pro Tageseintrag (`STEPS_FRAUD_CAP = 30_000`). Deckt realistische Hochleistungstage ab (Wandern, Vielspazierer). Ursprünglich 20.000 — zu niedrig, da HealthConnect bei Withings+Pixel-Kombination bis zu ~22.000 echte Schritte melden kann. Delta-Korrektur: bei erneutem Sync eines bereits gespeicherten Datums wird ein Differenz-Eintrag geschrieben (kein Duplikat).

- **`cardioService.ts` — durationSeconds Cap**: `getEquivalentMinutes()` cappt `durationSeconds` auf max. 4 Stunden (14.400 s) bevor die Äquivalenz-Minuten berechnet werden. Der Cap liegt in der Funktion selbst, nicht im Endpoint.

- **`streak.ts` — Streak-Wochen-Bonus Dedup**: Der Wochen-Bonus (Abschnitt 6 in `updateStreak`) hat jetzt wie der Quiz-Wochen-Bonus einen Dedup-Check vor dem Schreiben. Fehlt dieser Check, kann ein paralleler API-Call den Bonus doppelt schreiben.

- **`/api/redeem` — Dedup vor Einlösung**: Vor dem Schreiben des `reward_redemptions`-Eintrags wird geprüft ob bereits eine `active`/`used` Einlösung für `(user, reward)` existiert (409 bei Fund). Verhindert Double-Spend durch parallele Requests.

- **Rate-Limiting (`src/lib/server/rateLimit.ts`) — Nicht entfernen**:
  - **IP-basiertes Sliding-Window** (bereits seit Mai 2026): globales Limit auf alle API-Endpunkte.
  - **Per-Account-Lockout** (`recordAuthFailure` / `isAccountLocked`): 5 Fehlversuche / 10 Min pro E-Mail-Adresse → 429. Wird in `/api/auth/login` aufgerufen — verhindert Brute-Force auf Passwörter.
  - **`/api/claim`**: max. 20 Claims / Stunde / IP.
  - **`/api/redeem`**: max. 10 Einlösungen / Stunde / IP.
  - **`/api/steps/manual`**: max. 5 Einträge / 15 Min / IP.

**`PRIVATE_CMS_STATIC_TOKEN` (and `DIRECTUS_WRITE_TOKEN`) cannot access `directus_users`** — Both tokens share the same value in `.env` and belong to a limited policy that only covers custom collections (`points_ledger`, `user_profiles`, `Badges`, etc.). Calling `/users/me` or `/users/{id}` with either token returns empty data or an error — no 403, just silent failure. To read user data (first_name, email, etc.), always use the user's own JWT. Use `/users/me` **without** a `?fields=` parameter — field selection can cause Directus to silently omit fields that the user's role technically has access to. For admin operations on `directus_users` (Google OAuth flow), use `DIRECTUS_ADMIN_TOKEN` — a static token generated on the Administrator user in Directus.

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
| `PRIVATE_CMS_STATIC_TOKEN` | `/api/claim`, `/api/ledger-*`, `/api/profile`, `/api/redeem` | Policy „Write Content API" — Writes auf custom Collections; kein Zugriff auf `directus_users` |
| `DIRECTUS_WRITE_TOKEN` | `/api/auth/*` | Achtung: hat in `.env` denselben Wert wie `PRIVATE_CMS_STATIC_TOKEN` → kein Zugriff auf `directus_users`. Nur noch als Legacy-Bezeichnung vorhanden. |
| `DIRECTUS_ADMIN_TOKEN` | `/api/auth/google/callback` | Echter Admin-Static-Token (Administrator-User in Directus) — darf `directus_users` lesen und schreiben. Nur für Google OAuth Callback. |
| `PUBLIC_API_BASE` | Client `apiUrl()` | Leer für Web/Vercel; `https://austrofit.at` für Capacitor-Build |
| `PUBLIC_POSTHOG_TOKEN` | `$lib/utils/mixpanel.ts` | PostHog EU Cloud (`phc_...`) |
| `PUBLIC_EMAIL_VERIFICATION` | `/registrierung` | Steuert ob Schritt 3 (E-Mail-Bestätigung) angezeigt wird |
| `SCHRITTE_FLOW_ID` | `/api/steps/sync` | Optional — triggert Directus Flow statt direktem stepsService |

**Policy-Gotcha**: `PRIVATE_CMS_STATIC_TOKEN` bekommt keinen automatischen Zugriff auf neue Collections. Bei jeder neuen Directus-Collection beide Policies aktualisieren: „Read Content API" (DIRECTUS_READ_TOKEN) und „Write Content API" (PRIVATE_CMS_STATIC_TOKEN).

## Österreich-Kontext: Markt & Messaging

Diese Regeln gelten für alle Produkt-, Content- und UX-Entscheidungen. Quelle: `docs/market-research/competitive-analysis.yaml` → Sektion `oesterreich_kontext` (v1.3, Mai 2026).

### Messaging-Regeln (was funktioniert / was nicht)

**Nie verwenden:**
- „Geld verdienen durch Gehen" / „earn money for walking" — österreichischer Skeptizismus macht das kontraproduktiv (WeWard/Sweatcoin performen im DACH-Raum deutlich schlechter als in anglophonen Märkten)
- Krypto/Token-Sprache — kein kultureller Fit, regulatorische Grauzone

**Immer verwenden:**
- „Gesund leben und dafür bei lokalen Partnern belohnt werden"
- „Made in Austria" / „Gründer aus Wien" als Vertrauensanker
- EU-Server und DSGVO aktiv kommunizieren (nicht nur implementieren) — 81% der Österreicher vertrauen Datenschutz, aber 5.300 DSB-Beschwerden 2025 zeigen aktives Datenbewusstsein

### Produktentscheidungen mit österreichischem Kontext

**Free-to-use ist nicht verhandelbar:** Nur 9,1% der Österreicher nutzen kostenpflichtige Gesundheits-Apps (Statista 2023). Keine Paywall, kein Freemium-Gate auf Kernfunktionen.

**Cardio ≠ Nebensache:** Top-App im österreichischen Fitness-Segment (Google Play, Aug 2024) ist Komoot (Wandern/Radfahren). Outdoor-Aktivitäten sind kulturell verankert — Cardio-Tracking ist für das österreichische Publikum gleichwertig zu Steps, nicht optional.

**Accessibility ist Pflicht, kein Nice-to-have:** Walter-Persona (55+) ist ein Kernsegment, keine Randgruppe. WCAG 2.1 AA-Konformität ist bereits im Business Plan verankert. Neue UI-Komponenten müssen für ältere Nutzer mit geringerer Digitalkompetenz funktionieren.

**Datenkontrolle kommunizieren:** Österreichische Nutzer erwarten Autonomie über ihre Daten. Der bestehende Consent-Banner und Ledger-Transparenz sind richtig — aktiv in der UI sichtbar machen, nicht verstecken.

### Institutionelle Anker (für Förderanträge und B2G)

| Institution | Relevanz | REQ-Referenz |
|---|---|---|
| Gesundheitsziele Österreich (Ziele 3, 5, 8) | Fördernachweis FFG/aws/WA Wien | REQ-P-049–056 |
| SVS Gesundheitshunderter (≤120€) | Aktivitätsnachweise exportierbar (Phase 3) | REQ-P-043 |
| BGF-Förderung WKO/GKK | B2B-BGM-Kanal für Unternehmen | REQ-P-047 |
| DiGA-Rahmen (ab 2027) | Digitale Gesundheitsapp verschreibbar | REQ-P-042 |
| AIHTA-Studie | AT-spezifischer Wirkungsnachweis für Gamification | Förderanträge |

## Post-Go-Live Roadmap

### Community-Features: Cold-Start-Problem

Community-Features (Leaderboard, Events, Write & Comment) dürfen **nicht vor Go-Live** implementiert werden — und sollten auch unmittelbar nach Go-Live noch nicht priorisiert werden.

**Grund:** Ein leerer Leaderboard oder ein leerer Social Feed signalisiert eine tote App. Das ist aktiv schädlicher als gar kein Community-Feature.

**Mindest-Schwelle:** Community-Features erst angehen wenn ≥200–500 aktive Nutzer vorhanden sind.

**Korrekte Sequenz nach Go-Live:**
1. Ersten 200–500 aktive Nutzer aufbauen (Punkte, Gamification, Bildung, Rewards stehen)
2. Opt-in Leaderboard (REQ-P-025) — niedrigstes Risiko, sofort sichtbarer Mehrwert
3. Community Events / Challenges (REQ-P-026)
4. Write & Comment / Social Feed (REQ-P-046) — erst wenn Moderationskonzept steht

**Marktvalidierung:** WeWard wächst durch Community + Rewards (+150% in 9 Monaten auf 25M Downloads, Stand Mai 2026). Aber WeWard hatte bereits Millionen Nutzer bevor Community-Features viral wurden — die Kausalität ist umgekehrt: Community beschleunigt Wachstum, erzeugt es nicht aus dem Nichts.

**Aktueller Fokus:** P1-Blocker auflösen (Hetzner AVV, Vercel Pro, Art. 9-Consent, DPIA, AGB, VVT) → Go-Live → Nutzerbasis aufbauen → dann Community.

### Deployment

- `dev` branch → Vercel preview → `dev.austrofit.at`
- `main` branch → Vercel production → `austrofit.at`
- Always commit/test on `dev` first, then merge to `main`.
- Env vars are set in Vercel (not in repo). Local `.env` has dev values.
- **Vercel** uses `adapter-vercel` (default, no BUILD_TARGET env var set).
- **Capacitor native APK**: `npm run cap:build` → uses `adapter-static` (BUILD_TARGET=capacitor) → `build/` bundle → Android Studio → Play Store.
- `vercel.json` sets global security headers (`X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`) on all routes, plus CORS headers for `/api/*` routes to allow `https://localhost` origin (Capacitor 8 Android WebView origin).
- `src/hooks.server.ts` handles OPTIONS preflight requests globally (returns 204) — required for POST/PATCH/DELETE from the native app.
