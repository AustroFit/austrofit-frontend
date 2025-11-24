<script>
  //import { getCardClasses } from "$lib/design-system/classes";
  import { PUBLIC_ASSETURL } from "$env/static/public";
  const { variant = "base", padding = "md", blockData, additionalData } = $props();
  const posts = additionalData;
  //console.log(posts);
  //let cardClass = $derived(getCardClasses(variant, padding));
</script>

<section class="text-center p-4 m-4">
  {#if blockData?.tagline}
    <h3>{blockData.tagline}</h3>  
  {/if}

  {#if blockData?.headline}
    <h2>{blockData.headline}</h2>  
  {/if}

  <div>
    <h3>New Articles</h3>
    <div class="grid grid-cols-2">
      {#each posts as post}
        <div class={cardClass}>
        <img
        src="{PUBLIC_ASSETURL}/{post.image}"
        alt={"Gallery image"}
        class="w-full h-auto rounded-lg shadow-lg"
        loading="lazy"
        />
        <h3 class="text-3xl">{post.title}</h3>
        <p class="m-4">{post.description}</p>
        </div>  
        
      {/each}
    </div>
  </div>
</section>