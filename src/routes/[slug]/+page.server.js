import { loadPageBySlug } from "$lib/server/pageLoader.js";
import { actions as standardActions } from "$lib/server/pageActions.js";

import { redirect } from "@sveltejs/kit";

export async function load({ fetch, params }) {
  if (params.slug === "home") {
    throw redirect(301, "/");
  }
  const page = await loadPageBySlug(params.slug, fetch);
  return { page };
}

export const actions = standardActions;
