<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  const STORAGE_KEY = 'austrofit_analytics_consent';

  let visible = $state(false);

  onMount(() => {
    if (!browser) return;
    visible = localStorage.getItem(STORAGE_KEY) === null;
  });

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'true');
    visible = false;
    window.dispatchEvent(new CustomEvent('austrofit:consent', { detail: true }));
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'false');
    visible = false;
  }
</script>

{#if visible}
  <div class="fixed inset-x-0 bottom-0 z-40 px-4 pb-6 sm:pb-8 pointer-events-none">
    <div class="mx-auto max-w-lg rounded-2xl bg-white p-5 shadow-xl border border-black/10 pointer-events-auto">
      <h3 class="font-semibold leading-snug mb-1">Anonyme Nutzungsstatistiken</h3>
      <p class="text-sm text-neutral-500 leading-relaxed mb-4">
        Wir verwenden anonyme Statistiken, um die App zu verbessern. Die Daten werden
        ausschließlich auf EU-Servern (Frankfurt) verarbeitet und enthalten
        keine personenbezogenen Daten.
        <a href="/datenschutz" class="text-primary underline underline-offset-2 hover:text-primary-dark">Datenschutzerklärung</a>
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          onclick={accept}
          class="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Akzeptieren
        </button>
        <button
          onclick={decline}
          class="rounded-xl border border-black/15 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
        >
          Ablehnen
        </button>
      </div>
    </div>
  </div>
{/if}
