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
npm run cap:sync     # Sync web build to Android project
npm run cap:open     # Open Android Studio
npm run cap:run      # Run on connected Android device
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

**Capacitor Live Server Mode**: The Android app loads from `https://dev.austrofit.at` (configured in `capacitor.config.ts`). Native health data (steps) is accessed via `$lib/services/health.ts` using `@capgo/capacitor-health`. All health calls are guarded with `isNative()` — they silently no-op in the browser.

### Directory Structure

```
src/
  routes/           # SvelteKit pages + API routes
    api/            # All backend proxy routes (server-side only)
  lib/
    components/     # Svelte components (organized by feature)
    design-system/  # classes.js – Tailwind class composition utilities
    server/         # Server-only utilities (Directus calls, stepsService)
    services/       # Client-side services (health.ts, stepSync.ts)
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

Points are recorded in Directus `points_ledger` (append-only). The current balance is always a `SUM(points_delta)` query. Steps from native health → `/api/steps/sync` → `stepsService.ts` (deduplication, points calc, streak update). Level is derived client-side from total points via `getLevelInfo()` in `$lib/utils/level.ts`.

### Deployment

- `dev` branch → Vercel preview → `dev.austrofit.at`
- `main` branch → Vercel production → `austrofit.at`
- Always commit/test on `dev` first, then merge to `main`.
- Env vars are set in Vercel (not in repo). Local `.env` has dev values.
