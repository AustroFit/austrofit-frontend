<script>
  import Form from "$lib/components/Form.svelte";
  import { getBaseBlockClasses, getButtonClasses } from "$lib/design-system/classes";
  const { block, formResponse } = $props();
  const blockData = block.item;
  const theme = block.background || 'light';
  const alignment = blockData.alignment || 'left';
  const formData = blockData?.form;
  const styles = getBaseBlockClasses(alignment, theme);
  const buttonStyle = getButtonClasses(blockData.button_style, 'md');
</script>

{#if formData && formData?.is_active}

  <div class={styles.container}>
    {#if blockData?.tagline}
      <div class={styles.tagline}>{blockData.tagline}</div>  
    {/if}
    {#if blockData?.headline}
      <h2 class={styles.headline}>{blockData.headline}</h2>  
    {/if}
    {#if blockData.description}
        <div class={styles.description}>
          {blockData.description}
        </div>
      {/if}
    
    <Form {formData} {formResponse} {buttonStyle}/> 

  </div>
 

{/if}





