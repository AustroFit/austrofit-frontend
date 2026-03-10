<!-- src/lib/components/blocks/hero/Hero.svelte -->
<script>
  import { getHeroClasses, getButtonClasses } from "$lib/design-system/classes";

  const { block } = $props();
  const blockData = block.item;
  const theme = block.background || 'light';
  const layout = blockData.layout || 'image_right';
  const isFullscreen = layout === 'image_full';

  const styles = getHeroClasses(layout, theme);

  const imageUrl = blockData.image
    ? `https://cms.austrofit.at/assets/${blockData.image}`
    : null;

  // Resolve button href from the button_group M2O (buttons collection)
  function resolveHref(btn) {
    if (!btn) return null;
    if (btn.link_type === 'internal' && btn.internal_page?.slug) {
      return `/${btn.internal_page.slug}${btn.anchor ? '#' + btn.anchor : ''}`;
    }
    return btn.external_url || null;
  }

  const btn = blockData.button_group;
  const btnHref = $derived(resolveHref(btn));
  const btnTarget = btn?.open_in_new_tab ? '_blank' : undefined;
  const btnClasses = getButtonClasses('red', 'lg');
</script>

{#if isFullscreen}
  <!-- Fullscreen hero -->
  <div class={styles.container}>
    {#if imageUrl}
      <img
        src={imageUrl}
        alt={blockData.headline || 'Hero image'}
        class={styles.image}
      />
      <div class={styles.overlay}></div>
    {/if}

    <div class={styles.contentWrapper}>
      <div class={styles.contentContainer}>
        <div class={styles.textWrapper}>
          {#if blockData.tagline}
            <div>
              <span class={styles.tagline}>
                {blockData.tagline}
              </span>
            </div>
          {/if}

          {#if blockData.headline}
            <h1 class={styles.headline}>
              <span class={styles.headlineSpan}>
                {blockData.headline}
              </span>
            </h1>
          {/if}

          {#if blockData.description}
            <p class={styles.description}>
              <span class={styles.descriptionSpan}>
                {blockData.description}
              </span>
            </p>
          {/if}

          {#if btn && btnHref}
            <div class={styles.buttonWrapper}>
              <a href={btnHref} class={btnClasses} target={btnTarget}>
                {btn.label}
              </a>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>

{:else}
  <!-- Regular hero layouts -->
  <div class={styles.layout}>
    {#if imageUrl && layout !== 'image_top'}
      <div class={styles.imageWrapper}>
        <img
          src={imageUrl}
          alt={blockData.headline || 'Hero image'}
          class={styles.image}
        />
      </div>
    {/if}

    <div class={styles.content}>
      {#if blockData.tagline}
        <div class={styles.tagline}>
          {blockData.tagline}
        </div>
      {/if}

      {#if blockData.headline}
        <h1 class={styles.headline}>
          {blockData.headline}
        </h1>
      {/if}

      {#if blockData.description}
        <p class={styles.description}>
          {blockData.description}
        </p>
      {/if}

      {#if btn && btnHref}
        <div class="mt-6">
          <a href={btnHref} class={btnClasses} target={btnTarget}>
            {btn.label}
          </a>
        </div>
      {/if}
    </div>

    {#if imageUrl && layout === 'image_top'}
      <div class={styles.imageWrapper}>
        <img
          src={imageUrl}
          alt={blockData.headline || 'Hero image'}
          class={styles.image}
        />
      </div>
    {/if}
  </div>
{/if}
