/// file: src/lib/server/pageLoader.js
import getDirectusReadInstance, { getDirectusWriteInstance } from '$lib/directus';
import { readItems } from "@directus/sdk";
import { error } from "@sveltejs/kit";
import { generateAdditionalDataLoaders } from "./blockConfigs";

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
        "blocks.background",
        "blocks.background_color_light.slug",
        "blocks.background_color_dark.slug",
        "blocks.advanced_styling",
        "blocks.content_width",      
        // block type
        "blocks.collection", 
        // block elements - basic data
        "blocks.item.*",
        //"blocks.item.*.*",
        // block specific data
        "blocks.item.form.*",
        "blocks.item.form.fields.*",
        //"blocks.item.items.*",
        //faq
        "blocks.item.faq_items.question",
        "blocks.item.faq_items.answer",
        "blocks.item.faq_items.sort"
      ],
    })
  );

  
  if (!pages.length) {
    throw error(404, `Page '${slug}' not found`);    
  }

  const page = pages[0];
  
  // Process blocks with additional data
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
  
  return page;
}