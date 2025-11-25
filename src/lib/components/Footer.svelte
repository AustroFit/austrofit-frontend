<!-- src/lib/components/Footer.svelte -->
<script>
  import { getFooterClasses, getButtonClasses } from "$lib/design-system/classes";
  
  const styles = getFooterClasses();
  
  const buttonStyle = getButtonClasses('green', 'sm');
  // TODO: This will be fetched from CMS later
  const footerNav = [
    { label: 'Vision', href: '/vision' },
    { label: 'Mitmachen', href: '/mitmachen' },
    { label: 'Projekte', href: '/projekte' },
    { label: 'Über Uns', href: '/ueber-uns' },
    { label: 'Presse', href: '/presse' }
  ];
  
  const legalLinks = [
    { label: 'Datenschutz', href: '/datenschutz' },
    { label: 'Impressum', href: '/impressum' },
    { label: 'FAQ – Zukunftsallianz', href: '/faq' }
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
            Die Zukunftsallianz arbeitet an den Zielen vom Klimavolksbegehren – 
            gemeinsam Brücken bauen für die Klimaneutralität 2040, für eine mutige 
            und soziale Klimapolitik und für eine lebenswerte Zukunft für alle.
          </p>
          <a href="/spenden" class={buttonStyle}>
            Spenden
          </a>
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
              Schreib uns gerne bei<br />
              Fragen und Anregungen:
            </p>
            <a 
              href="mailto:kontakt@klimavolksbegehren.at" 
              class={styles.contactLink}
            >
              kontakt@klimavolksbegehren.at
            </a>
          </div>

          <!-- Newsletter -->
          <div class={styles.contactSection}>
            <p class={styles.contactTitle}>
              Bleib auf dem Laufenden
            </p>
            <a href="/newsletter" class={styles.contactLink}>
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
        © 2025 Verein Klimavolksbegehren
      </p>
    </div>

  </div>
</footer>