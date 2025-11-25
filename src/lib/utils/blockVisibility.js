// src/lib/utils/blockVisibility.js

/**
 * Determines if a block should be rendered based on its type and conditions
 * @param {Object} block - The block object from Directus
 * @returns {boolean} - Whether the block should be visible
 */
export function getBlockVisibility(block) {
  // General hide_block check
  if (block.hide_block) return false;
  
  // Block-specific visibility rules
  switch (block.collection) {
    case 'block_form':
      return block.item?.form?.is_active === true;
    
    default:
      return true;
  }
}

/**
 * Filter an array of blocks to only visible ones
 * @param {Array} blocks - Array of block objects
 * @returns {Array} - Filtered array of visible blocks
 */
export function getVisibleBlocks(blocks) {
  return blocks.filter(getBlockVisibility);
}