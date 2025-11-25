<!-- src/lib/components/navigation/MainNavItem.svelte -->
<script>
  import { page } from '$app/state';
  import { designClasses, getNavItemClasses } from '$lib/design-system/classes';
  
  const { item } = $props();
  
  let isActive = $derived(() => {
    if (item.type === 'url') return page.url.pathname === item.url;
    if (item.type === 'page' && item.page) return page.url.pathname === `/${item.page.slug}`;
    return false;
  });
  
  let linkClass = $derived(() => getNavItemClasses(isActive()));
</script>

<div class={designClasses.mainNavItem.container}>
  <!-- Main navigation link -->
  {#if item.type === 'url'}
    <a href={item.url} class={linkClass()}>
      {item.title}
    </a>
  {:else if item.type === 'page' && item.page}
    <a href="/{item.page.slug}" class={linkClass()}>
      {item.title}
    </a>
  {:else}
    <span class={linkClass()}>
      {item.title}
    </span>
  {/if}
  
  <!-- First level dropdown -->
  {#if item.children?.length}
    <ul class={designClasses.mainNavItem.dropdown}>
      {#each item.children as child}
        <li class={designClasses.mainNavItem.dropdownItem}>
          <div class={designClasses.mainNavItem.nestedContainer}>
            
            <!-- Dropdown item with optional arrow indicator -->
            <div class="flex items-center justify-between">
              {#if child.type === 'url'}
                <a href={child.url} class="{designClasses.mainNavItem.dropdownItemLink} flex-1">
                  {child.title}
                </a>
              {:else if child.type === 'page' && child.page}
                <a href="/{child.page.slug}" class="{designClasses.mainNavItem.dropdownItemLink} flex-1">
                  {child.title}
                </a>
              {:else}
                <span class="{designClasses.mainNavItem.dropdownItemSpan} flex-1">
                  {child.title}
                </span>
              {/if}
              
              <!-- Arrow indicator if has nested children -->
              {#if child.children?.length}
                <svg 
                  class="w-4 h-4 mr-3 text-dark-kvb-blue/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              {/if}
            </div>
            
            <!-- Second level dropdown -->
            {#if child.children?.length}
              <ul class={designClasses.mainNavItem.nestedDropdown}>
                {#each child.children as grandchild}
                  <li class={designClasses.mainNavItem.dropdownItem}>
                    {#if grandchild.type === 'url'}
                      <a href={grandchild.url} class={designClasses.mainNavItem.dropdownItemLink}>
                        {grandchild.title}
                      </a>
                    {:else if grandchild.type === 'page' && grandchild.page}
                      <a href="/{grandchild.page.slug}" class={designClasses.mainNavItem.dropdownItemLink}>
                        {grandchild.title}
                      </a>
                    {:else}
                      <span class={designClasses.mainNavItem.dropdownItemSpan}>
                        {grandchild.title}
                      </span>
                    {/if}
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>
