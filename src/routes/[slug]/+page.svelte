<script>
  import BlockRenderer from "$lib/components/blocks/utilities/BlockRenderer.svelte";
  import BlockWrapper from "$lib/components/blocks/utilities/BlockWrapper.svelte";
  import { getBlockVisibility } from "$lib/utils/blockVisibility";
  let { data, form } = $props();
  //console.log("form: ", form)
  //console.log(data.page.blocks[0]);
</script>

{#each data.page.blocks as block}
  {@const shouldRender = getBlockVisibility(block)}

  {#if shouldRender}
    <BlockWrapper block = {block}>
      <BlockRenderer block = {block} formResponse={form}/>
    </BlockWrapper>
  {/if}
{/each}
    

