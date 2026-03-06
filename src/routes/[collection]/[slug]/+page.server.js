// src/routes/[collection]/[slug]/+page.server.js

import { error } from '@sveltejs/kit';
import getDirectusReadInstance from '$lib/directus';
import { readItem, readItems } from '@directus/sdk';
import { getCollectionConfig } from '$lib/server/collections/index.js';

const COLLECTION_MAP = {
  'events': 'events',
  'artikel': 'articles',
  'gesundheitswegweiser': 'articles',
  'team': 'team',
  'testimonials': 'testimonials',
};

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch }) {
  const { collection: urlParam, slug } = params;

  const collection = COLLECTION_MAP[urlParam] || urlParam;
 /*  console.log('=== SINGLE PAGE LOAD ===');
  console.log('Collection:', collection);
  console.log('Slug:', slug);
 */
  const directus = getDirectusReadInstance(fetch);
  
  // Get collection configuration
  const config = getCollectionConfig(collection);

 /*  console.log('Config found:', !!config);
  console.log('Config fields:', config?.fields); */

  if (!config) {
    error(404, `Inhalte nicht gefunden`);
  }
  
  try {
    // Fetch the single item
    const items = await directus.request(
      readItems(collection, {
        filter: { slug: { _eq: slug } },
        fields: [
          ...config.fields,
        ],
        limit: 1
      })
    );
    
    if (!items || items.length === 0) {
      error(404, `${collection} not found`);
    }
    
    const item = items[0];
    
    // --- Quiz for articles (optional) ---
    let quiz = null;

    // DEBUG: always log here (server terminal)
    console.log('ARTICLE ID:', item.id, 'COLLECTION:', collection);

    if (collection === 'articles' && item?.id) {
      // DEBUG: can we read quizzes at all?
      try {
        const ping = await directus.request(readItems('quizzes', { limit: 1, fields: ['id'] }));
        console.log('QUIZ READ PING OK. first id:', ping?.[0]?.id);
      } catch (e) {
        console.log('QUIZ READ PING FAILED:', e);
      }
      try {
        const quizItems = await directus.request(
          readItems('quizzes', {
            filter: {
              article_id: { _eq: item.id },
              status: { _in: ['published', 'in_review'] }
            },
            fields: ['id', 'version', 'status', 'quiz_json'],
            sort: ['-version'],
            limit: 1
          })
        );

        const q = quizItems?.[0] ?? null;
        console.log('QUIZ ROW FOUND:', !!q, q?.id, q?.version);

        if (q?.quiz_json) {
          try {
            quiz = {
              id: q.id,
              version: q.version,
              status: q.status,
              data: JSON.parse(q.quiz_json)
            };
            console.log('QUIZ PARSE OK. questions=', quiz.data?.questions?.length);
          } catch (e) {
            console.log('QUIZ PARSE FAILED:', e?.message);
            quiz = { id: q.id, version: q.version, status: q.status, data: null, parseError: true };
          }
        } else {
          console.log('QUIZ HAS NO quiz_json');
        }
      } catch (e) {
        console.log('QUIZ LOAD FAILED (raw):', e);

        // Many Directus SDK errors store details differently
        console.log('QUIZ LOAD FAILED keys:', e ? Object.keys(e) : null);
        console.log('QUIZ LOAD FAILED message:', e?.message);
        console.log('QUIZ LOAD FAILED errors:', e?.errors);

        // Sometimes nested in "cause"
        console.log('QUIZ LOAD FAILED cause:', e?.cause);

        quiz = null;
      }
    }


    console.log("ITEM KEYS:", Object.keys(item));
    console.log("CONTENT TYPE:", typeof item.content, item.content?.slice?.(0, 200));
    console.log("LM PRESENT:", !!item.learning_module);
    
    // Optionally fetch related items (e.g., "more events")
    let relatedItems = [];
    if (config.fetchRelated) {
      relatedItems = await directus.request(
        readItems(collection, {
          filter: {
            slug: { _neq: slug }, // Exclude current item
            status: { _eq: 'published' }
          },
          fields: config.fields,
          limit: 3,
          sort: config.defaultSort ? [`-${config.defaultSort}`] : ['-date_created']
        })
      );
    }
    
    return {
      item,
      collection,
      relatedItems,
      quiz
    };
    
  } catch (err) {
    console.error('Error loading single page:', err);
    error(500, 'Fehler beim Laden der Seite');
  }
}
