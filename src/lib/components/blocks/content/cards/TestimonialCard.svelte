<!-- src/lib/components/blocks/content/cards/TestimonialCard.svelte -->
<script>
  import { getTestimonialCardClasses } from "$lib/design-system/classes";
  
  const { item, cardStyle = 'lightgrey', cardAlignment = 'left' } = $props();
  const styles = getTestimonialCardClasses(cardStyle, cardAlignment);
  const imageUrl = item.image ? `https://cms.austrofit.at/assets/${item.image}` : null;

</script>

<div class={styles.container}>
  <!-- Quote Icon -->
  <div class={styles.quoteIcon}>
    <svg width="16" height="16" viewBox="0 0 40 32" fill="currentColor">
      <path d="M0 32V16C0 7.2 7.2 0 16 0v8c-4.4 0-8 3.6-8 8v2h8v14H0zm24 0V16c0-8.8 7.2-16 16-16v8c-4.4 0-8 3.6-8 8v2h8v14H24z"/>
    </svg>
  </div>
  
  <!-- Quote -->
  <blockquote class={styles.quote}>
    {item.quote}
  </blockquote>
  

  
  <!-- Author -->
  <div class={styles.author}>
    <!-- Author Image or Initials -->
    {#if imageUrl}
    <div class={styles.avatarWrapper}>
        <img 
          src={imageUrl} 
          alt={item.name}
          class={styles.avatar}
        /> 
    </div>
    {/if}
    
    <!-- Author Info -->
    <div class={styles.authorInfo}>
      <div class={styles.authorName}>
        {item.name}
      </div>
      
      {#if item.role || item.company}
        <div class={styles.authorMeta}>
          {#if item.role}
            <span>{item.role}</span>
          {/if}
          {#if item.role && item.company}
            <span class={styles.separator}>•</span>
          {/if}
          {#if item.company}
            <span>{item.company}</span>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>