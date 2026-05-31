import { error, type RequestEvent } from '@sveltejs/kit';
import getDirectusReadInstance from '$lib/directus.js';
import { readItems } from '@directus/sdk';

const STATIC_PAGES = [
  { path: '/gesundheitswegweiser', priority: '0.9', changefreq: 'weekly' },
  { path: '/partner-werden',       priority: '0.6', changefreq: 'monthly' },
  { path: '/ueber-uns',            priority: '0.5', changefreq: 'yearly' },
  { path: '/impressum',            priority: '0.3', changefreq: 'yearly' },
  { path: '/datenschutz',          priority: '0.3', changefreq: 'yearly' },
];

type ArticleRow = { slug: string; release_date: string | null };

export async function GET({ url, fetch }: RequestEvent) {
  const base = url.origin;
  const today = new Date().toISOString().split('T')[0];

  let articles: ArticleRow[] = [];
  try {
    const directus = getDirectusReadInstance(fetch);
    const raw = await directus.request(
      readItems('articles', {
        filter: { status: { _eq: 'published' } },
        fields: ['slug', 'release_date'],
        limit: 500,
        sort: ['slug'],
      })
    );
    articles = (raw as unknown as ArticleRow[]);
  } catch (err) {
    console.error('sitemap: failed to fetch articles', err);
    error(500, 'Sitemap konnte nicht generiert werden.');
  }

  const staticEntries = STATIC_PAGES.map(
    (p) => `  <url>
    <loc>${base}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  );

  const articleEntries = articles.map((a) => {
    const lastmod = a.release_date ? a.release_date.split('T')[0] : today;
    return `  <url>
    <loc>${base}/gesundheitswegweiser/${a.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...articleEntries].join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'max-age=3600, s-maxage=86400, stale-while-revalidate=3600',
    },
  });
}
