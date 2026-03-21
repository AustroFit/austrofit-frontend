<script>
  let provisionOpen = $state(false);

  // Paket-Finder: 0=verborgen, 1=ESG-Frage, 2=Priorität-Frage, 3=Ergebnis
  let finderSchritt = $state(0);
  let finderEmpfehlung = $state('');

  const paketDetails = {
    basic: {
      name: 'Basic',
      preis: '0 €/Monat',
      beschreibung: 'Perfekt zum risikofreien Einstieg. Kein Fixkostenrisiko, keine Mindestlaufzeit.',
      subject: 'Partnerschaft%20AustroFit%20Basic'
    },
    plus: {
      name: 'Plus',
      preis: '19 €/Monat',
      beschreibung: 'Mehr Reichweite durch priorisierte Darstellung und ein Highlight-Badge.',
      subject: 'Partnerschaft%20AustroFit%20Plus'
    },
    premium: {
      name: 'Premium',
      preis: '39 €/Monat',
      beschreibung: 'Volle Ausstattung: Events-Integration, detaillierte Statistiken und Logo-Branding.',
      subject: 'Partnerschaft%20AustroFit%20Premium'
    },
    nachhaltigkeit: {
      name: 'Nachhaltigkeit',
      preis: '29 €/Monat',
      beschreibung: 'Exklusiv für ESG-zertifizierte Betriebe mit eigenem Nachhaltigkeits-Label und Filterplatzierung.',
      subject: 'Partnerschaft%20AustroFit%20Nachhaltigkeit'
    }
  };

  function antwortEsg(jaein) {
    if (jaein) {
      finderEmpfehlung = 'nachhaltigkeit';
      finderSchritt = 3;
    } else {
      finderSchritt = 2;
    }
  }

  function antwortPrioritaet(val) {
    finderEmpfehlung = val;
    finderSchritt = 3;
  }

  function resetFinder() {
    finderSchritt = 0;
    finderEmpfehlung = '';
  }
</script>

<svelte:head>
  <title>Partner werden – AustroFit</title>
  <meta name="description" content="Platziere dein Angebot direkt bei einer gesundheitsbewussten Zielgruppe in Österreich. Nur bei Einlösung zahlen – kein Fixkostenrisiko." />
</svelte:head>

<!-- ── SECTION 1: Hero B2B ─────────────────────────────────── -->
<section
  aria-labelledby="hero-b2b-heading"
  class="bg-darkblue text-white min-h-[90vh] lg:min-h-screen flex items-center"
>
  <div class="w-full max-w-[var(--max-width-standard)] mx-auto px-[var(--spacing-container-x)] lg:px-[var(--spacing-container-x-lg)] py-16 lg:py-24">
    <div class="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

      <!-- Text -->
      <div class="flex-1 text-center lg:text-left">
        <h1 id="hero-b2b-heading" class="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
          Neue Kunden.<br />Messbarer Impact.
        </h1>
        <p class="text-lg text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
          Platziere dein Angebot direkt bei einer gesundheitsbewussten
          Zielgruppe in Österreich. Kein Fixkostenrisiko –
          du zahlst nur bei tatsächlicher Einlösung.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <a
            href="mailto:kontakt@austrofit.at?subject=Partnerschaft%20AustroFit"
            class="inline-block bg-primary text-white font-semibold px-8 py-4 rounded-[var(--radius-pill)] hover:bg-primary-dark transition-colors text-center"
          >
            Jetzt Partner werden
          </a>
          <a
            href="#modell"
            class="inline-block border-2 border-white text-white font-semibold px-8 py-4 rounded-[var(--radius-pill)] hover:bg-white/10 transition-colors text-center"
          >
            Mehr erfahren ↓
          </a>
        </div>

        <!-- Trust-Bar -->
        <div
          class="flex flex-wrap gap-x-8 gap-y-2 mt-6 justify-center lg:justify-start text-sm text-gray-300"
          role="list"
          aria-label="Vorteile auf einen Blick"
        >
          <span role="listitem"><span aria-hidden="true">✓</span> Nur bei Einlösung zahlen</span>
          <span role="listitem"><span aria-hidden="true">✓</span> Kein Fixkostenrisiko</span>
          <span role="listitem"><span aria-hidden="true">✓</span> DSGVO-konform</span>
        </div>
      </div>

      <!-- Hero-Bild -->
      <div class="flex-1 w-full max-w-lg lg:max-w-none">
        <div class="aspect-[4/3] rounded-[var(--radius-card)] overflow-hidden bg-dark-green">
          <img
            src="/images/hero-partner.webp"
            alt="Inhaberin eines österreichischen Gesundheitsbetriebs in einem hellen Ladenlokal"
            width="1200"
            height="900"
            class="w-full h-full object-cover"
          />
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ── SECTION 2: In 3 Schritten zum Partner ──────────────── -->
<section
  id="modell"
  aria-labelledby="modell-heading"
  class="bg-light-grey py-16 lg:py-24"
>
  <div class="max-w-[var(--max-width-standard)] mx-auto px-[var(--spacing-container-x)] lg:px-[var(--spacing-container-x-lg)]">
    <h2 id="modell-heading" class="font-heading text-2xl lg:text-3xl font-bold text-heading text-center mb-4">
      In 3 Schritten zum Partner
    </h2>
    <p class="text-body text-center mb-12 max-w-xl mx-auto">
      Kein Aufwand für dein Team. Kein technisches Know-how nötig.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

      <article class="bg-white border border-gray-200 rounded-[var(--radius-card)] shadow-[var(--shadow-s)] p-6">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm mb-4 bg-primary" aria-hidden="true">1</div>
        <h3 class="font-heading text-xl font-bold text-heading mb-2">Anmelden & Listing einrichten</h3>
        <p class="text-body text-sm leading-relaxed">
          Erstelle deinen kostenlosen Partner-Account. Dein Angebot erscheint
          sofort im AustroFit Partner-Marketplace und wird von aktiven,
          gesundheitsbewussten Nutzer:innen entdeckt.
        </p>
      </article>

      <article class="bg-white border border-gray-200 rounded-[var(--radius-card)] shadow-[var(--shadow-s)] p-6">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm mb-4 bg-primary" aria-hidden="true">2</div>
        <h3 class="font-heading text-xl font-bold text-heading mb-2">Angebot konfigurieren</h3>
        <p class="text-body text-sm leading-relaxed">
          Gutschein definieren, Paket wählen, Kategorie und Region festlegen.
          Nutzer:innen lösen ihre verdienten Punkte ein und kommen
          direkt zu dir – vor Ort oder online.
        </p>
      </article>

      <article class="bg-white border border-gray-200 rounded-[var(--radius-card)] shadow-[var(--shadow-s)] p-6">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm mb-4 bg-primary" aria-hidden="true">3</div>
        <h3 class="font-heading text-xl font-bold text-heading mb-2">Kunden gewinnen – zahle nur bei Einlösung</h3>
        <p class="text-body text-sm leading-relaxed">
          Neue Zielgruppe erreichen, Impact messen. Keine monatlichen Fixkosten –
          eine Provision fällt ausschließlich bei tatsächlich eingelösten
          Gutscheinen an.
        </p>

        <!-- Provision Toggle -->
        <button
          onclick={() => (provisionOpen = !provisionOpen)}
          class="mt-4 flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
          aria-expanded={provisionOpen}
          aria-controls="provision-details"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 transition-transform duration-200 {provisionOpen ? 'rotate-180' : ''}"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
          {provisionOpen ? 'Provisionsdetails ausblenden' : 'Provisionsdetails anzeigen'}
        </button>

        {#if provisionOpen}
          <div id="provision-details" class="mt-5 space-y-4">

            <!-- Punktewährung -->
            <div class="rounded-[var(--radius-card)] border-2 border-primary bg-primary-light p-4 text-center">
              <p class="text-xs text-body mb-0.5">Punktewährung</p>
              <p class="text-2xl font-bold text-primary mb-1">100 Punkte = 1 €</p>
              <p class="text-xs text-body leading-relaxed">
                Nutzer:innen verdienen Punkte durch Bewegung und Gesundheitsbildung
                und lösen diese als Gutschein bei dir ein.
              </p>
            </div>

            <!-- Provision Tabelle -->
            <div class="rounded-[var(--radius-card)] border border-gray-200 overflow-hidden shadow-[var(--shadow-s)]">
              <div class="grid grid-cols-2 bg-light-grey border-b border-gray-200">
                <div class="px-4 py-2.5 text-xs font-semibold text-body uppercase tracking-wide">Einlöse-Umsatz / Monat</div>
                <div class="px-4 py-2.5 text-xs font-semibold text-body uppercase tracking-wide">Provision</div>
              </div>
              <div class="grid grid-cols-2 border-b border-gray-200">
                <div class="px-4 py-3 text-sm text-body">bis 5.000 €</div>
                <div class="px-4 py-3 text-sm font-semibold text-heading">6 %</div>
              </div>
              <div class="grid grid-cols-2 border-b border-gray-200 bg-light-grey/50">
                <div class="px-4 py-3 text-sm text-body">5.000 € – 25.000 €</div>
                <div class="px-4 py-3 text-sm font-semibold text-heading">5 %</div>
              </div>
              <div class="grid grid-cols-2">
                <div class="px-4 py-3 text-sm text-body">ab 25.000 €</div>
                <div class="px-4 py-3 text-sm font-semibold text-heading">4 %</div>
              </div>
            </div>

            <!-- Rechenbeispiel -->
            <div class="rounded-[var(--radius-card)] border border-gray-200 p-4 shadow-[var(--shadow-s)] bg-light-grey">
              <p class="text-xs font-semibold text-body uppercase tracking-wide mb-3">Rechenbeispiel</p>
              <div class="space-y-2.5 text-sm">
                <div class="flex justify-between items-center">
                  <span class="text-body">Warenkorb</span>
                  <span class="font-medium text-heading">100,00 €</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-body">Rabatt (10 % Gutschein)</span>
                  <span class="font-medium text-heading">− 10,00 €</span>
                </div>
                <div class="border-t border-gray-200 pt-2.5 flex justify-between items-center">
                  <span class="text-body">Ersparnis für den User</span>
                  <span class="font-semibold text-heading">10,00 €</span>
                </div>
                <div class="rounded-xl p-3 flex justify-between items-center gap-3 bg-primary-light">
                  <span class="text-body text-xs">AustroFit-Provision<br /><span class="text-body/60">(6 % auf Ersparnis)</span></span>
                  <span class="font-bold whitespace-nowrap flex-shrink-0 text-primary">0,60 €</span>
                </div>
              </div>
              <p class="mt-3 text-xs text-body/60 leading-relaxed">
                Du gibst 10 € Rabatt und zahlst davon nur 0,60 € an AustroFit.
              </p>
            </div>

            <!-- Konditionen -->
            <div class="flex flex-col gap-1.5 text-xs text-body/60">
              <span class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                Abrechnung monatlich oder quartalsweise
              </span>
              <span class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                Zahlungsziel 14 Tage netto
              </span>
              <span class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                Keine Setupgebühr, keine Mindestlaufzeit
              </span>
            </div>

          </div>
        {/if}
      </article>

    </div>
  </div>
</section>

<!-- ── SECTION 3: Für wen ──────────────────────────────────── -->
<section
  aria-labelledby="fuerwen-heading"
  class="bg-white py-16 lg:py-24"
>
  <div class="max-w-[var(--max-width-standard)] mx-auto px-[var(--spacing-container-x)] lg:px-[var(--spacing-container-x-lg)]">
    <h2 id="fuerwen-heading" class="font-heading text-2xl lg:text-3xl font-bold text-heading text-center mb-4">
      Für welche Unternehmen?
    </h2>
    <p class="text-body text-center mb-12 max-w-xl mx-auto">
      AustroFit richtet sich an Anbieter, die echten Gesundheitsnutzen bieten.
    </p>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">

      <div class="rounded-[var(--radius-card)] bg-light-grey border border-gray-200 p-5 text-center shadow-[var(--shadow-s)]">
        <div class="text-3xl mb-3" aria-hidden="true">🏋️</div>
        <h3 class="font-semibold text-heading text-sm mb-1">Fitness & Sport</h3>
        <p class="text-xs text-body leading-relaxed">Fitnessstudios, Sportgeschäfte, Personal Trainer, Yogastudios</p>
      </div>

      <div class="rounded-[var(--radius-card)] bg-light-grey border border-gray-200 p-5 text-center shadow-[var(--shadow-s)]">
        <div class="text-3xl mb-3" aria-hidden="true">🧘</div>
        <h3 class="font-semibold text-heading text-sm mb-1">Wellness & Gesundheit</h3>
        <p class="text-xs text-body leading-relaxed">Thermen, Spas, Massagen, Physiotherapie, Freibäder</p>
      </div>

      <div class="rounded-[var(--radius-card)] bg-light-grey border border-gray-200 p-5 text-center shadow-[var(--shadow-s)]">
        <div class="text-3xl mb-3" aria-hidden="true">💊</div>
        <h3 class="font-semibold text-heading text-sm mb-1">Apotheken & Beratung</h3>
        <p class="text-xs text-body leading-relaxed">Apotheken, Ernährungsberatung, Psychologie, Coaching</p>
      </div>

      <div class="rounded-[var(--radius-card)] bg-light-grey border border-gray-200 p-5 text-center shadow-[var(--shadow-s)]">
        <div class="text-3xl mb-3" aria-hidden="true">🥦</div>
        <h3 class="font-semibold text-heading text-sm mb-1">Natürlich & Nachhaltig</h3>
        <p class="text-xs text-body leading-relaxed">Bio-Läden, Naturkosmetik, Nahrungsergänzung, Lieferdienste</p>
      </div>

    </div>

    <!-- Vorteile -->
    <h3 class="font-heading text-xl lg:text-2xl font-bold text-heading text-center mb-3">
      Deine Vorteile als AustroFit-Partner
    </h3>
    <p class="text-body text-center mb-10 max-w-xl mx-auto">
      Was du von der Zusammenarbeit hast – auf einen Blick.
    </p>

    <div class="grid sm:grid-cols-2 gap-6">

      <div class="rounded-[var(--radius-card)] border border-gray-200 p-6">
        <h4 class="font-semibold text-heading mb-2">Motivierte Zielgruppe</h4>
        <p class="text-sm text-body leading-relaxed">
          AustroFit-Nutzer:innen haben Punkte durch Bewegung und
          Gesundheitsbildung verdient – und lösen sie gezielt bei
          gesundheitsfördernden Unternehmen ein.
        </p>
      </div>

      <div class="rounded-[var(--radius-card)] border border-gray-200 p-6">
        <h4 class="font-semibold text-heading mb-2">Regionale Sichtbarkeit</h4>
        <p class="text-sm text-body leading-relaxed">
          Dein Unternehmen ist im Partner-Marketplace nach Kategorie und
          Region filterbar. Nutzer:innen suchen gezielt nach Angeboten in ihrer Nähe.
        </p>
      </div>

      <div class="rounded-[var(--radius-card)] border border-gray-200 p-6">
        <h4 class="font-semibold text-heading mb-2">ESG-Wirkung messbar</h4>
        <p class="text-sm text-body leading-relaxed">
          Transparente Reports über Einlösungen, Reichweite und
          Zielgruppen-Demografie – ideal für dein ESG-Reporting.
        </p>
      </div>

      <div class="rounded-[var(--radius-card)] border border-gray-200 p-6">
        <h4 class="font-semibold text-heading mb-2">First-Mover-Vorteil</h4>
        <p class="text-sm text-body leading-relaxed">
          AustroFit ist Österreichs erste Präventionsplattform dieser Art.
          Frühe Partner prägen das Bild der Plattform mit und profitieren
          von Sichtbarkeit, die spätere Einsteiger nicht mehr haben.
        </p>
      </div>

    </div>
  </div>
</section>

<!-- ── SECTION 4: Pakete + CTA ────────────────────────────── -->
<section
  aria-labelledby="pakete-heading"
  class="bg-beige py-16 lg:py-24"
>
  <div class="max-w-[var(--max-width-standard)] mx-auto px-[var(--spacing-container-x)] lg:px-[var(--spacing-container-x-lg)]">
    <h2 id="pakete-heading" class="font-heading text-2xl lg:text-3xl font-bold text-heading text-center mb-4">
      Wähle dein Paket
    </h2>
    <p class="text-body text-center mb-12 max-w-xl mx-auto">
      Starte kostenlos – und skaliere mit deinem Erfolg.
    </p>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">

      <!-- Basic -->
      <article class="bg-white border border-gray-200 rounded-[var(--radius-card)] p-5 lg:p-6 flex flex-col shadow-[var(--shadow-s)]">
        <h3 class="font-heading text-lg font-bold text-heading mb-1">Basic</h3>
        <p class="text-3xl font-bold text-primary mb-4">0 <span class="text-base font-normal text-body">€/Monat</span></p>
        <ul class="space-y-2 text-sm text-body flex-1" role="list">
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">✓</span> Gutschein-Einlösung</li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">✓</span> Dashboard-Zugang</li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">✓</span> Standard-Listung</li>
        </ul>
        <a
          href="mailto:kontakt@austrofit.at?subject=Partnerschaft%20AustroFit%20Basic"
          class="mt-6 block text-center border border-primary text-primary font-semibold px-4 py-2 rounded-[var(--radius-pill)] hover:bg-primary hover:text-white transition-colors text-sm"
        >
          Starten
        </a>
      </article>

      <!-- Plus -->
      <article class="bg-white border-2 border-primary rounded-[var(--radius-card)] p-5 lg:p-6 flex flex-col relative shadow-[var(--shadow-m)]">
        <span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
          Beliebteste Wahl
        </span>
        <h3 class="font-heading text-lg font-bold text-heading mb-1">Plus</h3>
        <p class="text-3xl font-bold text-primary mb-4">19 <span class="text-base font-normal text-body">€/Monat</span></p>
        <ul class="space-y-2 text-sm text-body flex-1" role="list">
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">✓</span> Alles aus Basic</li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">✓</span> Priorisierte Darstellung</li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">✓</span> Highlight-Badge</li>
        </ul>
        <a
          href="mailto:kontakt@austrofit.at?subject=Partnerschaft%20AustroFit%20Plus"
          class="mt-6 block text-center bg-primary text-white font-semibold px-4 py-2 rounded-[var(--radius-pill)] hover:bg-primary-dark transition-colors text-sm"
        >
          Jetzt starten
        </a>
      </article>

      <!-- Premium -->
      <article class="bg-white border border-gray-200 rounded-[var(--radius-card)] p-5 lg:p-6 flex flex-col shadow-[var(--shadow-s)]">
        <h3 class="font-heading text-lg font-bold text-heading mb-1">Premium</h3>
        <p class="text-3xl font-bold text-primary mb-4">39 <span class="text-base font-normal text-body">€/Monat</span></p>
        <ul class="space-y-2 text-sm text-body flex-1" role="list">
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">✓</span> Alles aus Plus</li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">✓</span> Events-Einbindung</li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">✓</span> Detaillierte Statistiken</li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">✓</span> Logo-Branding</li>
        </ul>
        <a
          href="mailto:kontakt@austrofit.at?subject=Partnerschaft%20AustroFit%20Premium"
          class="mt-6 block text-center border border-primary text-primary font-semibold px-4 py-2 rounded-[var(--radius-pill)] hover:bg-primary hover:text-white transition-colors text-sm"
        >
          Starten
        </a>
      </article>

      <!-- Nachhaltigkeit -->
      <article class="bg-white border border-austria rounded-[var(--radius-card)] p-5 lg:p-6 flex flex-col relative shadow-[var(--shadow-s)]">
        <span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-austria text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
          <span aria-hidden="true">🌿</span> ESG
        </span>
        <h3 class="font-heading text-lg font-bold text-heading mb-1">Nachhaltigkeit</h3>
        <p class="text-3xl font-bold text-austria mb-4">29 <span class="text-base font-normal text-body">€/Monat</span></p>
        <ul class="space-y-2 text-sm text-body flex-1" role="list">
          <li class="flex gap-2"><span class="text-austria" aria-hidden="true">✓</span> Alles aus Plus</li>
          <li class="flex gap-2"><span class="text-austria" aria-hidden="true">✓</span> ESG-Label & Zertifizierung</li>
          <li class="flex gap-2"><span class="text-austria" aria-hidden="true">✓</span> Filterplatzierung Nachhaltigkeit</li>
        </ul>
        <p class="text-xs text-body/70 mt-3 leading-relaxed">
          Ausschließlich für Unternehmen mit gültiger ESG-Zertifizierung verfügbar.
        </p>
        <a
          href="mailto:kontakt@austrofit.at?subject=Partnerschaft%20AustroFit%20Nachhaltigkeit"
          class="mt-4 block text-center border border-austria text-austria font-semibold px-4 py-2 rounded-[var(--radius-pill)] hover:bg-austria hover:text-white transition-colors text-sm"
        >
          Starten
        </a>
      </article>

    </div>

    <p class="text-center text-sm text-body mb-12">
      Listungsgebühr: 0 € für KMU · 0,15 € Mittelunternehmen · 0,25 € Großunternehmen
      <span class="text-gray-400">(pro Angebot / 90 Tage)</span>
    </p>

    <!-- ── Paket-Finder ─────────────────────────────── -->
    <div class="bg-white border border-gray-200 rounded-[var(--radius-card)] shadow-[var(--shadow-s)] p-6 lg:p-8 max-w-2xl mx-auto mb-12">

      {#if finderSchritt === 0}
        <h3 class="font-heading text-lg font-bold text-heading mb-2">
          Nicht sicher, welches Paket das richtige ist?
        </h3>
        <p class="text-sm text-body mb-5">
          Beantworte zwei kurze Fragen – wir empfehlen dir das passende Paket.
          Oder schreib uns direkt.
        </p>
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            onclick={() => (finderSchritt = 1)}
            class="flex-1 bg-primary text-white font-semibold px-5 py-3 rounded-[var(--radius-pill)] hover:bg-primary-dark transition-colors text-sm text-center"
          >
            Paket-Empfehlung starten
          </button>
          <a
            href="mailto:kontakt@austrofit.at?subject=Pakete%20besprechen%20%E2%80%93%20AustroFit"
            class="flex-1 border border-primary text-primary font-semibold px-5 py-3 rounded-[var(--radius-pill)] hover:bg-primary hover:text-white transition-colors text-sm text-center"
          >
            Direkt anfragen
          </a>
        </div>

      {:else if finderSchritt === 1}
        <p class="text-xs font-semibold text-body/60 uppercase tracking-wide mb-3">Frage 1 von 2</p>
        <h3 class="font-heading text-lg font-bold text-heading mb-5">
          Ist dein Unternehmen ESG-zertifiziert?
        </h3>
        <div class="flex gap-3">
          <button
            onclick={() => antwortEsg(true)}
            class="flex-1 border-2 border-gray-200 hover:border-primary text-heading font-semibold px-5 py-3 rounded-[var(--radius-pill)] transition-colors text-sm"
          >
            Ja
          </button>
          <button
            onclick={() => antwortEsg(false)}
            class="flex-1 border-2 border-gray-200 hover:border-primary text-heading font-semibold px-5 py-3 rounded-[var(--radius-pill)] transition-colors text-sm"
          >
            Nein
          </button>
        </div>
        <button onclick={resetFinder} class="mt-4 text-xs text-body/60 hover:text-body transition-colors">
          ← Zurück
        </button>

      {:else if finderSchritt === 2}
        <p class="text-xs font-semibold text-body/60 uppercase tracking-wide mb-3">Frage 2 von 2</p>
        <h3 class="font-heading text-lg font-bold text-heading mb-5">
          Was ist dir am wichtigsten?
        </h3>
        <div class="flex flex-col gap-2.5">
          <button
            onclick={() => antwortPrioritaet('basic')}
            class="text-left border-2 border-gray-200 hover:border-primary rounded-[var(--radius-card)] px-4 py-3 transition-colors"
          >
            <span class="font-semibold text-heading text-sm">Erst kostenlos testen</span>
            <p class="text-xs text-body mt-0.5">Ich möchte unverbindlich starten und schauen, wie es läuft.</p>
          </button>
          <button
            onclick={() => antwortPrioritaet('plus')}
            class="text-left border-2 border-gray-200 hover:border-primary rounded-[var(--radius-card)] px-4 py-3 transition-colors"
          >
            <span class="font-semibold text-heading text-sm">Mehr Sichtbarkeit</span>
            <p class="text-xs text-body mt-0.5">Ich möchte priorisiert dargestellt werden und ein Highlight-Badge.</p>
          </button>
          <button
            onclick={() => antwortPrioritaet('premium')}
            class="text-left border-2 border-gray-200 hover:border-primary rounded-[var(--radius-card)] px-4 py-3 transition-colors"
          >
            <span class="font-semibold text-heading text-sm">Volle Ausstattung</span>
            <p class="text-xs text-body mt-0.5">Events, detaillierte Statistiken und Logo-Branding sind mir wichtig.</p>
          </button>
        </div>
        <button onclick={resetFinder} class="mt-4 text-xs text-body/60 hover:text-body transition-colors">
          ← Zurück
        </button>

      {:else if finderSchritt === 3 && finderEmpfehlung}
        <p class="text-xs font-semibold text-body/60 uppercase tracking-wide mb-3">Empfehlung</p>
        <h3 class="font-heading text-lg font-bold text-heading mb-1">
          Paket {paketDetails[finderEmpfehlung].name} passt zu dir
        </h3>
        <p class="text-2xl font-bold text-primary mb-3">{paketDetails[finderEmpfehlung].preis}</p>
        <p class="text-sm text-body mb-5">{paketDetails[finderEmpfehlung].beschreibung}</p>
        <div class="flex flex-col sm:flex-row gap-3">
          <a
            href="mailto:kontakt@austrofit.at?subject={paketDetails[finderEmpfehlung].subject}"
            class="flex-1 bg-primary text-white font-semibold px-5 py-3 rounded-[var(--radius-pill)] hover:bg-primary-dark transition-colors text-sm text-center"
          >
            Jetzt {paketDetails[finderEmpfehlung].name} anfragen
          </a>
          <button
            onclick={resetFinder}
            class="flex-1 border border-gray-300 text-body font-semibold px-5 py-3 rounded-[var(--radius-pill)] hover:border-primary hover:text-primary transition-colors text-sm"
          >
            Nochmals ausfüllen
          </button>
        </div>
      {/if}

    </div>

    <!-- ── CTA (merged from Section 7) ──────────────── -->
    <div class="bg-darkblue text-white rounded-[var(--radius-card)] p-8 lg:p-12 text-center">
      <h2 class="font-heading text-2xl lg:text-4xl font-bold mb-4">
        Bereit? Werde AustroFit-Partner.
      </h2>
      <p class="text-gray-300 mb-8 max-w-md mx-auto">
        AustroFit wächst – jetzt ist der ideale Zeitpunkt für einen
        First-Mover-Vorteil. Schreib uns, wir melden uns persönlich bei dir.
      </p>

      <a
        href="mailto:kontakt@austrofit.at?subject=Partnerschaft%20AustroFit"
        class="inline-flex items-center gap-2 bg-primary text-white font-semibold px-10 py-4 rounded-[var(--radius-pill)] hover:bg-primary-dark transition-colors mb-6 text-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
        </svg>
        kontakt@austrofit.at
      </a>

      <p class="text-sm text-gray-400">
        <span aria-hidden="true">🔒</span> DSGVO-konform · Österreichisches Unternehmen · Österreichweit
      </p>
    </div>

  </div>
</section>
