/// file: src/lib/server/pageLoader.js
import getDirectusReadInstance, { getDirectusWriteInstance } from '$lib/directus';
import { readItems } from "@directus/sdk";
import { error } from "@sveltejs/kit";
import { fetchBlockData } from './blockData';
//import { generateAdditionalDataLoaders } from "./blockConfigs";

export async function loadPageBySlug(slug, fetch) {

  const directus = getDirectusReadInstance(fetch);

  const pages = await directus.request(
    readItems("pages", {
      filter: { slug: { _eq: slug }},
      fields: [
        "title", 
        "slug",
        // block styling
        "blocks.hide_block",
        "blocks.anchor",
        "blocks.background",
        "blocks.background_color_light.slug",
        "blocks.background_color_dark.slug",
        "blocks.advanced_styling",
        "blocks.padding_top",
        "blocks.padding_bottom",
        "blocks.content_width",    
        // block type
        "blocks.collection", 
        // block elements - basic data
        "blocks.item.*",
        //"blocks.item.*.*",
        "blocks.item.button.*",
        "blocks.item.button.internal_page.slug",
        // hero button_group (M2O to buttons collection)
        "blocks.item.button_group.*",
        "blocks.item.button_group.internal_page.slug",
        // block specific data
        "blocks.item.form.*",
        "blocks.item.form.fields.*",
        //"blocks.item.items.*",
        //faq
        "blocks.item.faq_items.question",
        "blocks.item.faq_items.answer",
        "blocks.item.faq_items.sort",
        //cards
        "blocks.item.cards.cards_id.*",
        "blocks.item.cards.cards_id.button.*", 
        "blocks.item.cards.cards_id.button.internal_page.slug",
        //filter
        "blocks.item.location_state.*"
   
      ],
    })
  );
  

  if (!pages.length) {
    throw error(404, `Page '${slug}' not found`);    
  }

  const page = pages[0];

  // set block defaults here
  page.blocks = page.blocks.map(block => ({
    ...block,
    background: block.background || 'light',
    spacing: block.spacing || 'medium',
    content_width: block.content_width || 'standard',
    background_color_light: block.background_color_light || { slug: 'white' },
    background_color_dark: block.background_color_dark || { slug: 'darkblue' }
  }));
  
  // Fetch additional data for blocks that need it
  const blocksWithAdditionalData = await Promise.all(
    page.blocks.map(async (block) => {
      const additionalData = await fetchBlockData(block, directus);
      if (additionalData) {
        block.additionalData = additionalData;
      }
      return block;
    })
  );

  page.blocks = blocksWithAdditionalData;

  return page;

}
/*   // Process blocks with additional data
  const blockTypes = [...new Set(page.blocks.map(block => block.collection))];
  const additionalDataLoaders = generateAdditionalDataLoaders(blockTypes, directus, readItems);

  const blocksWithAdditionalData = page.blocks.map(async (block) => {
    const loader = additionalDataLoaders[block.collection];
    if (loader) {
      block.additionalData = await loader(block);
    }
    return block;
  });

  page.blocks = await Promise.all(blocksWithAdditionalData);
   */
