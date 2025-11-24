<script>
  import MainNavItem from './MainNavItem.svelte';
  const { item } = $props();
</script>

<li>
  {#if item.type === 'url'}
    <a href={item.url}>
      {item.title}
    </a>
  {:else if item.type === 'page' && item.page}
    <a href={`${item.page.slug}`}>
      {item.title}
    </a>
  {:else}
    <span >{item.title}</span>
  {/if}

  {#if item.children?.length}
    <ul>
      {#each item.children as child}        
        <MainNavItem item={child} />        
      {/each}
    </ul>
  {/if}
</li>