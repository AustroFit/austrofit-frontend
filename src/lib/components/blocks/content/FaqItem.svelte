<script>
  const { item, styles } = $props();
  
  let isOpen = $state(false);
  
  function toggle() {
    isOpen = !isOpen;
  }
</script>

<div class="{styles.item} {isOpen ? styles.itemOpen : styles.itemClosed}">
  <!-- Question (clickable) -->
  <button 
    class={styles.question}
    onclick={toggle}
    aria-expanded={isOpen}
  >
    <span class={styles.questionText}>
      {item.question}
    </span>
    
    <!-- Chevron icon -->
    <svg 
      class="{styles.questionIcon} {isOpen ? styles.questionIconOpen : ''}"
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
  
  <!-- Answer (expandable) -->
  {#if isOpen}
    <div class={styles.answerWrapper}>
      <div class={styles.answer}>
        {@html item.answer}
      </div>
    </div>
  {/if}
</div>