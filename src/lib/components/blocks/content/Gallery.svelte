<script>
  import { PUBLIC_CMSURL } from "$env/static/public";
  const { block } = $props();
  const blockData = $derived(block.item);
  const theme = $derived(block.background || 'light');

</script>

<section class="text-center">
  {#if blockData?.tagline}
    <h3>{blockData.tagline}</h3>  
  {/if}

  {#if blockData?.headline}
    <h2>{blockData.headline}</h2>  
  {/if}
  
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 justify-center m-4">
    {#each blockData?.items || [] as item}
      <div>
        <img
          src="{PUBLIC_CMSURL}/assets/{item.directus_file}"
          alt={item.title || item.description || "Gallery image"}
          class="w-full h-auto rounded-lg shadow-lg"
          loading="lazy"
        />
      </div>
    {/each}
  </div>

</section>


