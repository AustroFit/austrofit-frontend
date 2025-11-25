// src/routes/[collection]/[slug]/+page.server.js

import { error } from '@sveltejs/kit';
import getDirectusReadInstance from '$lib/directus';
import { readItem, readItems } from '@directus/sdk';
import { getCollectionConfig } from '$lib/server/collections/index.js';

const COLLECTION_MAP = {
  'events': 'events',
  'artikel': 'articles',
  'pressemitteilungen': 'press_releases',
  'team': 'team',
  'testimonials': 'testimonials'
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
        fields: config.fields, // Use fields from collection config
        limit: 1
      })
    );
    
    if (!items || items.length === 0) {
      error(404, `${collection} not found`);
    }
    
    const item = items[0];
    
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
      relatedItems
    };
    
  } catch (err) {
    console.error('Error loading single page:', err);
    error(500, 'Fehler beim Laden der Seite');
  }
}