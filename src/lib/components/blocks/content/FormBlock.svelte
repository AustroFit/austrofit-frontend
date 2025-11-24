<script>
  import Form from "$lib/components/Form.svelte";
  const { blockData, formResponse } = $props();
  const formData = blockData?.form
</script>

{#if formData && formData?.is_active}
  <section class="block-section">
    <div class="container-content">
      {#if blockData?.tagline}
        <p>{blockData.tagline}</p>  
      {/if}
      {#if blockData?.headline}
        <h2>{blockData.headline}</h2>  
      {/if}
      
      <Form {formData} {formResponse}/> 

    </div>
 
  </section>
{/if}





