import getDirectusReadInstance from '$lib/directus.js';
import { readSingleton, readItem, readItems } from '@directus/sdk';
import { buildNavigationTree } from '$lib/navigation';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ fetch }) {

  const directus = getDirectusReadInstance(fetch);

  const globals = await directus.request(readSingleton("globals"));
  const mainKey = globals?.main_navigation?.key ?? "main";
  const footerKey = globals?.footer_navigation?.key ?? "footer";

  const navItems = await directus.request(
    readItems("navigation_items", {
        fields: [
            "id",
            "title",
            "type",
            "page",
            "url",
            "parent",
            "navigation",
            "sort",
            "page.*"
        ],
        sort: ["sort"],
    })
  );

  const allNavigationTrees = buildNavigationTree(navItems);
  const navigationTrees = {
    main: allNavigationTrees[mainKey] || [],
    footer: allNavigationTrees[footerKey] || [],
  };

  return {
    globals,
    navigationTrees,
    navigationKeys: { main: mainKey, footer: footerKey }
  };
}
