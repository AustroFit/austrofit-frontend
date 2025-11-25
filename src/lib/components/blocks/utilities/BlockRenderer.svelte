<script>
  import { blockComponentMap } from "./map";
  import { dev } from "$app/environment";
  
  const { block, formResponse } = $props();
  const BlockComponent = $derived(block?.collection && blockComponentMap[block.collection]);
  //const blockData = $derived(block?.item);
  //const additionalData = $derived(block.additionalData);
  //let theme = $derived(block?.background || "light");
</script>

{#if BlockComponent && block?.item}
  <BlockComponent {block} {formResponse} />
{:else if dev && !BlockComponent && block?.collection}
  <div style="border: 2px solid red; padding: 1rem;">
    Unknown block type: {block.collection}
  </div>
{:else if dev && !block?.item && block?.collection}
  <div style="border: 2px solid red; padding: 1rem;">
    Missing data for: {block.collection}
  </div>
{/if}
