<script>
  import { getSinglePageClasses } from "$lib/design-system/classes";
  import { cmsAssetUrl } from "$lib/cms/image";
  import { PUBLIC_CMSURL } from "$env/static/public";

  const { item, collection, config} = $props();

  const imageUrl = $derived(item.image
    ? cmsAssetUrl(PUBLIC_CMSURL, item.image, { width: 1600, quality: 80, format: "webp" })
    : null);

  const styles = getSinglePageClasses();
</script>

<div class={styles.containerHero}>
  {#if imageUrl}
      <img 
        src={imageUrl}
        alt={item.name || 'event image'}
        class={styles.image}
        loading="lazy"
      />
    {/if}
    {#if item.title}
      <h1 class={styles.heading}>{item.title}</h1>
    {/if}
  </div>
