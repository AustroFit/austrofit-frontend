<script>
import { getBaseBlockClasses, getButtonClasses, getResponsiveGridClasses, INDEPENDENT_HEIGHT_COLLECTIONS } from "$lib/design-system/classes";
import ArticleCard from "./cards/ArticleCard.svelte";
import EventCard from "./cards/EventCard.svelte";
import PressReleaseListItem from "./cards/PressReleaseListItem.svelte";
import JobCard from "./cards/JobCard.svelte";
import TestimonialCard from "./cards/TestimonialCard.svelte";
import SupporterCard from "./cards/SupporterCard.svelte";
import TeamCard from "./cards/TeamCard.svelte";

const { block } = $props();

const blockData = $derived(block?.item);
const additionalData = $derived(block?.additionalData);
const theme = $derived(block?.background || 'light');
const alignment = $derived(blockData?.alignment || "left");
const cardAlignment = $derived(blockData?.card_alignment || "center");
const cardStyle = $derived(blockData?.card_style || 'lightgrey');
const buttonStyle = $derived(getButtonClasses(blockData.button_style, blockData.button_size));

const componentMap = {
  'articles': ArticleCard,
  'events': EventCard,
  "press_releases": PressReleaseListItem,
  'jobs': JobCard,
  'team_members' : TeamCard,
  'testimonials': TestimonialCard,
  'supporters_organizations': SupporterCard,
};

const CardComponent = $derived(componentMap[blockData.collection]);
const items = $derived(additionalData || []);

const styles = $derived(getBaseBlockClasses(alignment, theme));

// Check if this collection needs independent heights
const needsIndependentHeight = $derived(INDEPENDENT_HEIGHT_COLLECTIONS.includes(blockData?.collection));
// Get column settings (with defaults)
const colsDesktop = $derived(blockData?.columns_desktop || 3);
const colsTablet = $derived(blockData?.columns_tablet || 2);
const colsMobile = $derived(blockData?.columns_mobile || 1);

// Special case: Press releases always use list layout
const isListLayout = $derived(['press_releases'].includes(blockData?.collection));

/* // Map column numbers to full class strings
const gridColClasses = {
  1: 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
}; */

// Get the full class string based on desktop columns setting
//const desktopCols = blockData.columns_desktop || 3;
//const gridClasses = gridColClasses[desktopCols] || gridColClasses[3];

// Generate grid classes
const gridClasses = $derived(isListLayout
  ? 'flex flex-col gap-4 mt-10'
  : `${getResponsiveGridClasses(colsDesktop, colsTablet, colsMobile, needsIndependentHeight)} mt-10`);


//console.log(block)
</script>

<div class={styles.container}>
  {#if blockData.tagline}
    <div class={styles.tagline}>
      {blockData.tagline}
    </div>
  {/if}
  
  {#if blockData.headline}
    <h2 class={styles.headline}>
      {blockData.headline}
    </h2>
  {/if}

  {#if blockData.description}
    <div class={styles.description}>
      {blockData.description}
    </div>
  {/if}

  {#if !CardComponent}
    <p>Keine Daten vorhanden</p>
  {:else if items.length === 0}
    <p>Keine Einträge gefunden</p>
  {:else}
    <div class={gridClasses}>
      {#each items as item (item.id)}
        <CardComponent {item} {cardAlignment} {cardStyle} {buttonStyle} columns={colsDesktop}/>
      {/each}
    </div>
  {/if}
  


</div>








