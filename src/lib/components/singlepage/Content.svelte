<script>
  import { getSinglePageClasses } from "$lib/design-system/classes";
  import { onMount } from 'svelte';

  const { item, collection, config} = $props();

  const imageUrl = $derived(item.image ? `https://cms.austrofit.at/assets/${item.image}` : null);

  const styles = getSinglePageClasses();

  let contentEl = $state(null);

  onMount(() => {
    if (!contentEl) return;
    // Suche Überschrift "Quellen" und klappe alles danach in ein <details> ein
    const headings = contentEl.querySelectorAll('h2, h3');
    for (const heading of headings) {
      if (heading.textContent?.trim().toLowerCase() !== 'quellen') continue;

      const details = document.createElement('details');
      details.className = 'quellen-details';

      const summary = document.createElement('summary');
      summary.textContent = 'Quellen';
      details.appendChild(summary);

      // Alle folgenden Geschwister in das details-Element verschieben
      let next = heading.nextElementSibling;
      while (next) {
        const sibling = next;
        next = next.nextElementSibling;
        details.appendChild(sibling);
      }

      heading.replaceWith(details);
      break;
    }
  });
</script>

<div class={styles.containerContent}>

  {#if item.description}
    <div class={styles.description}>
      {item.description}
    </div>
  {/if}

  {#if item.content}
    <div bind:this={contentEl} class={`${styles.content} article-content`}>
      {@html item.content}
    </div>
  {/if}

</div>

<style>
  /* Global styling for HTML that comes from Directus ({@html ...}) */
  :global(.article-content h2) {
    font-size: 1.5rem;
    line-height: 1.25;
    font-weight: 700;
    margin-top: 2rem;
    margin-bottom: 0.75rem;
  }

  :global(.article-content h3) {
    font-size: 1.2rem;
    line-height: 1.3;
    font-weight: 650;
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
  }

  :global(.article-content p) {
    margin: 0.75rem 0;
  }

  :global(.article-content ul),
  :global(.article-content ol) {
    margin: 0.75rem 0 0.75rem 1.25rem;
  }

  :global(.article-content li) {
    margin: 0.35rem 0;
  }

  :global(.article-content a) {
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  :global(.article-content blockquote) {
    border-left: 4px solid rgba(0, 0, 0, 0.12);
    padding-left: 1rem;
    margin: 1rem 0;
    opacity: 0.95;
  }

  /* Quellen-Bereich: eingeklappt */
  :global(.article-content .quellen-details) {
    margin-top: 2rem;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    padding-top: 0.75rem;
  }

  :global(.article-content .quellen-details summary) {
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    color: #6b7280;
    list-style: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    user-select: none;
  }

  :global(.article-content .quellen-details summary::-webkit-details-marker) {
    display: none;
  }

  :global(.article-content .quellen-details summary::before) {
    content: '▶';
    font-size: 0.65rem;
    transition: transform 0.2s;
    display: inline-block;
  }

  :global(.article-content .quellen-details[open] summary::before) {
    transform: rotate(90deg);
  }
</style>
