import { writable } from 'svelte/store';

export const pwaPrompt = writable<Event | null>(null);
