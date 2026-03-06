<!-- src/lib/components/Footer.svelte -->
<script>
  import { getFooterClasses, getButtonClasses } from "$lib/design-system/classes";
  
  const styles = getFooterClasses();
  
  const buttonStyle = getButtonClasses('green', 'sm');
  // TODO: This will be fetched from CMS later
  const footerNav = [
    { label: 'Über uns', href: '/ueber-uns' },
    { label: 'Gesundheitswegweiser', href: '/gesundheitswegweiser' },
    { label: 'Partner werden', href: '/partner-werden' },
  ];
  
  const legalLinks = [
    { label: 'Datenschutz', href: '/datenschutz' },
    { label: 'Impressum', href: '/impressum' },
  ];
</script>

<footer class={styles.section}>
  <!-- Decorative triangle -->
  <div class={styles.decorativeTriangle}></div>
  
  <div class={styles.container}>
    <!-- Main 3-column grid -->
    <div class={styles.grid}>
      
      <!-- Column 1: Description + Spenden Button (5 columns) -->
      <div class="{styles.column1}">
        <div class={styles.columnContent}>
          <p class={styles.description}>
            AustroFit belohnt dich fürs Bewegen, Lernen und Vorbeugen – mit echten Prämien bei regionalen Partnern. Kostenlos, motivierend, 100&nbsp;% österreichisch.
          </p>
        </div>
      </div>

      <!-- Column 2: Navigation Links (3 columns) -->
      <nav class="{styles.column2}">
        <div class={styles.nav}>
          {#each footerNav as link}
            <a href={link.href} class={styles.navLink}>
              {link.label}
            </a>
          {/each}
        </div>
      </nav>

      <!-- Column 3: Contact + Newsletter (4 columns) -->
      <div class="{styles.column3}">
        <div class={styles.columnContent}>
          <!-- Contact -->
          <div class={styles.contactSection}>
            <p class={styles.contactTitle}>
              Fragen, Feedback oder<br />
              Partneranfragen?
            </p>
            <a 
              href="mailto:kontakt@austrofit.at" 
              class={styles.contactLink}
            >
              kontakt@austrofit.at
            </a>
          </div>

          <!-- Newsletter -->
          <div class={styles.contactSection}>
            <p class={styles.contactTitle}>
              Bleib auf dem Laufenden
            </p>
            <a href="mailto:kontakt@austrofit.at?subject=Newsletter" class={styles.contactLink}>
              Melde dich zum Newsletter an.
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Legal Links Strip (Horizontal) -->
    <div class={styles.legalNavStrip}>
      <nav class={styles.legalNav}>
        {#each legalLinks as link}
          <a href={link.href} class={styles.legalLink}>
            {link.label}
          </a>
        {/each}
      </nav>
    </div>

    <!-- Copyright Strip -->
    <div class={styles.copyrightStrip}>
      <p class={styles.copyright}>
        © 2026 AustroFit
      </p>
    </div>

  </div>
</footer>