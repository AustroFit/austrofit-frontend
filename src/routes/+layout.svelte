<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import MainNavbar from '$lib/components/MainNavbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { initAnalytics } from '$lib/utils/mixpanel';
  import { env } from '$env/dynamic/public';
  import { pwaPrompt } from '$lib/stores/pwa';

  const { children } = $props();

  onMount(() => {
    initAnalytics(env.PUBLIC_POSTHOG_TOKEN ?? '');

    const handler = (e) => {
      e.preventDefault();
      pwaPrompt.set(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  });
</script>

<MainNavbar />

{@render children()}

<Footer />
