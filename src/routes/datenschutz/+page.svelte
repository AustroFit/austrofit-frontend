<svelte:head><title>Datenschutzerklärung – AustroFit</title></svelte:head>

<main class="min-h-[calc(100vh-75px)] bg-gray-50 py-12 px-4">
  <div class="mx-auto max-w-2xl">

    <h1 class="mb-2 text-3xl font-bold text-gray-900" style="font-family:'Syne',sans-serif;">
      Datenschutzerklärung
    </h1>
    <p class="mb-8 text-sm text-gray-400">Stand: März 2026 · gemäß DSGVO</p>

    <!-- 1. Verantwortlicher -->
    <section class="mb-6 rounded-2xl bg-white p-6 shadow-sm border border-black/10">
      <h2 class="mb-4 text-lg font-semibold text-gray-900">1. Verantwortlicher</h2>
      <p class="text-sm text-gray-600 leading-relaxed">
        Verantwortlicher im Sinne der DSGVO für die Verarbeitung personenbezogener Daten auf
        dieser Plattform ist:
      </p>
      <address class="mt-3 not-italic text-sm text-gray-700">
        AustroFit<br />
        [PLATZHALTER: Vor- und Nachname]<br />
        [PLATZHALTER: Straße Hausnummer]<br />
        [PLATZHALTER: PLZ Ort], Österreich<br />
        E-Mail: <a href="mailto:kontakt@austrofit.at" class="underline">kontakt@austrofit.at</a>
      </address>
    </section>

    <!-- 2. Welche Daten -->
    <section class="mb-6 rounded-2xl bg-white p-6 shadow-sm border border-black/10">
      <h2 class="mb-4 text-lg font-semibold text-gray-900">2. Verarbeitete Daten</h2>
      <div class="space-y-4 text-sm text-gray-600 leading-relaxed">
        <div>
          <p class="font-medium text-gray-800">Kontodaten</p>
          <p>Bei der Registrierung erheben wir Benutzername, E-Mail-Adresse und ein Passwort
          (gespeichert als Hash). Diese Daten sind zur Vertragserfüllung erforderlich (Art. 6 Abs. 1 lit. b DSGVO).</p>
        </div>
        <div>
          <p class="font-medium text-gray-800">Gesundheits- und Aktivitätsdaten</p>
          <p>Mit deiner ausdrücklichen Einwilligung (Art. 6 Abs. 1 lit. a i.V.m. Art. 9 Abs. 2 lit. a DSGVO)
          erheben wir Schritt- und Bewegungsdaten. Diese werden <strong>pseudonymisiert</strong> gespeichert
          und nicht an Dritte weitergegeben. Du kannst die Einwilligung jederzeit widerrufen und
          dein Konto in den Profileinstellungen vollständig löschen.</p>
        </div>
        <div>
          <p class="font-medium text-gray-800">Punkte-Ledger und Gutscheine</p>
          <p>Zur Erbringung unseres Dienstleistungsangebots (Punkte sammeln, Gutscheine einlösen)
          speichern wir Buchungseinträge und ausgestellte Gutscheincodes (Art. 6 Abs. 1 lit. b DSGVO).</p>
        </div>
      </div>
    </section>

    <!-- 3. Analytics -->
    <section class="mb-6 rounded-2xl bg-white p-6 shadow-sm border border-black/10">
      <h2 class="mb-4 text-lg font-semibold text-gray-900">3. Web-Analytics (PostHog)</h2>
      <p class="text-sm text-gray-600 leading-relaxed mb-3">
        Wir verwenden PostHog EU zur Analyse der Plattformnutzung. Rechtsgrundlage ist unser
        berechtigtes Interesse an der Verbesserung unseres Angebots (Art. 6 Abs. 1 lit. f DSGVO).
      </p>
      <ul class="text-sm text-gray-600 space-y-1.5 list-none">
        <li>→ <strong>Anbieter:</strong> PostHog Inc., 965 Mission St, Suite 100, San Francisco – Datenverarbeitung ausschließlich auf EU-Servern (Frankfurt, Deutschland)</li>
        <li>→ <strong>Keine Cookies:</strong> Die Analyse erfolgt ohne Browser-Cookies, ausschließlich über eine anonyme ID im lokalen Speicher (localStorage).</li>
        <li>→ <strong>IP-Anonymisierung:</strong> IP-Adressen werden vor der Speicherung anonymisiert.</li>
        <li>→ <strong>Gespeicherte Events:</strong> Registrierung, Quiz-Abschluss, Health-Permission-Entscheidung, Gutschein-Einlösung – keine Inhalte, keine personenbezogenen Texteingaben.</li>
        <li>→ <strong>Widerspruch:</strong> Du kannst die Speicherung der anonymen Analytics-ID durch Löschen des localStorage-Eintrags <code class="bg-gray-100 px-1 rounded text-xs">austrofit_analytics_id</code> verhindern.</li>
      </ul>
    </section>

    <!-- 4. Hosting -->
    <section class="mb-6 rounded-2xl bg-white p-6 shadow-sm border border-black/10">
      <h2 class="mb-4 text-lg font-semibold text-gray-900">4. Hosting & Infrastruktur</h2>
      <p class="text-sm text-gray-600 leading-relaxed">
        Das Content-Management-System (Directus) und die Datenbank (PostgreSQL) sind auf einem
        Server in der EU (Hetzner, Deutschland) selbst gehostet. Es erfolgt keine Übertragung
        personenbezogener Daten in Drittländer außerhalb der EU/EWR, mit Ausnahme der unter
        Punkt 3 beschriebenen Analytics-Verarbeitung innerhalb der EU.
      </p>
    </section>

    <!-- 5. Aufbewahrung -->
    <section class="mb-6 rounded-2xl bg-white p-6 shadow-sm border border-black/10">
      <h2 class="mb-4 text-lg font-semibold text-gray-900">5. Speicherdauer</h2>
      <p class="text-sm text-gray-600 leading-relaxed">
        Kontodaten und Aktivitätsdaten werden gespeichert, solange ein aktives Konto besteht.
        Nach Löschung des Kontos (möglich unter Profil → Einstellungen → Konto löschen) werden
        alle personenbezogenen Daten und Buchungseinträge unverzüglich gelöscht.
        Gesetzliche Aufbewahrungspflichten (z.B. steuerrechtlich) bleiben unberührt.
      </p>
    </section>

    <!-- 6. Betroffenenrechte -->
    <section class="mb-6 rounded-2xl bg-white p-6 shadow-sm border border-black/10">
      <h2 class="mb-4 text-lg font-semibold text-gray-900">6. Deine Rechte</h2>
      <p class="mb-3 text-sm text-gray-600 leading-relaxed">
        Gemäß DSGVO hast du folgende Rechte gegenüber dem Verantwortlichen:
      </p>
      <ul class="text-sm text-gray-600 space-y-1.5 list-none">
        <li>→ <strong>Auskunft</strong> (Art. 15 DSGVO) – Welche Daten speichern wir über dich?</li>
        <li>→ <strong>Berichtigung</strong> (Art. 16 DSGVO) – Korrektur unrichtiger Daten</li>
        <li>→ <strong>Löschung</strong> (Art. 17 DSGVO) – „Recht auf Vergessenwerden"; direkt in der App unter <a href="/profil" class="underline">Profil → Konto löschen</a> möglich</li>
        <li>→ <strong>Einschränkung</strong> (Art. 18 DSGVO) – Eingeschränkte Verarbeitung</li>
        <li>→ <strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO) – Export deiner Daten</li>
        <li>→ <strong>Widerspruch</strong> (Art. 21 DSGVO) – gegen berechtigte Interessen (z.B. Analytics)</li>
        <li>→ <strong>Widerruf</strong> der Einwilligung zur Gesundheitsdatenverarbeitung jederzeit möglich</li>
      </ul>
      <p class="mt-4 text-sm text-gray-600">
        Zur Ausübung deiner Rechte wende dich an:
        <a href="mailto:kontakt@austrofit.at" class="underline">kontakt@austrofit.at</a>
      </p>
      <p class="mt-3 text-sm text-gray-600">
        Du hast außerdem das Recht, Beschwerde bei der österreichischen Datenschutzbehörde
        einzulegen: <a href="https://www.dsb.gv.at" target="_blank" rel="noopener noreferrer" class="underline">www.dsb.gv.at</a>
      </p>
    </section>

    <p class="text-xs text-gray-400 text-center">Stand: März 2026</p>

  </div>
</main>
