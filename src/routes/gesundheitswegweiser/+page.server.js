export const prerender = true;

import { error } from '@sveltejs/kit';
import getDirectusReadInstance from '$lib/directus.js';
import { readItems } from '@directus/sdk';
import { BLOCKS, parseModuleId } from '$lib/config/articleBlocks.js';
import { PUBLIC_CMSURL } from '$env/static/public';

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch }) {
  const directus = getDirectusReadInstance(fetch);

  // Fetch all published articles
  let rawArticles;
  try {
    rawArticles = await directus.request(
      readItems('articles', {
        filter: { status: { _in: ['published', 'in_review'] } },
        fields: ['id', 'slug', 'title', 'description', 'content', 'image', 'learning_module_id', 'date_created', 'featured'],
        sort: ['-date_created'],
        limit: -1,
      })
    );
  } catch (err) {
    console.error('Error loading articles for Gesundheitswegweiser:', err);
    error(500, 'Artikel konnten nicht geladen werden.');
  }

  // Enrich with block/category info and estimated reading time
  const allArticles = (rawArticles ?? []).map((article) => {
    const { block, cat } = parseModuleId(article.learning_module_id);
    const text = (article.content ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = text.split(' ').filter(Boolean).length;
    const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));
    return {
      id: article.id,
      slug: article.slug,
      title: article.title ?? '',
      description: article.description ?? null,
      image: article.image ?? null,
      imageUrl: article.image ? `${PUBLIC_CMSURL}/assets/${article.image}` : null,
      date_created: article.date_created,
      featured: article.featured ?? false,
      block: block ?? null,
      cat: cat ?? null,
      readingMinutes,
    };
  });

  // Fetch quizzes for all articles to display eligible points
  const articleIds = allArticles.map((a) => a.id);
  /** @type {Record<number, { id: number, eligiblePoints: number }>} */
  const quizzesByArticleId = {};

  if (articleIds.length > 0) {
    try {
      const quizzes = await directus.request(
        readItems('quizzes', {
          filter: {
            article_id: { _in: articleIds },
            status: { _in: ['published', 'in_review'] },
          },
          fields: ['id', 'article_id', 'quiz_json'],
          limit: -1,
        })
      );
      for (const quiz of quizzes ?? []) {
        let eligiblePoints = 40;
        if (quiz.quiz_json) {
          try {
            const parsed = JSON.parse(quiz.quiz_json);
            if (typeof parsed.eligible_points === 'number') {
              eligiblePoints = parsed.eligible_points;
            }
          } catch {
            // malformed json – use default
          }
        }
        quizzesByArticleId[quiz.article_id] = { id: quiz.id, eligiblePoints };
      }
    } catch (err) {
      // Non-fatal: page still works without quiz data
      console.warn('Could not load quizzes for Gesundheitswegweiser overview:', err);
    }
  }

  // Build list of blocks that actually have articles (for filter chips)
  const blocksWithArticles = new Set(allArticles.map((a) => a.block).filter(Boolean));
  const availableBlocks = BLOCKS
    .filter((b) => blocksWithArticles.has(b.id))
    .map((b) => ({ id: b.id, label: b.label }));

  return {
    articles: allArticles,
    quizzesByArticleId,
    activeBlock: null,
    availableBlocks,
  };
}
