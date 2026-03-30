// src/lib/stores/levels.ts
// Level-Definitionen als reaktiver Store.
// Initialisiert mit hardcodierten Werten (sofort verfügbar, kein Flicker).
// Wird in +layout.svelte via /api/levels mit CMS-Daten überschrieben.
import { writable } from 'svelte/store';
import { LEVEL_DEFS, type LevelDef } from '$lib/utils/level';

export const levelDefs = writable<LevelDef[]>(LEVEL_DEFS);
