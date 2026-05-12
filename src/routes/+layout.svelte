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

  // Synchron erkennen: kein Flash beim ersten Render auf native.
  // browser-Guard nötig weil SSR kein window.Capacitor kennt.
  let isNative = $state(browser && Capacitor.isNativePlatform());

  onMount(() => {
    isNative = Capacitor.isNativePlatform();
    // Statusleiste konfigurieren (nur native App)
    if (isNative) {
      import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
        StatusBar.setOverlaysWebView({ overlay: true });  // WebView füllt gesamten Screen
        StatusBar.setStyle({ style: Style.Dark });        // weiße Icons – CSS-Overlay ist dunkelgrün
      }).catch(() => { /* nicht-kritisch */ });

      // env(safe-area-inset-top) ist bei erstem Render manchmal noch 0 →
      // JS-Probe misst echten Wert und setzt --sat als zuverlässige Fallback-Variable.
      const probe = () => {
        const el = document.createElement('div');
        el.style.cssText = 'position:fixed;top:0;left:0;padding-top:env(safe-area-inset-top);pointer-events:none;visibility:hidden;';
        document.body.appendChild(el);
        const sat = parseFloat(getComputedStyle(el).paddingTop) || 0;
        document.body.removeChild(el);
        if (sat > 0) {
          document.documentElement.style.setProperty('--sat', sat + 'px');
        }
      };
      requestAnimationFrame(probe);

      // Back-Geste / Hardware-Back-Button.
      // NICHT goto(-1): Das würde zur URL "/-1" navigieren (→ [slug]-Route → __data.json-Fehler).
      // canGoBack (Capacitor) prüft ob History-Stack vorhanden → dann history.back(),
      // sonst goto('/dashboard') als sicherer Fallback.
      import('@capacitor/app').then(({ App }) => {
        App.addListener('backButton', ({ canGoBack }) => {
          if (window.location.pathname === '/dashboard') {
            App.exitApp();
          } else if (canGoBack) {
            history.back();
          } else {
            goto('/dashboard');
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

{#if isNative}
  <!-- Festes dunkelgrünes Overlay für Statusleisten-Fläche (overlaysWebView=true).
       --sat wird von JS gemessen (Fallback: env direkt). Überdeckt immer die Statusleiste,
       egal was darunter scrollt. -->
  <div
    class="fixed top-0 left-0 right-0 z-[9999]"
    style="height: var(--sat, env(safe-area-inset-top, 0px)); background-color: #0D2E18;"
  ></div>
{/if}

<div class={isNative ? 'pb-20' : ''} style={isNative ? 'padding-top: var(--sat, env(safe-area-inset-top, 0px))' : ''}>
  {@render children()}
</div>

{#if isNative}
  <BottomNav />
{:else}
  <Footer />
{/if}

<ConsentBanner />
