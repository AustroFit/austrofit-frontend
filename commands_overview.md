# AustroFit Frontend – Commands Übersicht

## Entwicklung

| Command | Beschreibung |
|---|---|
| `npm run dev` | Dev-Server starten (generiert Tailwind-Safelist automatisch) |
| `npm run build` | Production-Build für Vercel |
| `npm run preview` | Production-Build lokal vorschauen |

## Qualität

| Command | Beschreibung |
|---|---|
| `npm test` | Unit-Tests ausführen (Vitest) |
| `npm run check` | TypeScript + Svelte Type-Checking |
| `npm run lint` | Prettier + ESLint Prüfung |
| `npm run format` | Auto-Format mit Prettier |

### Testdateien

Die Tests liegen co-lokiert neben den Quelldateien (`*.test.ts`):

| Datei | Testet |
|---|---|
| `src/lib/utils/level.test.ts` | `getLevelInfo()` – Level-Berechnung, Grenzwerte, Maxlevel |
| `src/lib/utils/streak.test.ts` | `calculatePoints()`, `lookupTierBonus()`, `calculateStreakDays()` – alle Tier-Übergänge |
| `src/lib/utils/progress.test.ts` | `lapDisplayPercent()`, `lapCssColor()`, `lapTailwindBg()` – Lap-Logik |

## Android / Capacitor

| Command | Beschreibung |
|---|---|
| `npm run cap:sync` | Web-Build in Android-Projekt synchronisieren |
| `npm run cap:open` | Android Studio öffnen |
| `npm run cap:run` | Auf verbundenem Android-Gerät ausführen |
| `npm run cap:build` | Release-Bundle → `build/` + cap sync (API: `https://austrofit.at`) |
| `npm run cap:build:dev` | Dev-Bundle → `build/` + cap sync (API: `https://dev.austrofit.at`) |

> **Hinweis Capacitor Build-Modus:** Vor `cap:build` / `cap:build:dev` muss `server.url` in
> `capacitor.config.ts` auskommentiert sein (Local Build Mode). Beim täglichen Entwickeln
> (Live Server Mode) ist `server.url` einkommentiert – kein Build nötig.

## Claude Code Custom Commands (Skills)

| Skill | Beschreibung |
|---|---|
| `/smoke-test` | Manuelle Smoke-Test-Checkliste für kritische User Flows |
| `/test-formulas` | Gamification-Formeln interaktiv prüfen (Punkte, Streak, Level) |
| `/deploy` | Deploy auf `dev`-Branch anstoßen |
| `/deploy-check` | Deploy-Status und Vercel-Preview prüfen |
| `/cap-test` | Capacitor Local Build testen |
| `/ledger-audit` | Ledger-Einträge eines Users prüfen |
| `/punktesystem-check` | Konsistenz des Punktesystems prüfen |
| `/debug-user` | User-Profil und Direktus-Daten debuggen |
