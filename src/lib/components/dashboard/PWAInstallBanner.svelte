<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  const STORAGE_KEY = 'austrofit_pwa_banner_dismissed';

  interface Props {
    onDismiss?: () => void;
  }

  const { onDismiss }: Props = $props();

  let visible = $state(false);
  let deferredPrompt = $state<any>(null);
  let installing = $state(false);

  onMount(() => {
    if (!browser) return;

    // Don't show if already dismissed or if already installed as PWA
    if (
      localStorage.getItem(STORAGE_KEY) === '1' ||
      window.matchMedia('(display-mode: standalone)').matches
    ) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      visible = true;
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  });

  async function install() {
    if (!deferredPrompt) return;
    installing = true;
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        dismiss();
      }
    } catch (e) {
      console.warn('[PWAInstallBanner] Install prompt failed:', e);
    } finally {
      installing = false;
      deferredPrompt = null;
    }
  }

  function dismiss() {
    if (browser) localStorage.setItem(STORAGE_KEY, '1');
    visible = false;
    onDismiss?.();
  }
</script>

{#if visible}
  <div class="fixed inset-x-0 bottom-0 z-30 px-4 pb-6 sm:pb-8 pointer-events-none">
    <div class="mx-auto max-w-lg rounded-2xl bg-white p-5 shadow-xl border border-black/10 pointer-events-auto">
      <div class="flex items-start gap-4">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-gray-100">
          <img src="/logo/logo_white.svg" alt="AustroFit" class="h-8 w-8 object-contain" onerror={(e) => e.currentTarget.style.display='none'} />
          <span class="text-2xl hidden">🏅</span>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold leading-snug">AustroFit als App installieren</h3>
          <p class="mt-1 text-sm text-gray-500 leading-relaxed">
            Füge AustroFit zu deinem Startbildschirm hinzu – für schnelleren Zugriff und ein natives App-Erlebnis.
          </p>
          <div class="mt-4 flex flex-wrap gap-2">
            <button
              onclick={install}
              disabled={installing}
              class="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
              style="background:#2E7D32;"
            >
              {installing ? 'Wird installiert…' : 'Installieren'}
            </button>
            <button
              onclick={dismiss}
              class="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Nicht jetzt
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
