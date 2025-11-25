import { readItems } from "@directus/sdk";
import { getCollectionConfig } from './collections/index.js';

/**
 * Build filter object based on query type and presets
 */
function buildFilter(collectionName, blockData) {
  const config = getCollectionConfig(collectionName);
  if (!config) return {};
  
  const filters = [];
  
  // Build filters from each category
  if (config.filterBuilders) {
    // Time filter
    if (blockData.time_filter && config.filterBuilders.time) {
      const timeFilter = config.filterBuilders.time[blockData.time_filter];
      const filter = typeof timeFilter === 'function' 
        ? timeFilter(blockData) 
        : timeFilter;
      if (filter) filters.push(filter);
    }
    
    // Type filter
    if (blockData.type_filter && config.filterBuilders.type) {
      const typeFilter = config.filterBuilders.type[blockData.type_filter];
      const filter = typeof typeFilter === 'function' 
        ? typeFilter(blockData) 
        : typeFilter;
      if (filter) filters.push(filter);
    }
    
    // Location filter
    if (blockData.location_filter && config.filterBuilders.location) {
      const locationFilter = config.filterBuilders.location[blockData.location_filter];
      const filter = typeof locationFilter === 'function' 
        ? locationFilter(blockData) 
        : locationFilter;
      if (filter) filters.push(filter);
    }
    
    // Featured filter
    if (config.filterBuilders.featured) {
      const featuredFilter = config.filterBuilders.featured(blockData);
      if (featuredFilter) filters.push(featuredFilter);
    }
  }
  
  // Add custom filters
  if (blockData.custom_filters) {
    try {
      filters.push(JSON.parse(blockData.custom_filters));
    } catch (e) {
      console.error('Invalid custom_filters JSON:', e);
    }
  }
  
  // Add additional filters
  if (blockData.additional_filters) {
    try {
      filters.push(JSON.parse(blockData.additional_filters));
    } catch (e) {
      console.error('Invalid additional_filters JSON:', e);
    }
  }
  
  // Combine all filters with AND
  if (filters.length === 0) return {};
  if (filters.length === 1) return filters[0];
  return { _and: filters };
}

/**
 * Build sort array
 */
function buildSort(collectionName, blockData) {
  const config = getCollectionConfig(collectionName);
  const sortField = blockData.sort || config?.defaultSort || 'date_created';
  const sortDirection = blockData.sort_direction === 'desc' ? '-' : '';
  return [`${sortDirection}${sortField}`];
}

/**
 * Fetch collection data with filters and sorting
 */
async function fetchCollectionData(collectionName, blockData, directus) {
  const config = getCollectionConfig(collectionName);
  if (!config) {
    console.warn(`Unknown collection: ${collectionName}`);
    return [];
  }

  const filter = buildFilter(collectionName, blockData);
  const sort = buildSort(collectionName, blockData);
  const limit = blockData.items_per_page || 3;
  try {
    const items = await directus.request(
      readItems(collectionName, {
        fields: config.fields,
        filter,
        sort,
        limit
      })
    );
    return items;
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    return [];
  }
}

/**
 * Main function to fetch block data
 */
export async function fetchBlockData(block, directus) {
  const collection = block.collection;

  // Handle dynamic content blocks
  if (collection === "block_dynamic_content") {
    const targetCollection = block.item?.collection;
    
    if (!targetCollection) {
      console.warn('No target collection specified');
      return null;
    }
    //console.log(block.item);
    return await fetchCollectionData(targetCollection, block.item, directus);
  }

  // Add other block types here as needed
  return null;
}