<script>
  import FaqItem from "./FaqItem.svelte";
  const { blockData } = $props();
</script>

<div class="faq">
  {#each blockData.faq_items as item}
    <FaqItem {item} />  
  {/each}
</div>





