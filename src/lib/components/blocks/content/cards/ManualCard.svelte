<script>
  import { getCardClasses } from "$lib/design-system/classes";
  const {cardData, cardAlignment, cardStyle, buttonStyle, buttonSize} = $props();
  //console.log(cardData);
  const imageUrl = $derived(cardData.image ? `https://cms.austrofit.at/assets/${cardData.image}` : null);
  const styles = $derived(getCardClasses(cardAlignment, cardStyle, !!imageUrl));
</script>

<div class={styles.container}>
  {#if imageUrl}
    <img 
      src={imageUrl}
      alt={cardData.headline || 'card image'}
      class={styles.image}
      loading="lazy"
    />    
  {/if}

  <div class={styles.cardContent}>
    {#if cardData.headline}
    <h3 class={styles.headline}>
      {cardData.headline} 
    </h3>       
    {/if}

    {#if cardData.content}
    <div class={styles.content}>
      {cardData.content}
    </div>
    {/if}
    {#if cardData.button}
    {#if cardData.button.label && cardData.button.link_type === 'internal' && cardData.button.internal_page}
      <a 
        href="/{cardData.button.internal_page.slug}"
        class="{styles.button}"
        target={cardData.button.open_in_new_tab ? '_blank' : null}
        rel={cardData.button.open_in_new_tab ? 'noopener noreferrer' : null}
      >
        {cardData.button.label}
      </a>
      {:else if cardData.button.label && cardData.button.link_type === 'external' && cardData.button.external_url}
      <a 
        href={cardData.button.external_url}
        class="{styles.button}"
        target={cardData.button.open_in_new_tab ? '_blank' : null}
        rel={cardData.button.open_in_new_tab ? 'noopener noreferrer' : null}
      >
        {cardData.button.label}
      </a>
      {/if}
    {/if}
  </div>
  
</div>

