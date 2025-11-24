<script>
  import MainNavItem from './MainNavItem.svelte';
  const { navigation } = $props();
</script>

<nav class="bg-white border-b border-gray-200">
  <div class="container mx-auto px-4">  
    <ul class="flex items-center space-x-8 py-4">
      {#each navigation as item}
        <MainNavItem {item} />
      {/each}
    </ul>
  </div>
</nav>