<script>
  import { getBlockStyles } from "$lib/design-system/block-styles";

  let { block, children} = $props();
  let styles = $derived(getBlockStyles(block));
</script>

<section class={styles.section}>
  <div class={styles.container}>
      {@render children()}
  </div>
</section>
