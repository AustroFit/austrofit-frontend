<script>
  import MainNavItem from './MainNavItem.svelte';
  const { navigation } = $props();

</script>

<nav>
  <div>  
    <ul>
      {#each navigation as item}
        <MainNavItem {item} />
      {/each}
    </ul>
  </div>

</nav>
