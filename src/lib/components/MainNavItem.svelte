<script>
  import MainNavItem from './MainNavItem.svelte';
  const { item } = $props();
</script>

<li class="relative group">
  {#if item.type === 'url'}
    <a 
      href={item.url}
      class="text-gray-700 hover:text-blue-600 font-medium transition-colors"
    >
      {item.title}
    </a>
  {:else if item.type === 'page' && item.page}
    <a 
      href="/{item.page.slug}"
      class="text-gray-700 hover:text-blue-600 font-medium transition-colors"
    >
      {item.title}
    </a>
  {:else}
    <span class="text-gray-700 font-medium cursor-default">
      {item.title}
    </span>
  {/if}
  
  {#if item.children?.length}
    <!-- Dropdown Menu -->
    <ul class="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-48 z-50">
      {#each item.children as child}        
        <div class="px-4 py-2 border-b border-gray-100 last:border-b-0">
          <MainNavItem item={child} />        
        </div>
      {/each}
    </ul>
  {/if}
</li>