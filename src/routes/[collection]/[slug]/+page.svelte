<script>
  import Content from '$lib/components/singlepage/Content.svelte';
  import Hero from '$lib/components/singlepage/Hero.svelte';
  import Meta from '$lib/components/singlepage/Meta.svelte';
  import RelatedItems from '$lib/components/singlepage/RelatedItems.svelte';
  import { getSinglePageConfig } from '$lib/config/singlePageConfigs.js';
  import { getSinglePageClasses } from '$lib/design-system/classes.js';
  const { data } = $props();
  const { item, collection, relatedItems } = data;
  
  // Get display configuration for this collection
  const pageConfig = getSinglePageConfig(collection);
  const styles = getSinglePageClasses();
  //console.log('Page data:', { item, collection, pageConfig });
</script>

<section class={styles.pageContainer}>
  <!-- Hero Section -->
  <Hero {item} {collection} config={pageConfig} />

  <!-- Meta Section (breadcrumbs, date, location, etc.) -->
  {#if pageConfig.showMeta || pageConfig.showBreadcrumbs}
    <Meta {item} {collection} config={pageConfig} />
  {/if}

  <!-- Main Content -->
  <Content {item} {collection} config={pageConfig} />
  <!-- Related Items -->
  {#if pageConfig.showRelated && relatedItems?.length > 0}
    <RelatedItems items={relatedItems} {collection} title={pageConfig.relatedTitle} />
  {/if}
</section>