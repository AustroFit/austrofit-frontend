<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getAccessToken } from '$lib/utils/auth';

  onMount(() => {
    if (getAccessToken()) {
      goto('/dashboard');
    }
  });
</script>

<svelte:head>
  <title>AustroFit – Gesund leben. Belohnt werden.</title>
  <meta name="description" content="Sammle Punkte für Bewegung & Gesundheitswissen und löse sie bei regionalen Partnern in Österreich ein. Kostenlos starten." />
</svelte:head>

<a href="#main-content" class="skip-link">Zum Inhalt springen</a>

<main id="main-content">

<!-- ── SECTION 1: Hero ──────────────────────────────────────── -->
<section
  aria-label="AustroFit – Hauptbereich"
  class="bg-darkblue text-white min-h-[90vh] lg:min-h-screen flex items-center"
>
  <div class="w-full max-w-[var(--max-width-standard)] mx-auto px-[var(--spacing-container-x)] lg:px-[var(--spacing-container-x-lg)] py-16 lg:py-24">
    <div class="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

      <!-- Text -->
      <div class="flex-1 text-center lg:text-left">
        <h1 class="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
          Prävention, die doppelt belohnt –<br />heute und in der Zukunft
        </h1>
        <p class="text-lg text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
          Deine Gesundheit ist unbezahlbar. 
          AustroFit unterstützt dich dabei, langfristig fit und gesund zu bleiben, ohne auf Spaß und Belohnungen zu verzichten. 
          So wird Prävention zur lohnenswerten Investition in deine Zukunft.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <a
            href="/registrierung"
            class="inline-block bg-primary text-white font-semibold px-8 py-4 rounded-[var(--radius-pill)] hover:bg-primary-dark transition-colors text-center"
          >
            Jetzt kostenlos starten
          </a>
        </div>

        <!--
        <p class="mt-4 text-sm text-gray-400" aria-label="Kostenlos, keine Kreditkarte erforderlich">
          <span aria-hidden="true">🇦🇹</span> Kostenlos · Keine Kreditkarte
        </p>
        -->
      </div>

      <!-- Hero-Bild -->
      <div class="flex-1 w-full max-w-lg lg:max-w-none">
        <div class="aspect-[4/3] rounded-[var(--radius-card)] overflow-hidden bg-dark-green">
          <img
            src="/images/hero-alpen.webp"
            alt="Person beim Wandern in der österreichischen Alpenlandschaft"
            width="1200"
            height="900"
            class="w-full h-full object-cover"
          />
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ── SECTION 2: Du bewegst dich + In 3 Schritten ────────── -->
<section
  id="wie-es-funktioniert"
  aria-labelledby="wie-heading"
  class="bg-light-grey py-16 lg:py-24"
>
  <div class="max-w-[var(--max-width-standard)] mx-auto px-[var(--spacing-container-x)] lg:px-[var(--spacing-container-x-lg)]">

    <!-- Intro -->
    <div class="max-w-2xl mx-auto text-center lg:text-left lg:mx-0 mb-12">
      <p class="text-body text-lg mb-4">
        Gehst du bereits regelmäßig spazieren, Gassi oder informierst du dich über Bewegung und Ernährung?
      </p>
      <h2 id="wie-heading" class="font-heading text-2xl lg:text-3xl font-bold text-heading mb-6">
        Perfekt. Dann lasse dich für dein gesundes Verhalten belohnen – in 3 Schritten:
      </h2>
    </div>

    <!-- 3-Schritt Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

      <article class="bg-white border border-gray-200 rounded-[var(--radius-card)] shadow-[var(--shadow-s)] p-6">
        <p class="text-primary font-semibold text-sm mb-2 text-center">Schritt 1</p>
        <div class="text-5xl mb-4 text-center" aria-hidden="true">🚶</div>
        <h3 class="font-heading text-xl font-bold text-heading mb-2 text-center">Bewege dich</h3>
        <p class="text-body text-sm leading-relaxed text-center">
          Schritte zählen und Bewegung tracken automatisch via Smartphone.
        </p>
      </article>

      <article class="bg-white border border-gray-200 rounded-[var(--radius-card)] shadow-[var(--shadow-s)] p-6">
        <p class="text-primary font-semibold text-sm mb-2 text-center">Schritt 2</p>
        <div class="text-5xl mb-4 text-center" aria-hidden="true">📖</div>
        <h3 class="font-heading text-xl font-bold text-heading mb-2 text-center">Lerne</h3>
        <p class="text-body text-sm leading-relaxed text-center">
          Artikel lesen & Quizze lösen – jedes Wissen gibt Punkte.
        </p>
      </article>

      <article class="bg-white border border-gray-200 rounded-[var(--radius-card)] shadow-[var(--shadow-s)] p-6">
        <p class="text-primary font-semibold text-sm mb-2 text-center">Schritt 3</p>
        <div class="text-5xl mb-4 text-center" aria-hidden="true">🎁</div>
        <h3 class="font-heading text-xl font-bold text-heading mb-2 text-center">Einlösen</h3>
        <p class="text-body text-sm leading-relaxed text-center">
          Tausche Punkte gegen Rabatte bei österreichischen Partnern.
        </p>
      </article>

    </div>

    <!-- CTA -->
    <div class="text-center">
      <a
        href="/registrierung"
        class="inline-block bg-primary text-white font-semibold px-8 py-4 rounded-[var(--radius-pill)] hover:bg-primary-dark transition-colors"
      >
        Jetzt kostenlos starten
      </a>
    </div>

  </div>
</section>

<!-- ── SECTION 3: Punkte-Vorschau ──────────────────────────── -->
<!--section
  aria-labelledby="punkte-heading"
  class="bg-beige py-16 lg:py-24"
>
  <div class="max-w-[var(--max-width-standard)] mx-auto px-[var(--spacing-container-x)] lg:px-[var(--spacing-container-x-lg)]">
    <h2 id="punkte-heading" class="font-heading text-2xl lg:text-3xl font-bold text-heading text-center mb-3">
      Jeder Schritt zählt
    </h2>
    <p class="text-body text-center mb-12 max-w-xl mx-auto">
      Durchschnittlich 120 Punkte pro Woche – schon nach 2 Wochen erste Belohnung
    </p>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">

      <div class="bg-white rounded-[var(--radius-card)] p-6 text-center shadow-[var(--shadow-s)]">
        <p class="font-heading text-4xl font-bold text-primary mb-1">7.000</p>
        <p class="text-body text-sm">Schritte / Tag ø</p>
      </div>

      <div class="bg-white rounded-[var(--radius-card)] p-6 text-center shadow-[var(--shadow-s)]">
        <p class="font-heading text-4xl font-bold text-primary mb-1">50 Pt</p>
        <p class="text-body text-sm">Pro Quiz</p>
      </div>

      <div class="bg-white rounded-[var(--radius-card)] p-6 text-center shadow-[var(--shadow-s)]">
        <p class="font-heading text-4xl font-bold text-primary mb-1">200+</p>
        <p class="text-body text-sm">Partner in Österreich</p>
      </div>

    </div>

    <h3 class="font-heading text-xl font-semibold text-heading text-center mb-6">
      Das sagen unsere Nutzer:innen
    </h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">

      <figure class="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-s)]">
        <div class="flex items-center gap-3 mb-4">
          <div
            class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm"
            aria-hidden="true"
          >T</div>
          <figcaption class="font-semibold text-heading">Thomas K., Wien</figcaption>
        </div>
        <blockquote class="text-body text-sm leading-relaxed">
          "Endlich eine App, die mich wirklich motiviert – und dazu noch echte Vorteile bringt!"
        </blockquote>
      </figure>

      <figure class="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-s)]">
        <div class="flex items-center gap-3 mb-4">
          <div
            class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm"
            aria-hidden="true"
          >A</div>
          <figcaption class="font-semibold text-heading">Anna M., Graz</figcaption>
        </div>
        <blockquote class="text-body text-sm leading-relaxed">
          "In 10 Minuten angemeldet, ersten Gutschein nach 2 Wochen. Absolut empfehlenswert."
        </blockquote>
      </figure>

    </div>
  </div>
</section>

<!-- ── SECTION 4: Features ──────────────────────────────────── -->
<section
  aria-labelledby="features-heading"
  class="bg-white py-16 lg:py-24"
>
  <div class="max-w-[var(--max-width-standard)] mx-auto px-[var(--spacing-container-x)] lg:px-[var(--spacing-container-x-lg)]">
    <h2 id="features-heading" class="font-heading text-2xl lg:text-3xl font-bold text-heading text-center mb-12">
      Das bietet dir die AustroFit-App
    </h2>

    <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10" role="list">

      <li class="flex gap-4">
        <span class="text-2xl shrink-0" aria-hidden="true">👟</span>
        <div>
          <h3 class="font-semibold text-heading mb-1">Bewegungstracking</h3>
          <p class="text-body text-sm">Schritte, Aktivitäten & Health-Daten automatisch erfassen.</p>
        </div>
      </li>

      <li class="flex gap-4">
        <span class="text-2xl shrink-0" aria-hidden="true">🧠</span>
        <div>
          <h3 class="font-semibold text-heading mb-1">Gesundheitsbildung</h3>
          <p class="text-body text-sm">Kuratierte Artikel & interaktive Quizze zu Ernährung, Bewegung & Vorsorge.</p>
        </div>
      </li>

      <li class="flex gap-4">
        <span class="text-2xl shrink-0" aria-hidden="true">🏪</span>
        <div>
          <h3 class="font-semibold text-heading mb-1">Regionale Rewards</h3>
          <p class="text-body text-sm">Gutscheine bei Apotheken, Fitnessstudios & Naturkostläden in deiner Nähe.</p>
        </div>
      </li>

      <li class="flex gap-4">
        <span class="text-2xl shrink-0" aria-hidden="true">🏆</span>
        <div>
          <h3 class="font-semibold text-heading mb-1">Mit Spaß zum Ziel</h3>
          <p class="text-body text-sm">Streaks, Badges, Level und Challenges – bleib motiviert und wachse mit jedem Schritt.</p>
        </div>
      </li>

      <li class="flex gap-4">
        <span class="text-2xl shrink-0" aria-hidden="true">🤝</span>
        <div>
          <h3 class="font-semibold text-heading mb-1">Community</h3>
          <p class="text-body text-sm">Gemeinsam gesünder werden – mit regionalen Partner-Events & Challenges.</p>
        </div>
      </li>

      <li class="flex gap-4">
        <span class="text-2xl shrink-0" aria-hidden="true">🔒</span>
        <div>
          <h3 class="font-semibold text-heading mb-1">Datenschutz (DSGVO)</h3>
          <p class="text-body text-sm">Österreichisches Unternehmen, DSGVO-konform, deine Daten bleiben deine Daten.</p>
        </div>
      </li>

    </ul>
  </div>
</section>

<!-- ── SECTION 5: App-Download CTA ─────────────────────────── -->
<section
  aria-labelledby="download-heading"
  class="bg-darkblue text-white py-16 lg:py-24"
>
  <div class="max-w-[var(--max-width-standard)] mx-auto px-[var(--spacing-container-x)] lg:px-[var(--spacing-container-x-lg)]">
    <div class="flex flex-col lg:flex-row items-center gap-12 text-center lg:text-left">

      <div class="flex-1">
        <h2 id="download-heading" class="font-heading text-2xl lg:text-4xl font-bold mb-4">
          Starte heute – kostenlos
        </h2>
        <p class="text-gray-300 mb-8 max-w-md mx-auto lg:mx-0">
          Verfügbar als Web-App, bald auch im App Store.
        </p>
        <a
          href="/registrierung"
          class="inline-block bg-primary text-white font-semibold px-8 py-4 rounded-[var(--radius-pill)] hover:bg-primary-dark transition-colors"
        >
          Jetzt starten
        </a>
      </div>

      <!--div class="shrink-0">
        <div class="aspect-[9/16] max-w-[200px] rounded-[var(--radius-card)] overflow-hidden bg-dark-green mx-auto">
          <img
            src="/images/app-mockup.webp"
            alt="AustroFit App auf einem Smartphone"
            width="200"
            height="356"
            class="w-full h-full object-cover"
          />
        </div>
      </div-->

    </div>
  </div>
</section>

<!-- ── SECTION 6: FAQ ───────────────────────────────────────── -->
<!--section
  aria-labelledby="faq-heading"
  class="bg-light-grey py-16 lg:py-24"
>
  <div class="max-w-[var(--max-width-narrow)] mx-auto px-[var(--spacing-container-x)] lg:px-[var(--spacing-container-x-lg)]">
    <h2 id="faq-heading" class="font-heading text-2xl lg:text-3xl font-bold text-heading text-center mb-10">
      Häufige Fragen
    </h2>

    <div class="space-y-4">

      <details class="bg-white rounded-[var(--radius-card)] border border-gray-200 shadow-[var(--shadow-s)]">
        <summary class="cursor-pointer list-none flex items-center justify-between p-6 font-semibold text-heading">
          Ist AustroFit wirklich kostenlos?
          <span class="text-primary text-lg" aria-hidden="true">▶</span>
        </summary>
        <div class="px-6 pb-6 text-body text-sm leading-relaxed">
          Ja, AustroFit ist vollständig kostenlos für Nutzer:innen. Du kannst Punkte sammeln
          und Gutscheine einlösen – ohne Abo, ohne versteckte Kosten und ohne Kreditkarte.
        </div>
      </details>

      <details class="bg-white rounded-[var(--radius-card)] border border-gray-200 shadow-[var(--shadow-s)]">
        <summary class="cursor-pointer list-none flex items-center justify-between p-6 font-semibold text-heading">
          Welche Wearables werden unterstützt?
          <span class="text-primary text-lg" aria-hidden="true">▶</span>
        </summary>
        <div class="px-6 pb-6 text-body text-sm leading-relaxed">
          AustroFit unterstützt Android-Geräte via Google Health Connect sowie iOS via Apple HealthKit.
          Alle gängigen Wearables (Garmin, Fitbit, Apple Watch, Polar u.v.m.) sind kompatibel,
          sofern sie Daten in die jeweilige Health-App übertragen.
        </div>
      </details>

    </div>
  </div>
</section-->

</main>
