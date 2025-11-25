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
            <!-- Clickable dropdown item -->
            {#if child.type === 'url'}
              <a href={child.url} class={designClasses.mainNavItem.dropdownItemLink}>
                {child.title}
              </a>
            {:else if child.type === 'page' && child.page}
              <a href="/{child.page.slug}" class={designClasses.mainNavItem.dropdownItemLink}>
                {child.title}
              </a>
            {:else}
              <span class={designClasses.mainNavItem.dropdownItemSpan}>
                {child.title}
              </span>
            {/if}
            
            <!-- Second level dropdown - CSS handles the positioning automatically -->
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