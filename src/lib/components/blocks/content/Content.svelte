<script>
  import { getContentClasses } from "$lib/design-system/classes";
  const { blockData, theme } = $props();
  console.log(blockData, theme)
  let alignment = blockData.alignment || "left";
  let styles = getContentClasses(alignment, theme);

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
  
  {#if blockData.content}
    <div class={styles.content}>
      {@html blockData.content}
    </div>
  {/if}

</div>

