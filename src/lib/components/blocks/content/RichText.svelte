<script>
  import { getRichTextClasses } from "$lib/design-system/classes";
  const { blockData, theme } = $props();

  let alignment = blockData.alignment || "left";  
  //console.log(blockData);
  let styles = $derived(getRichTextClasses(alignment, theme));

</script>

<div class={styles.container}>
  <!-- Tagline (optional) -->
  {#if blockData.tagline}
    <div class={styles.tagline}>
      {blockData.tagline}
    </div>
  {/if}
  
  <!-- Headline -->
  {#if blockData.headline}
    <h2 class={styles.headline}>
      {blockData.headline}
    </h2>
  {/if}
  
  <!-- Rich text content -->
  {#if blockData.content}
    <div class={styles.content}>
      {@html blockData.content}
    </div>
  {/if}
</div>
<!-- <section class="block-section">
    <div class="container-content">
      {#if blockData.tagline}
        <h3>{blockData.tagline}</h3>
      {/if}
      {#if blockData.headline}
        <h2>{blockData.headline}</h2>
      {/if}
      {#if blockData.content}
        <div>
          {@html blockData.content}
        </div>
      {/if}
    </div>
</section> -->
