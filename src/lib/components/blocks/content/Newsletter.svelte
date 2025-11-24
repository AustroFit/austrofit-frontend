<script>
  import Form from "$lib/components/Form.svelte";
  const { blockData, formResponse } = $props();
  const formData = blockData?.form
  //console.log("blockData:", blockData);
  //console.log("formResponse:", formResponse)

</script>

{#if formData && formData?.is_active}
  <section>
    <div class="bg-white p-4 rounded-2xl shadow-2xl">
        {#if blockData?.tagline}
      <p class="uppercase font-bold text-teal-600">{blockData.tagline}</p>  
      {/if}
      {#if blockData?.headline}
        <h2 class="text-4xl">{blockData.headline}</h2>  
      {/if}

      <Form {formData} {formResponse}/>  

    </div>

  </section>
{/if}
