import type { CapacitorConfig } from '@capacitor/cli';

// ── Build-Modi ────────────────────────────────────────────────────────────────
//
// LOCAL BUILD MODE (Produktion / App Store Release):
//   1. npm run cap:build          → baut statisches SPA-Bundle nach build/
//   2. npx cap sync android       → Bundle wird in APK eingebettet
//   3. App lädt JS/CSS lokal (schnell) – API-Calls gehen an https://austrofit.at
//   → Den server-Block unten AUSKOMMENTIEREN.
//
// LIVE SERVER MODE (Entwicklung / schnelle Iteration):
//   → Den server-Block einkommentieren (dev.austrofit.at oder austrofit.at).
//   → Kein Build nötig: App lädt direkt vom deployte Server.
//
// ─────────────────────────────────────────────────────────────────────────────

const config: CapacitorConfig = {
  appId: 'at.austrofit.app',
  appName: 'AustroFit',
  webDir: 'build',

  // Live Server Mode – Standard für tägliche Entwicklung.
  // Für Local Build Mode (Release-Test): diesen Block auskommentieren + npm run cap:build:dev
  // server: {
  //   url: 'https://dev.austrofit.at',   // dev branch → nach Push + Vercel Deploy
  //   // url: 'https://austrofit.at',    // production (main branch)
  //   cleartext: false
  // },

  plugins: {
    StatusBar: {
      style: 'DARK',           // DARK = weiße Icons – lesbar auf dunkelgrünem Hintergrund
      backgroundColor: '#0D2E18',  // bg-darkblue – tiefes Waldgrün
      overlaysWebView: false   // Statusleiste bekommt eigene Fläche, scrollt nicht mit
    }
  }
};

export default config;
