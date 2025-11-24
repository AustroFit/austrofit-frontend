<script>
  import { blockComponentMap } from "./map";
  const { block, formResponse } = $props();
  const BlockComponent = $derived(block?.collection && blockComponentMap[block.collection]);
  const blockData = $derived(block?.item);
  const additionalData = $derived(block.additionalData);
  let theme = $derived(block?.background || "light");
  //console.log("BR", block)
</script>

{#if BlockComponent && blockData}
  <BlockComponent {blockData} {additionalData} {formResponse} {theme} />
{/if}
