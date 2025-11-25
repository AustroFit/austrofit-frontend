<script>
  import MainNavItem from './MainNavItem.svelte';
  import MobileNavItem from './MobileNavItem.svelte';
  import { getMainNavClasses } from '$lib/design-system/classes';

  const { navigation } = $props();
  const styles = getMainNavClasses();
</script>

<nav class="flex flex-row justify-center font-montserrat h-[80px] border-4 border-dark-green-1">


  
  <div class=" h-full flex grow bg-dark-blue-1 border-4 border-dark-pink-1">
    
  </div>
  
  <div class="w-full max-w-[1140px] flex flex-row h-full border-4 border-dark-purple-3">
    
    <div class="bg-dark-blue-1 rounded-br-[60px_60px] pr-6 lg:rounded-br-[100px_100px] lg:pr-10 border-4 border-dark-green-2">
      <a href="/" class="flex h-full items-center">
        <img 
          src="logo/logo_white.svg" 
          alt="Zukunftsallianz" 
          class="h-10 lg:h-14 w-auto"
        />
      </a>
    </div>

    <div class=" flex flex-1 gap-2 justify-end items-center border-4 border-dark-pink-1">
      <ul class="hidden lg:flex flex-row gap-6 items-center">
        {#each navigation as item, index}
          <li class="text-dark-blue-1">
            {item.title}
          </li>
        {/each}
      </ul>

      <div class="lg:hidden flex items-center">
        Mobile Menu
      </div>

      <a 
      href="/spenden"
      class="px-6 py-1 ml-2 text-[16px] font-medium self-center inline-flex font-montserrat rounded-md whitespace-nowrap transition-colors border-2 border-dark-green-1  bg-dark-green-1  text-white hover:bg-dark-green-1 /90 hover:border-dark-green-1 /90">
        Spenden
      </a>

     

    </div>

  </div>

  <div class="grow flex items-center border-4 border-dark-pink-1 h-full min-w-4"></div>

</nav>



