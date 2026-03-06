<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import MainNavbar from '$lib/components/MainNavbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { initAnalytics } from '$lib/utils/mixpanel';
  import { env } from '$env/dynamic/public';

  const { data, children } = $props();

  onMount(() => {
    initAnalytics(env.PUBLIC_POSTHOG_TOKEN ?? '');
  });
  const { navigationTrees, navigationKeys } = data;
  const mainNav = navigationTrees[navigationKeys['main']] ?? [];
  const footerNav = navigationTrees[navigationKeys['footer']] ?? [];
</script>

<MainNavbar navigation={mainNav}/>

{@render children()}

<Footer navigation={footerNav} />
