<script>
  import { page } from "$app/state";
  
  let { data } = $props();
  const onboardingEvents = $derived(data.onboardingEvents);
  const volunteer = $derived(data.volunteer);
  const justRegistered = $derived(page.url.searchParams.has("registered"));
  
  const formError = $derived(page.form?.error);
</script>

<div>
  {#if justRegistered}
    <div class="success-message bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      <h2>Vielen Dank für deine Anmeldung!</h2>
      <p>Du hast dich erfolgreich registriert. Wähle jetzt einen der nächsten Onboarding-Termine aus.</p>
    </div> 
  {/if}
  
  <div class="process-info">
    <h2>So geht es weiter</h2>
    <p>Du hast den ersten Schritt geschafft! Hier eine kurze Übersicht über den weiteren Ablauf:</p>
    <ul>
      <li><strong>Termin auswählen:</strong> Wähle unten einen der nächsten Onboarding-Termine aus, der dir passt</li>
      <li><strong>Bestätigung per E-Mail:</strong> Nach der Anmeldung erhältst du eine E-Mail mit allen Details und dem Teams-Link</li>
      <li><strong>Erinnerung:</strong> 24 Stunden vor dem Termin schicken wir dir eine Erinnerung</li>
      <li><strong>Backup-E-Mail:</strong> Falls du dich nicht gleich anmeldest, senden wir dir den Link zu dieser Seite per E-Mail</li>
    </ul>
    <p>Bei Fragen kannst du dich jederzeit bei uns melden!</p>
  </div>

  <div class="events-section">
    <h2>Verfügbare Onboarding-Termine</h2>
    <p>Alle Termine finden online über Microsoft Teams statt. Wähle einfach den Termin aus, der am besten zu dir passt:</p>
    
    <div class="p-4 grid grid-cols-3">
      {#each onboardingEvents as event}
        {@const isRegistered = event.registrations.some(p => p.volunteer_id === volunteer.id)}
        
        <div class="p-4">
          <h3>{event.title}</h3>
          <div>{event.event_date}</div>
          {#if event.online_meeting}
            <div>online</div>
          {:else if event.address}
            <p>{event.address}</p>
          {/if}

          <form method="POST" action="?/{isRegistered ? 'unregister' : 'register'}">
            <input type="hidden" name="event_id" value={event.id} />
            <button 
              type="submit" 
              class="font-medium px-6 py-2 rounded-lg transition-colors duration-200 ease-in-out
                     {isRegistered 
                       ? 'bg-green-600 hover:bg-green-700 text-white' 
                       : 'bg-blue-600 hover:bg-blue-700 text-white'}"
            >
              {isRegistered ? 'Abmelden' : 'Anmelden'}
            </button>
          </form>
        </div>
      {/each}
    </div>
  </div>
  
    <!-- Error message -->
  {#if formError}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {formError}
    </div>
  {/if}
  
</div>