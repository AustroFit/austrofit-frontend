<!-- src/lib/components/dashboard/HealthPermissionPrompt.svelte -->
<!-- Bottom-sheet prompt for health permission. Handles all states:
     checking → unavailable → unknown → denied → granted              -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { checkHealthPermission, requestHealthPermission } from '$lib/services/health';
  import { registerBackgroundSync } from '$lib/services/stepSync';
  import { track } from '$lib/utils/mixpanel';

  interface Props {
    onPermissionGranted: () => void;
    onTestModeSelected: () => void;
    onDismiss: () => void;
  }
  const { onPermissionGranted, onTestModeSelected, onDismiss }: Props = $props();

  type HealthState = 'checking' | 'unavailable' | 'unknown' | 'denied' | 'granted';

  let healthState = $state<HealthState>('checking');
  let requesting = $state(false);
  let visible = $state(false); // delayed show to prevent flash

  onMount(async () => {
    if (!browser) return;

    // Test mode already active?
    if (localStorage.getItem('austrofit_test_mode') === 'true') {
      healthState = 'granted';
      onPermissionGranted();
      return;
    }

    // Native Capacitor build?
    let isNative = false;
    try {
      const { Capacitor } = await import('@capacitor/core');
      isNative = Capacitor.isNativePlatform();
    } catch {
      isNative = false;
    }

    if (!isNative) {
      healthState = 'unavailable';
      visible = true;
      return;
    }

    const perm = await checkHealthPermission();
    if (perm === 'granted') {
      healthState = 'granted';
      onPermissionGranted();
    } else if (perm === 'denied') {
      healthState = 'denied';
      visible = true;
    } else {
      healthState = 'unknown';
      visible = true;
    }
  });

  async function handleConnect() {
    requesting = true;
    const result = await requestHealthPermission();
    requesting = false;
    if (result === 'granted') {
      visible = false;
      healthState = 'granted';
      track('health_permission_result', { result: 'granted' });
      // Register periodic background sync now that health permission is granted
      registerBackgroundSync().catch(() => { /* not supported – silently ignore */ });
      onPermissionGranted();
    } else {
      healthState = 'denied';
      track('health_permission_result', { result: 'denied' });
    }
  }

  function handleTestMode() {
    if (browser) localStorage.setItem('austrofit_test_mode', 'true');
    visible = false;
    onTestModeSelected();
  }

  function handleDismiss() {
    if (browser) localStorage.setItem('austrofit_health_permission', 'later');
    visible = false;
    track('health_permission_result', { result: 'later' });
    onDismiss();
  }
</script>

{#if visible && healthState !== 'granted' && healthState !== 'checking'}
  <div class="fixed inset-x-0 bottom-0 z-40 px-4 pb-6 sm:pb-8">
    <div class="mx-auto max-w-lg rounded-2xl bg-white p-5 shadow-xl border border-black/10">
      <div class="flex items-start gap-4">
        <!-- Icon -->
        <div
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl"
          style="background:#5EA5001A;"
        >
          {#if healthState === 'unavailable'}🌐{:else if healthState === 'denied'}⚠️{:else}👟{/if}
        </div>

        <div class="flex-1 min-w-0">
          <!-- Title & text per state -->
          {#if healthState === 'unavailable'}
            <h3 class="font-semibold leading-snug">Schritt-Tracking nicht verfügbar</h3>
            <p class="mt-1 text-sm text-gray-500 leading-relaxed">
              Health-Tracking benötigt die AustroFit App auf deinem Smartphone. Bis dahin kannst du
              deine Schritte manuell eingeben.
            </p>
          {:else if healthState === 'denied'}
            <h3 class="font-semibold leading-snug">Zugriff verweigert</h3>
            <p class="mt-1 text-sm text-gray-500 leading-relaxed">
              Zugriff auf Gesundheitsdaten wurde verweigert. Du kannst ihn in den
              Geräte-Einstellungen wieder aktivieren.
            </p>
          {:else}
            <!-- unknown -->
            <h3 class="font-semibold leading-snug">Schritte zählen aktivieren</h3>
            <p class="mt-1 text-sm text-gray-500 leading-relaxed">
              Um deine Schritte zu zählen, brauchen wir kurz Zugriff auf deine Gesundheitsdaten.
              Deine Daten werden pseudonymisiert verarbeitet.
            </p>
          {/if}

          <!-- Buttons per state -->
          <div class="mt-4 flex flex-wrap gap-2">
            {#if healthState === 'unavailable'}
              <button
                onclick={handleTestMode}
                class="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity"
                style="background:#5EA500;"
              >
                Schritte manuell eingeben
              </button>
              <button
                onclick={handleDismiss}
                class="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Später
              </button>
            {:else if healthState === 'denied'}
              <button
                onclick={handleTestMode}
                class="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity"
                style="background:#5EA500;"
              >
                Trotzdem manuell eingeben
              </button>
              <button
                onclick={handleDismiss}
                class="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Schließen
              </button>
            {:else}
              <!-- unknown -->
              <button
                onclick={handleConnect}
                disabled={requesting}
                class="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
                style="background:#5EA500;"
              >
                {requesting ? 'Zugriff wird angefragt…' : 'Zugriff erlauben'}
              </button>
              <button
                onclick={handleTestMode}
                class="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Manuell eingeben
              </button>
              <button
                onclick={handleDismiss}
                class="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600 transition-colors"
              >
                Später
              </button>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
