import { json, error } from '@sveltejs/kit';
import getDirectusReadInstance from '$lib/directus.js';
import { readItems } from '@directus/sdk';
import { parseModuleId, getBlock } from '$lib/config/articleBlocks.js';
import { PUBLIC_CMSURL } from '$env/static/public';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, fetch }) => {
  const { slug } = params;
  const directus = getDirectusReadInstance(fetch);

  let articles;
  try {
    articles = await directus.request(
      readItems('articles', {
        filter: { slug: { _eq: slug }, status: { _in: ['published', 'in_review'] } },
        fields: ['id', 'slug', 'title', 'description', 'content', 'image', 'learning_module_id', 'date_created', 'seo.title', 'seo.description'],
        limit: 1,
      })
    );
  } catch (err) {
    console.error('Error loading article:', err);
    error(500, 'Artikel konnte nicht geladen werden.');
  }

  if (!articles?.length) error(404, 'Artikel nicht gefunden');

  const raw = articles[0];
  const { block, cat } = parseModuleId(raw.learning_module_id);
  const blockConfig = block ? getBlock(block) : null;

  const text = (raw.content ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = text.split(' ').filter(Boolean).length;

  const item = {
    id: raw.id,
    slug: raw.slug,
    title: raw.title ?? '',
    description: raw.description ?? null,
    content: raw.content ?? null,
    imageUrl: raw.image ? `${PUBLIC_CMSURL}/assets/${raw.image}?width=1200&quality=80&format=webp` : null,
    date_created: raw.date_created,
    block,
    cat,
    blockLabel: blockConfig?.label ?? null,
    catLabel: block && cat && blockConfig?.categories?.[cat] ? blockConfig.categories[cat] : null,
    readingMinutes: Math.max(1, Math.ceil(wordCount / 200)),
    seoTitle: raw.seo?.title ?? null,
    seoDescription: raw.seo?.description ?? null,
  };

  // Fetch quiz
  let quiz = null;
  try {
    const quizItems = await directus.request(
      readItems('quizzes', {
        filter: {
          article_id: { _eq: raw.id },
          status: { _in: ['published', 'in_review'] },
        },
        fields: ['id', 'version', 'status', 'quiz_json'],
        sort: ['-version'],
        limit: 1,
      })
    );
    const q = quizItems?.[0] ?? null;
    if (q?.quiz_json) {
      try {
        quiz = { id: q.id, version: q.version, status: q.status, data: JSON.parse(q.quiz_json) };
      } catch {
        quiz = { id: q.id, version: q.version, status: q.status, data: null };
      }
    }
  } catch {
    // Non-fatal
  }

  return json({ item, quiz });
};
