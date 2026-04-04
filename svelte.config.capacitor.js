// svelte.config.capacitor.js
// Wird NUR für den Capacitor Native Build verwendet (npm run cap:build).
// Erzeugt ein statisches SPA-Bundle in build/ das Capacitor direkt einbettet.
// API-Calls gehen über PUBLIC_API_BASE=https://austrofit.at an den Vercel-Server.
import adapterStatic from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapterStatic({
      // SPA-Fallback: alle Routen landen auf index.html (Client-Router übernimmt)
      fallback: 'index.html',
      pages: 'build',
      assets: 'build',
      strict: false
    }),
    // Prerendering deaktivieren: alle Seiten sind auth-geschützt (client-side only)
    prerender: {
      entries: []
    }
  }
};

export default config;
