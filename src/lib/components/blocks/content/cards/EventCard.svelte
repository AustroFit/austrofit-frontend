<script>
  import { getEventCardClasses } from "$lib/design-system/classes";
  import { getStateNames } from "$lib/utils/states";
  const { item, cardAlignment, cardStyle, buttonStyle, columns = 3} = $props();
  const imageUrl = item.image ? `https://cms.austrofit.at/assets/${item.image}` : null;
  const styles = getEventCardClasses(cardStyle, cardAlignment, columns);
  //console.log(styles);

  //extract state Ids from query
  const stateIds = item.location_state?.map(ls => ls.states_id) || [];
  const states = getStateNames(stateIds);
  //console.log("states:",states)
  

  const typeLabels = {
    'general': 'Allgemein',
    'info': 'Info-Termin',
    'workshop': 'Workshop',
    'aktion': 'Aktion',
    'austauschtreffen': 'Austauschtreffen'
  };
  const typeLabel = typeLabels[item.type] || null;
  // Format date range
  const eventDateDisplay = formatEventDate(item.event_date, item.event_date_end);

  //console.log(item);
  /**
   * Format event date or date range
   * Examples:
   * - "22. August 2025" (single day)
   * - "22.–29. August 2025" (same month)
   * - "28. Aug.–3. Sept. 2025" (different months)
   */
  function formatEventDate(eventDate, eventDateEnd) {
    if (!eventDate) return null;
    
    const start = new Date(eventDate);
    const end = eventDateEnd ? new Date(eventDateEnd) : null;
    
    // Single day event
    if (!end || start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('de-DE', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    }
    
    // Multi-day event - same month
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      const startDay = start.getDate();
      const endDay = end.getDate();
      const month = start.toLocaleDateString('de-DE', { month: 'long' });
      const year = start.getFullYear();
      
      return `${startDay}.–${endDay}. ${month} ${year}`;
    }
    
    // Multi-day event - different months
    const startFormatted = start.toLocaleDateString('de-DE', { 
      day: 'numeric', 
      month: 'short' 
    });
    const endFormatted = end.toLocaleDateString('de-DE', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
    
    return `${startFormatted}–${endFormatted}`;
  }
  //console.log('Container class:', styles.container); // ✅ Add this
</script>

<div class={styles.container}>

  {#if imageUrl}
    <img 
      src={imageUrl}
      alt={item.name || 'event image'}
      class={styles.image}
      loading="lazy"
    />
  {:else}
  <div class="{styles.image} bg-gradient-to-br from-dark-kvb-blue to-dark-blue-2 flex items-center justify-center">
    <span class="text-4xl text-white opacity-30">📅</span>
  </div>
  {/if}
  
  <div class={styles.content}>

    {#if states && states.length > 0}
      <div class={styles.badges}>
        {#each states as state}
          <span class={styles.badgeState}> {state}</span>
        {/each}
      </div>
    {/if}
    {#if item.title}
      <h3 class={styles.title}>
        {item.title}
      </h3>
    {/if}

    <div class={styles.metaBanner}>
      {#if item.event_date}
        <div class={styles.metaItem}>
          <span class={styles.metaIcon}>📅</span>
          <time datetime={item.event_date}>
            {eventDateDisplay}
          </time>
        </div>
      {/if}
      
      {#if item.location}
        <div class={styles.metaItem}>
          <span class={styles.metaIcon}>📍</span>
          <span>{item.location}</span>
        </div>
      {/if}
      
      
      <div class={styles.badges}>
        {#if item.type}
          <span class={styles.badge}>
            {typeLabel}
          </span>
        {/if}      

        {#if item.online_meeting}
          <span class={styles.badgeOnline}>
            Online
          </span>
        {/if}
      </div>
      
    </div>

    {#if item.description}
      <div class={styles.description}>
        {@html item.description}
      </div>
    {/if}
  
    {#if item.slug}
      <a 
        href="/events/{item.slug}" 
        class="{buttonStyle} mt-auto"
      >
        Mitmachen
      </a>
    {/if}
    
  </div>
</div>