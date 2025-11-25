<script>
  import { getTeamCardClasses } from "$lib/design-system/classes";
  
  const { item, cardStyle = 'lightgrey', cardAlignment = 'left' } = $props();
  const styles = getTeamCardClasses(cardStyle, cardAlignment);
  const imageUrl = item.image ? `https://cms.zukunftsallianz.at/assets/${item.image}` : null;

</script>

<div class={styles.container}>

  {#if imageUrl}
    <img 
      src={imageUrl}
      alt={item.name || 'ZA-Mitglied'}
      class={styles.image}
      loading="lazy"
    />
  {:else}
    <div class={styles.placeholder}>
      <svg class={styles.icon} fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
      </svg>
    </div>
  {/if}

  {#if item.first_name}
    <h4 class={styles.name}>{item.first_name}</h4>    
  {/if}

  {#if item.job_title}
    <div class={styles.job_title}>{item.job_title}</div>
  {/if}
  
  <!-- Quote -->
  {#if item.quote}
    <div class={styles.quote}> 
    "{item.quote}" 
    </div>  
  {/if}



</div>