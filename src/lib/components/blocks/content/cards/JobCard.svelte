<script>
  import { getJobCardClasses } from "$lib/design-system/classes";

  const {item, cardAlignment, cardStyle, buttonStyle } = $props();

  const jobTypeLabels = {
  paid: 'bezahlt',
  unpaid: 'unbezahlt',
  ad_hoc: 'punktuell Unterstützend'
	};

  let isOpen = $state(false);
  
  function toggle() {
    isOpen = !isOpen;
  }

  let showMetaBanner = false;
  //console.log(item);
  const styles = getJobCardClasses(cardStyle, cardAlignment);
</script>


<div class="{styles.item} {isOpen ? styles.itemOpen : styles.itemClosed}">
  <!-- Question (clickable) -->
  <button 
    class={styles.button}
    onclick={toggle}
    aria-expanded={isOpen}
  >
    <span class={styles.title}>
      {item.title}
    </span>
    
    <!-- Chevron icon -->
    <svg 
      class="{styles.icon} {isOpen ? styles.iconOpen : ''}"
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </button>
  
  <!-- (expandable) -->
  {#if isOpen}
    <div class={styles.contentWrapper}>
      <div class={styles.content}>
        {@html item.job_description}
      </div>
    </div>
  {/if}
</div>