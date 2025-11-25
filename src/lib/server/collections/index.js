import { eventsCollection } from './events.js';
import { articlesCollection } from './articles.js';
import { pressReleasesCollection } from './press_releases.js';
import { jobsCollection } from './jobs.js';
import { testimonialCollection } from './testimonials.js';
import { supportersOrganizationCollection } from './supporters_organizations.js';
import { teamCollection } from './team_members.js';

export const collections = {
  events: eventsCollection,
  articles: articlesCollection,
  bak_articles: articlesCollection,
  press_releases: pressReleasesCollection,
  jobs: jobsCollection,
  team_members: teamCollection,
  testimonials: testimonialCollection,
  supporters_organizations: supportersOrganizationCollection,
};

/**
 * Get collection config
 */
export function getCollectionConfig(collectionName) {
  return collections[collectionName];
}

/**
 * Get all available filter presets for a collection
 */
export function getFilterPresets(collectionName) {
  const config = getCollectionConfig(collectionName);
  return config ? Object.keys(config.filterPresets) : [];
}

