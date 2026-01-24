<script>
  import { getSinglePageClasses } from "$lib/design-system/classes";
  const { item, collection, config} = $props();

  const imageUrl = item.image ? `https://cms.austrofit.at/assets/${item.image}` : null;
  
  const styles = getSinglePageClasses();
  console.log(item);
</script>

<div class={styles.containerContent}>
  {#if item.description}
    <div class={styles.description}>
      {item.description}
    </div>   
  {/if}
  
  {#if item.content}
    <div class={styles.content}>
      {@html item.content}
    </div>
  {/if}
  
  <!-- Learning Module Article -->
  {#if item.learning_module?.article_markdown}
    <div class={styles.content}>
      {@html item.learning_module.article_markdown}
    </div>
  {/if}
</div>
