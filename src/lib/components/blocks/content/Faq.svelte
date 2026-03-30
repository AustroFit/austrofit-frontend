<script>
  import { getFaqClasses } from "$lib/design-system/classes";
  import FaqItem from "./FaqItem.svelte";
  
  const { block } = $props();
  const blockData = $derived(block.item);
  const theme = $derived(block.background || 'light');

  const styles = $derived(getFaqClasses(theme));
</script>

<div class={styles.container}>
  {#if blockData.tagline}
    <div class={styles.tagline}>
      {blockData.tagline}
    </div>
  {/if}
  {#if blockData.headline}
    <h2 class={styles.headline}>
      {blockData.headline}
    </h2>
  {/if}

  {#if blockData.description}
    <div class={styles.description}>
      {blockData.description}
    </div>
  {/if}
  <div class={styles.faqContainer}>
    {#each blockData.faq_items as item}
      <FaqItem {item} {styles} />
    {/each}
  </div>
  
</div>