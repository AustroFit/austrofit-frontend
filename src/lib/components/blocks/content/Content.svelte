<script>
  import { getContentBlockClasses, getButtonClasses } from "$lib/design-system/classes";
  
  const { block } = $props();
  const blockData = block.item;
  const theme = block.background || 'light';
  const alignment = blockData.alignment || "left";
  const imagePosition = blockData.image_position || null;
  const imageSize = blockData.image_size || 'medium';
  
  const styles = getContentBlockClasses(alignment, theme, imagePosition, imageSize);
  // Image URL
  const imageUrl = blockData.image 
    ? `https://cms.zukunftsallianz.at/assets/${blockData.image}` 
    : null;
  
  // Button classes
  const buttonClasses = blockData.button 
    ? getButtonClasses(blockData.button_style, blockData.button_size)
    : null;

  // Button link
  const buttonHref = blockData.button?.link_type === 'internal'
    ? `/${blockData.button.internal_page.slug}#${blockData.button.anchor}` // Adjust based on your routing
    : blockData.button?.external_url;
  
  const buttonTarget = blockData.button?.open_in_new_tab ? '_blank' : undefined;
</script>
<div class={styles.container}>
  <!-- If no image, just render content with alignment -->
  {#if !imageUrl}
    <div class={styles.contentAlignment}>
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
      
      {#if blockData.button}
        <a 
          href={buttonHref} 
          class={buttonClasses}
          target={buttonTarget}
        >
          {blockData.button.label}
        </a>
      {/if}
    </div>
  
  <!-- With image: use layout -->
  {:else}
    <div class={styles.layout}>
      <!-- Image wrapper -->
      <div class={styles.imageWrapper}>
        <img 
          src={imageUrl}
          alt={blockData.image_alt || blockData.headline || 'Content image'}
          class={styles.image}
        />
      </div>
      
      <!-- Text content -->
      <div class="{styles.textContent} {styles.contentAlignment}">
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
        
        {#if blockData.button}
          <a 
            href={buttonHref} 
            class={buttonClasses}
            target={buttonTarget}
          >
            {blockData.button.label}
          </a>
        {/if}
      </div>
    </div>
  {/if}
</div>
