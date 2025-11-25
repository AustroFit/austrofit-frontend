<script>

  const { event, volunteer }  = $props();
  const isRegistered = event.registrations.some(p => p.volunteer_id === volunteer.id)
  const eventDateDisplay = formatEventDate(event.event_date, null);

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
</script>

          
<div class="flex flex-col gap-1 bg-light-white text-dark-blue-1 p-4 rounded-sm shadow-[0_2px_8px_0px_rgba(0,0,0,0.10)]">
  <h3 class="font-semibold text-lg">{event.title}</h3>
  <div class="">
        <span class='text-base'>📅</span>
        <time 
        class='text-sm' 
        datetime={event.event_date}>
          {eventDateDisplay}
        </time>
  </div>
  
  {#if event.online_meeting}
    <span class='self-start inline-block px-3 py-1 bg-dark-kvb-blue/10 text-dark-kvb-blue rounded-full text-sm font-medium'>online</span>
  {:else if event.address}
    <p class="text-sm">{event.address}</p>
  {/if}

  <form 
  method="POST" 
  action="?/{isRegistered ? 'unregister' : 'register'}"
  class="mt-auto">
    <input type="hidden" name="event_id" value={event.id} />
    <button 
      type="submit" 
      class="inline-flex cursor-pointer font-montserrat w-full tracking-wider items-center justify-center rounded-md transition-colors border-2 mt-2 py-1 text-[15px] font-medium
            {isRegistered 
              ? 'border-dark-green-1  bg-dark-green-1  text-white hover:bg-dark-green-1 /90 hover:border-dark-green-1 /90' 
              : 'border-dark-pink-1 bg-dark-pink-1 text-white hover:bg-dark-pink-1/90 hover:border-dark-pink-1/90'}"
    >
      {isRegistered ? 'Abmelden' : 'Anmelden'}
    </button>
  </form>
</div>