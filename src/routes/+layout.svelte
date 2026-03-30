<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import MainNavbar from '$lib/components/MainNavbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import ConsentBanner from '$lib/components/dashboard/ConsentBanner.svelte';
  import { initAnalytics } from '$lib/utils/mixpanel';
  import { env } from '$env/dynamic/public';
  import { pwaPrompt } from '$lib/stores/pwa';
  import { levelDefs } from '$lib/stores/levels';
  import type { LevelDef } from '$lib/utils/level';

  const { children } = $props();

  onMount(() => {
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
    fetch('/api/levels')
      .then((r) => r.json())
      .then((body: { data: { level: number; name: string; min_points: number; max_points: number }[] }) => {
        if (body.data?.length) {
          levelDefs.set(
            body.data.map((l) => ({ level: l.level, name: l.name, min: l.min_points, max: l.max_points })) as LevelDef[]
          );
        }
      })
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

<MainNavbar />

{@render children()}

<Footer />

<ConsentBanner />
