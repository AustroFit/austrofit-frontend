<script>
  import { getSinglePageClasses } from "$lib/design-system/classes";
  const { item, collection, config} = $props();

  const imageUrl = item.image ? `https://cms.zukunftsallianz.at/assets/${item.image}` : null;
  
  const styles = getSinglePageClasses();
  console.log(item);
</script>

<div class={styles.containerContent}>
  {#if item.description}
    <div class={styles.description}>
      {item.description}
    </div>
    
  {/if}
  
    {#if item.content}
    <p class={styles.content}>{@html item.content}</p>
    {/if}
  </div>
