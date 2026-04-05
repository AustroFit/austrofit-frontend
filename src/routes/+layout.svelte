<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { Capacitor } from '@capacitor/core';
  import MainNavbar from '$lib/components/MainNavbar.svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import ConsentBanner from '$lib/components/dashboard/ConsentBanner.svelte';
  import { initAnalytics } from '$lib/utils/mixpanel';
  import { env } from '$env/dynamic/public';
  import { pwaPrompt } from '$lib/stores/pwa';
  import { levelDefs } from '$lib/stores/levels';
  import type { LevelDef } from '$lib/utils/level';
  import { appConfig } from '$lib/stores/appConfig';
  import { apiUrl } from '$lib/utils/api';

  const { children } = $props();

  let isNative = $state(false);

  onMount(() => {
    isNative = Capacitor.isNativePlatform();
    // Statusleiste konfigurieren (nur native App)
    if (browser && Capacitor.isNativePlatform()) {
      import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
        StatusBar.setStyle({ style: Style.Dark });           // weiße Icons – lesbar auf dunkelgrünem Header
        StatusBar.setBackgroundColor({ color: '#0D2E18' });  // bg-darkblue – tiefes Waldgrün
      }).catch(() => { /* nicht-kritisch */ });

      // Back-Geste / Hardware-Back-Button: zurück navigieren oder App beenden.
      // window.history.back() ist im Capacitor WebView unzuverlässig → goto(-1) mit Fallback.
      import('@capacitor/app').then(({ App }) => {
        App.addListener('backButton', () => {
          if (window.location.pathname !== '/dashboard') {
            goto(-1 as any).catch(() => goto('/dashboard'));
          } else {
            App.exitApp();
          }
        });
      }).catch(() => { /* nicht-kritisch */ });
    }

    // Analytics nur nach expliziter Einwilligung initialisieren (DSGVO Art. 7)
    if (localStorage.getItem('austrofit_analytics_consent') === 'true') {
      initAnalytics(env.PUBLIC_POSTHOG_TOKEN ?? '');
    }
    const onConsent = (e: Event) => {
      if ((e as CustomEvent<boolean>).detail) {
        initAnalytics(env.PUBLIC_POSTHOG_TOKEN ?? '');
      }
    };
    window.addEventListener('austrofit:consent', onConsent);

    // Level-Definitionen aus Directus laden (Fallback: hardcoded LEVEL_DEFS)
    fetch(apiUrl('/api/levels'))
      .then((r) => r.json())
      .then((body: { data: { level: number; name: string; min_points: number; max_points: number }[] }) => {
        if (body.data?.length) {
          levelDefs.set(
            body.data.map((l) => ({ level: l.level, name: l.name, min: l.min_points, max: l.max_points })) as LevelDef[]
          );
        }
      })
      .catch(() => { /* Fallback bleibt aktiv */ });

    // App-Konfiguration aus Directus laden (Fallback: sichere Defaults im Store)
    fetch(apiUrl('/api/app-config'))
      .then((r) => r.json())
      .then((cfg) => { if (cfg) appConfig.set(cfg); })
      .catch(() => { /* Fallback bleibt aktiv */ });

    const handler = (e: Event) => {
      e.preventDefault();
      pwaPrompt.set(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('austrofit:consent', onConsent);
    };
  });
</script>

{#if !isNative}
  <MainNavbar />
{/if}

<div class={isNative ? 'pb-20' : ''}>
  {@render children()}
</div>

{#if isNative}
  <BottomNav />
{:else}
  <Footer />
{/if}

<ConsentBanner />
