<script>
  import Content from '$lib/components/singlepage/Content.svelte';
  import Hero from '$lib/components/singlepage/Hero.svelte';
  import Meta from '$lib/components/singlepage/Meta.svelte';
  import RelatedItems from '$lib/components/singlepage/RelatedItems.svelte';
  import Quiz from '$lib/components/singlepage/Quiz.svelte';
  import { getSinglePageConfig } from '$lib/config/singlePageConfigs.js';
  import { getSinglePageClasses } from '$lib/design-system/classes.js';
  const { data } = $props();
  const item = $derived(data.item);
  const collection = $derived(data.collection);
  const relatedItems = $derived(data.relatedItems);
  const quiz = $derived(data.quiz);
  const quizRecordId = $derived(quiz?.id ?? null);
  // Get display configuration for this collection
  const pageConfig = $derived(getSinglePageConfig(collection));
  const styles = $derived(getSinglePageClasses());
  //console.log('Page data:', { item, collection, pageConfig });
</script>

<section class={styles.pageContainer}>
  <!-- Hero Section -->
  <Hero {item} {collection} config={pageConfig} />

  <!-- Meta Section (breadcrumbs, date, location, etc.) -->
  {#if pageConfig.showMeta || pageConfig.showBreadcrumbs}
    <Meta {item} {collection} config={pageConfig} />
  {/if}

  <!-- Main Content -->
  <Content {item} {collection} config={pageConfig} />

  {#if collection === 'articles' && quiz?.data}
    <Quiz quiz={quiz.data} meta={{ version: quiz.version, status: quiz.status }} quizId={quizRecordId} />
  {:else if collection === 'articles'}
    <!-- optional: Debug-Hinweis -->
    <!-- <div class="mt-6 text-sm opacity-60">Kein Quiz gefunden oder JSON nicht parsebar.</div> -->
  {/if}

  <!-- Related Items -->
  {#if pageConfig.showRelated && relatedItems?.length > 0}
    <RelatedItems items={relatedItems} {collection} title={pageConfig.relatedTitle} />
  {/if}
</section>