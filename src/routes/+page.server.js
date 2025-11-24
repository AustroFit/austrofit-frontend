import { loadPageBySlug } from "$lib/server/pageLoader.js";
import { actions as standardActions } from "$lib/server/pageActions.js";

export async function load({ fetch }) {
  const page = await loadPageBySlug("home", fetch);
  return { page };
}

export const actions = standardActions;