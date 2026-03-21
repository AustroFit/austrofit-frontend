// src/lib/data/blockStyles.ts
// Geteilte Kategorie-Stile für Gesundheitswegweiser-Artikel.
// Wird von ArtikelKarte.svelte und gesundheitswegweiser/[slug]/+page.svelte verwendet.

export interface BlockStyle {
  bg: string;
  text: string;
  label: string;
}

export const BLOCK_STYLES: Record<string, BlockStyle> = {
  vk:   { bg: '#EFF6FF', text: '#1D4ED8', label: 'Volkskrankheiten' },
  pv:   { bg: '#F5F3FF', text: '#6D28D9', label: 'Prävention & Vorsorge' },
  ls:   { bg: '#ECFEFF', text: '#0E7490', label: 'Lebensstil' },
  kw:   { bg: '#FFFBEB', text: '#92400E', label: 'Krankheitswissen' },
  mh:   { bg: '#FDF2F8', text: '#9D174D', label: 'Mental Health' },
  sys:  { bg: '#F9FAFB', text: '#374151', label: 'Gesundheitssystem' },
  myth: { bg: '#FFF1F2', text: '#9F1239', label: 'Mythen & Faktencheck' },
};
