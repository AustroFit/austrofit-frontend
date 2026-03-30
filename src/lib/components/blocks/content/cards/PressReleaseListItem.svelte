<script>
  import { getListItemClasses } from "$lib/design-system/classes";
  
  const { item, cardStyle } = $props();
  const styles = $derived(getListItemClasses(cardStyle));

  // Format release date
  const releaseDate = $derived(item.date_published || item.date_created);
  const formattedDate = $derived(releaseDate
    ? new Date(releaseDate).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : null);
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