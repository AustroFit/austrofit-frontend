<script>
  import { getSupporterCardClasses } from "$lib/design-system/classes";

  const { item } = $props();
  const styles = getSupporterCardClasses();
  const imageUrl = item.image ? `https://cms.zukunftsallianz.at/assets/${item.image}` : null;

</script>

<div class={styles.container}>
  {#if imageUrl}
    <img 
      src={imageUrl}
      alt={item.name || 'supporter'}
      class={styles.logo}
      loading="lazy"
    />
  {/if}
</div>