<script>
  import { PUBLIC_CMSURL } from "$env/static/public";
  import { getTextImageClasses } from "$lib/design-system/classes";
  const { blockData, theme } = $props();

   // Get layout options
  let imagePosition = blockData.image_position || 'left';
  let alignment = blockData.alignment || 'left';
  let imageSize = blockData.image_size || 'medium';
  
  // Get styling classes
  let styles = $derived(getTextImageClasses(imagePosition, alignment, imageSize, theme));
  //console.log(styles);
  //console.log(blockData);

</script>
<div class={styles.container}>
  {#if blockData.image}
    <div class={styles.image}>
      <img
            src="{PUBLIC_CMSURL}/assets/{blockData.image}"
            alt={blockData.image.title || blockData.title || 'Bild'}
            class="w-full h-auto object-cover rounded-lg"            
          />
    </div>
    
  {/if} 
  <div class={styles.textContent}>
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
  
</div>

