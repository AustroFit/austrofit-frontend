import { error } from '@sveltejs/kit';
import { apiUrl } from '$lib/utils/api.js';

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
  const res = await fetch(apiUrl(`/api/articles/${params.slug}`));
  if (res.status === 404) error(404, 'Artikel nicht gefunden');
  if (!res.ok) error(500, 'Artikel konnte nicht geladen werden.');
  return res.json();
}
