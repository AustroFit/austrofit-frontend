// BUILD_TARGET=capacitor → adapter-static (SPA, für Capacitor native bundle)
// Default (kein BUILD_TARGET) → adapter-vercel (SSR + API-Routes, für Web)
import adapterVercel from '@sveltejs/adapter-vercel';

const isCapacitor = process.env.BUILD_TARGET === 'capacitor';

// adapter-static ist nur bei Capacitor-Builds nötig – lazy import vermeidet
// Fehler auf Vercel, wo devDependencies nicht installiert werden.
const adapterStatic = isCapacitor
  ? (await import('@sveltejs/adapter-static')).default
  : null;

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: isCapacitor
      ? adapterStatic({
          fallback: 'index.html', // SPA-Fallback: alle Routen landen auf index.html
          pages: 'build',
          assets: 'build',
          strict: false
        })
      : adapterVercel({ runtime: 'nodejs22.x' }),

    // Prerendering:
    // Web: SvelteKit crawlt alle öffentlichen Seiten automatisch
    // Capacitor: crawl: false verhindert dass [slug]-Routen mit form actions prerendered werden.
    //            Einzelne Seiten nutzen export const prerender = true in ihren server-Dateien.
    prerender: isCapacitor ? { crawl: false } : {}
  }
};

export default config;
