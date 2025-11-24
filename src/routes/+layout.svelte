<script>
  import '../app.css';
  import MainNavbar from '$lib/components/MainNavbar.svelte';
  import Footer from '$lib/components/Footer.svelte';

  const { data, children } = $props();
  const { navigationTrees, navigationKeys } = data;
  const mainNav = navigationTrees[navigationKeys['main']] ?? [];
  const footerNav = navigationTrees[navigationKeys['footer']] ?? [];
</script>

<MainNavbar navigation={mainNav}/>

{@render children()}

<Footer navigation={footerNav} />
