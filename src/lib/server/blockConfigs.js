/**
 * BLOCK_CONFIGS - Configuration for blocks that always fetch from a specific collection
 * 
 * Use this for blocks that have a fixed purpose and always need the same type of data.
 * Example: A gallery block that always shows images, testimonials that always show reviews.
 * 
 * Structure: "block_type" → { collection, fields, defaultLimit, sort }
 */
export const BLOCK_CONFIGS = {
/*   "block_gallery": {
    collection: "gallery",                    // Always fetch from "gallery" collection
    fields: ["id", "title", "image"],         // Which fields to retrieve
    defaultLimit: 12                          // Default number of items if not specified in block
  },
  "block_testimonials": {
    collection: "testimonials", 
    fields: ["name", "quote", "rating"],
    defaultLimit: 3
  } */
  // Add more fixed blocks here...
};

/**
 * COLLECTION_CONFIGS - Configuration for different content collections
 * 
 * Use this for dynamic blocks that can fetch from different collections based on
 * the block's item.collection setting. This allows one block type (like block_posts)
 * to display articles, news, products, etc. with appropriate field configurations.
 * 
 * Structure: "collection_name" → { fields, sort, defaultLimit }
 */
export const COLLECTION_CONFIGS = {
  "articles": {
    fields: ["slug", "title", "description", "image", "content", "seo"],
    sort: ["sort"],                           // Sort by "sort" field ascending
    defaultLimit: 6
  },
  // Add more collections here...
};

/**
 * DYNAMIC_BLOCKS - List of block types that use item.collection to determine what to fetch
 * 
 * These blocks are "generic" and can display different types of content based on
 * their configuration. The actual collection to fetch is determined by block.item.collection.
 */
export const DYNAMIC_BLOCKS = ["block_posts"];

/**
 * Generate loader functions for blocks that need additional data
 * 
 * This function creates async loader functions for each block type that needs to fetch
 * additional data from Directus. It handles both fixed blocks (always same collection)
 * and dynamic blocks (collection determined by block.item.collection).
 * 
 * @param {string[]} blockTypes - Array of block types found on the current page
 * @param {Object} directus - Directus client instance
 * @param {Function} readItems - Directus readItems function
 * @returns {Object} Object with loader functions keyed by block type
 */
export const generateAdditionalDataLoaders = (blockTypes, directus, readItems) => {
  const loaders = {};
  
  // Loop through all block types found on the current page
  blockTypes.forEach(blockType => {
    
    // DYNAMIC BLOCKS: Use item.collection to determine what to fetch
    if (DYNAMIC_BLOCKS.includes(blockType)) {
      loaders[blockType] = async (block) => {
        // Get the target collection from the block's configuration
        const targetCollection = block.item?.collection;
        
        if (!targetCollection) {
          console.warn(`Dynamic block ${blockType} has no item.collection specified`);
          return null;
        }
        
        // Look up the configuration for this collection
        const config = COLLECTION_CONFIGS[targetCollection];
        
        if (!config) {
          console.warn(`No config found for collection: ${targetCollection}`);
          return null;
        }
        
        // Fetch data using the collection's configuration
        return await directus.request(
          readItems(targetCollection, {
            fields: config.fields,
            sort: config.sort || [],
            // Use block's limit if specified, otherwise use config default
            limit: block.item?.limit || config.defaultLimit,
          })
        );
      };
    }
    
    // FIXED BLOCKS: Always fetch from the same collection
    else if (BLOCK_CONFIGS[blockType]) {
      const config = BLOCK_CONFIGS[blockType];
      
      loaders[blockType] = async (block) => {
        // Fetch data using the block's fixed configuration
        return await directus.request(
          readItems(config.collection, {
            fields: config.fields,
            sort: config.sort || [],
            // Use block's limit if specified, otherwise use config default
            limit: block.item?.limit || config.defaultLimit,
          })
        );
      };
    }
    
    // If block type is not configured, no loader will be created
    // This is fine - not all blocks need additional data
  });
  
  return loaders;
};