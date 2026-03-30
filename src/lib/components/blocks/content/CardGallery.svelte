<script>
  import ManualCard from "./cards/ManualCard.svelte";
  import { getCardGalleryClasses } from "$lib/design-system/classes";
  
  const { block } = $props();
  const blockData = $derived(block.item);
  const theme = $derived(block.background || 'light');
  const alignment = $derived(blockData?.alignment || "left");
  const cardAlignment = $derived(blockData?.card_alignment || "center");
  const cardStyle = $derived(blockData?.card_style || 'lightgrey');
  const styles = $derived(getCardGalleryClasses());
  //console.log(blockData)
</script>

<div class={styles.container}>
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

  <div class={styles.cardGrid}>
    {#each blockData.cards as cardRelation, index}
    {@const isLastOdd = index === blockData.cards.length - 1 && blockData.cards.length % 2 === 1}
    
    <div class={isLastOdd ? 'md:col-span-full md:max-w-sm md:mx-auto lg:col-span-1 lg:max-w-none lg:mx-0' : 'contents'}>
      <ManualCard 
        cardData={cardRelation.cards_id}
        {cardAlignment}
        {cardStyle}
        buttonStyle={blockData.button_style}
        buttonSize={blockData.button_size}
      />
    </div>
  {/each}
  </div>
</div>