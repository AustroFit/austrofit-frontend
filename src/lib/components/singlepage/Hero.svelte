<script>
  import { getSinglePageClasses } from "$lib/design-system/classes";
  const { item, collection, config} = $props();

  const imageUrl = item.image ? `https://cms.austrofit.at/assets/${item.image}` : null;
  
  const styles = getSinglePageClasses();

  //console.log(item, collection, config);
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
