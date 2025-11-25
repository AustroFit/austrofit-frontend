<script>
  import { getListItemClasses } from "$lib/design-system/classes";
  
  const { item, cardStyle } = $props();
  const styles = getListItemClasses(cardStyle);
  
  // Format release date
  const releaseDate = item.date_published || item.date_created;
  const formattedDate = releaseDate 
    ? new Date(releaseDate).toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      })
    : null;
</script>

<a href="/pressemitteilungen/{item.slug}" class={styles.container}>
  <h3 class={styles.title}>
    {item.title}
  </h3>
  
  {#if formattedDate}
    <time datetime={releaseDate} class={styles.date}>
      {formattedDate}
    </time>
  {/if}
</a>