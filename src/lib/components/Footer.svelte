<!-- src/lib/components/Footer.svelte -->
<script>
  import { getFooterClasses } from "$lib/design-system/classes";

  const styles = getFooterClasses();

  const legalLinks = [
    { label: 'Datenschutz', href: '/datenschutz' },
    { label: 'Impressum', href: '/impressum' },
  ];
</script>

<footer class={styles.section}>
  <div class={styles.container}>

    <!-- 2-column grid -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">

      <!-- Column 1: Description + Austria Stamp -->
      <div class="md:col-span-7">
        <div class="flex items-center gap-5 bg-card-bg rounded-2xl px-5 py-4">
          <!-- Austria Stamp -->
          <div class="shrink-0 opacity-90" style="transform: rotate(-8deg);" aria-hidden="true">
            <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <path id="stampCircle" d="M40,6 A34,34,0,1,1,39.99,6"/>
                <clipPath id="heartClip">
                  <path d="M40,57 C40,57 18,44 18,30 C18,21 25,16 32,19 C35,20 37,24 40,27 C43,24 45,20 48,19 C55,16 62,21 62,30 C62,44 40,57 40,57Z"/>
                </clipPath>
              </defs>
              <!-- Outer dashed ring -->
              <circle cx="40" cy="40" r="36" fill="none" stroke="#3D5A3E" stroke-width="2" stroke-dasharray="4,2"/>
              <!-- Inner ring -->
              <circle cx="40" cy="40" r="28" fill="none" stroke="#3D5A3E" stroke-width="0.8"/>
              <!-- Circular text -->
              <text font-size="6.5" fill="#3D5A3E" font-weight="bold" font-family="sans-serif" letter-spacing="2">
                <textPath href="#stampCircle" startOffset="3%">· 100% ÖSTERREICH · REGIONAL</textPath>
              </text>
              <!-- Austrian flag stripes in heart shape -->
              <g clip-path="url(#heartClip)">
                <rect x="18" y="16" width="44" height="13" fill="#CC0000"/>
                <rect x="18" y="29" width="44" height="13" fill="white"/>
                <rect x="18" y="42" width="44" height="13" fill="#CC0000"/>
              </g>
              <!-- Heart outline -->
              <path d="M40,57 C40,57 18,44 18,30 C18,21 25,16 32,19 C35,20 37,24 40,27 C43,24 45,20 48,19 C55,16 62,21 62,30 C62,44 40,57 40,57Z"
                    fill="none" stroke="#3D5A3E" stroke-width="1.5"/>
            </svg>
          </div>
          <p class="text-base leading-relaxed text-body">
            Bewegen, Lernen, Vorbeugen und echte regionale Prämien.
          </p>
        </div>
      </div>

      <!-- Column 2: Contact -->
      <div class="md:col-span-5">
        <div class={styles.columnContent}>
          <div class={styles.contactSection}>
            <p class={styles.contactTitle}>
              Fragen, Feedback oder<br />
              Partneranfragen?
            </p>
            <a href="mailto:kontakt@austrofit.at" class={styles.contactLink}>
              kontakt@austrofit.at
            </a>
          </div>
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

    <!-- Legal Links Strip -->
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
