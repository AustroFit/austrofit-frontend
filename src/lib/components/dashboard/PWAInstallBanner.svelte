<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { pwaPrompt } from '$lib/stores/pwa';

  const STORAGE_KEY = 'austrofit_pwa_banner_dismissed';

  interface Props {
    onDismiss?: () => void;
  }

  const { onDismiss }: Props = $props();

  let dismissed = $state(false);
  let installing = $state(false);
  let isStandalone = $state(false);

  onMount(() => {
    if (!browser) return;
    dismissed = localStorage.getItem(STORAGE_KEY) === '1';
    isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  });

  const visible = $derived(!!$pwaPrompt && !dismissed && !isStandalone);

  async function install() {
    const prompt = $pwaPrompt as any;
    if (!prompt) return;
    installing = true;
    try {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        pwaPrompt.set(null);
        dismiss();
      }
    } catch (e) {
      console.warn('[PWAInstallBanner] Install prompt failed:', e);
    } finally {
      installing = false;
    }
  }

  function dismiss() {
    if (browser) localStorage.setItem(STORAGE_KEY, '1');
    dismissed = true;
    onDismiss?.();
  }
</script>

{#if visible}
  <div class="fixed inset-x-0 bottom-0 z-30 px-4 pb-6 sm:pb-8 pointer-events-none">
    <div class="mx-auto max-w-lg rounded-2xl bg-white p-5 shadow-xl border border-black/10 pointer-events-auto">
      <div class="flex items-start gap-4">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-neutral-100">
          <img src="/logo/logo_white.svg" alt="AustroFit" class="h-8 w-8 object-contain" onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold leading-snug">AustroFit als App installieren</h3>
          <p class="mt-1 text-sm text-neutral-500 leading-relaxed">
            Füge AustroFit zu deinem Startbildschirm hinzu – für schnelleren Zugriff und ein natives App-Erlebnis.
          </p>
          <div class="mt-4 flex flex-wrap gap-2">
            <button
              onclick={install}
              disabled={installing}
              class="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
            >
              {installing ? 'Wird installiert…' : 'Installieren'}
            </button>
            <button
              onclick={dismiss}
              class="rounded-xl border border-neutral-200 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              Nicht jetzt
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
