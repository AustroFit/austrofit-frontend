import vercelAdapter from '@sveltejs/adapter-vercel';
import nodeAdapter from '@sveltejs/adapter-node';
/** @type {import('@sveltejs/kit').Config} */
// adapter-vercel erstellt Symlinks, die auf Windows Developer Mode erfordern.
// VERCEL=1 ist in Vercel-Deployments automatisch gesetzt → dort vercelAdapter verwenden.
const config = {
  kit: {
    adapter: process.env.VERCEL ? vercelAdapter({ runtime: 'nodejs22.x' }) : nodeAdapter()
  }
};

export default config;
