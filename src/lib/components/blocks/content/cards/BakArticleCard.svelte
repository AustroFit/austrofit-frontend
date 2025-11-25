<script>
  import { getCardClasses } from "$lib/design-system/classes";
  const {item, cardAlignment, cardStyle, buttonStyle} = $props();

  const imageUrl = item.image ? `https://cms.zukunftsallianz.at/assets/${item.image}` : null;
  const styles = $derived(getCardClasses(cardAlignment, cardStyle, !!imageUrl));
  //console.log(cardstyle)
</script>

<div class={styles.container}>
  {#if imageUrl}
    <img 
      src={imageUrl}
      alt={item.title || 'article image'}
      class={styles.image}
      loading="lazy"
    />    
  {/if}

  <div class={styles.cardContent}>
    {#if item.title}
    <h3 class={styles.headline}>
      {item.title} 
    </h3>       
    {/if}

    {#if item.description}
    <div class={styles.content}>
      {item.description}
    </div>
    {/if}

    {#if item.slug}
      <a 
        href="/bak-artikel/{item.slug}" 
        class="{buttonStyle} mt-auto"
      >
        Weiterlesen
      </a>
    {/if}




  </div>
  
</div>

