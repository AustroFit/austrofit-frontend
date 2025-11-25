<!-- src/lib/components/navigation/MobileNavItem.svelte -->
<script>
  import { page } from '$app/state';
  import MobileNavItem from './MobileNavItem.svelte'; // ✅ Self-import
  
  const { item, level = 0, onNavigate } = $props();
  
  let isExpanded = $state(false);
  
  function toggleExpanded() {
    isExpanded = !isExpanded;
  }
  
  let isActive = $derived(() => {
    if (item.type === 'url') return page.url.pathname === item.url;
    if (item.type === 'page' && item.page) return page.url.pathname === `/${item.page.slug}`;
    return false;
  });
  
  const hasChildren = item.children?.length > 0;
  
  // Indentation based on nesting level
  const paddingLeft = {
    0: 'pl-6',
    1: 'pl-10',
    2: 'pl-14'
  }[level] || 'pl-6';
</script>

<div class="border-b border-gray-200 last:border-b-0">
  <!-- Item row with link and expand button -->
  <div class="flex items-center justify-between">
    
    <!-- Link -->
    {#if item.type === 'url'}
      <a 
        href={item.url}
        class="{paddingLeft} flex-1 py-3 text-dark-blue-1 hover:bg-light-grey/50 transition-colors {isActive() ? 'font-semibold' : ''}"
        onclick={onNavigate}
      >
        {item.title}
      </a>
    {:else if item.type === 'page' && item.page}
      <a 
        href="/{item.page.slug}"
        class="{paddingLeft} flex-1 py-3 text-dark-blue-1 hover:bg-light-blue-1/50 transition-colors {isActive() ? 'font-bold' : ''}"
        onclick={onNavigate}
      >
        {item.title}
      </a>
    {:else}
      <span class="{paddingLeft} flex-1 py-3 text-dark-blue-1">
        {item.title}
      </span>
    {/if}
    
    <!-- Expand/collapse button (only if has children) -->
    {#if hasChildren}
      <button
        class="p-3 text-dark-blue-1 cursor-pointer mr-2 border-1 border-light-blue-2 rounded-md  hover:text-dark-blue-1/60 transition-colors"
        onclick={toggleExpanded}
        aria-label="Submenü"
      >
        <svg 
          class="w-5 h-5 transition-transform {isExpanded ? 'rotate-180' : ''}"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    {/if}
  </div>
  
  <!-- Nested children (recursive using self-import!) -->
  {#if hasChildren && isExpanded}
    <div class="bg-light-grey/30">
      {#each item.children as child}
        <MobileNavItem item={child} level={level + 1} {onNavigate} />
      {/each}
    </div>
  {/if}
</div>