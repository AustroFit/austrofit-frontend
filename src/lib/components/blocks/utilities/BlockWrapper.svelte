<!-- src/lib/components/blocks/utilities/BlockWrapper.svelte -->
<script>
  import { getBlockStyles } from "$lib/design-system/block-styles";

  let { block, children } = $props();
  
  // Check if this is a fullscreen hero
  const isFullscreenHero = $derived(block.collection === 'block_hero' && block.item?.layout === 'image_full');

  const styles = $derived(getBlockStyles(block));
  const anchor = $derived(block?.anchor || '');
</script>

{#if isFullscreenHero}
  <!-- For fullscreen hero, skip wrapper entirely -->
  {@render children()}
{:else}
  <!-- Normal block wrapper -->
  <section id={anchor} class={styles.section}>
    <div class={styles.container}>
      {@render children()}
    </div>
  </section>
{/if}