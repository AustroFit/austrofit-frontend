import { createDirectus, staticToken, rest } from '@directus/sdk';
import { readItems, readItem, updateItem, updateUser, createItem, deleteItem } from '@directus/sdk';
import { PUBLIC_CMSURL } from '$env/static/public';
import { DIRECTUS_READ_TOKEN } from '$env/static/private';
import { DIRECTUS_WRITE_TOKEN } from '$env/static/private';
/**
 * Gibt eine Directus-Instanz zurück, optional mit custom fetch (z. B. für SSR).
 * @param {typeof fetch} [fetch]
 */
// For reading content (pages, blocks, posts)
function getDirectusReadInstance(fetch) {
  const options = fetch ? { globals: { fetch } } : {};
  return createDirectus(PUBLIC_CMSURL, options)
    .with(rest())
    .with(staticToken(DIRECTUS_READ_TOKEN));
}

// For form submissions and data creation
function getDirectusWriteInstance(fetch) {
  const options = fetch ? { globals: { fetch } } : {};
  return createDirectus(PUBLIC_CMSURL, options)
    .with(rest())
    .with(staticToken(DIRECTUS_WRITE_TOKEN));
}

// For truly public data (if needed)
function getDirectusPublicInstance(fetch) {
  const options = fetch ? { globals: { fetch } } : {};
  return createDirectus(PUBLIC_CMSURL, options).with(rest());
}

export default getDirectusReadInstance;
export { getDirectusWriteInstance, getDirectusPublicInstance };