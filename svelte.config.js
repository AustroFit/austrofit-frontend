// BUILD_TARGET=capacitor → adapter-static (SPA, für Capacitor native bundle)
// Default (kein BUILD_TARGET) → adapter-vercel (SSR + API-Routes, für Web)
import adapterVercel from '@sveltejs/adapter-vercel';
import adapterStatic from '@sveltejs/adapter-static';

const isCapacitor = process.env.BUILD_TARGET === 'capacitor';

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
