<script>
  import MainNavItem from './MainNavItem.svelte';
  import MobileNavItem from './MobileNavItem.svelte';
  import { getMainNavClasses } from '$lib/design-system/classes';

  const { navigation } = $props();
  const styles = getMainNavClasses();

  let mobileMenuOpen = $state(false);
  
  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

</script>

<nav class="z-50 flex flex-row justify-center font-montserrat h-[75px] bg-light-grey shadow-sm">
  
  <div class="h-full min-w-2 flex grow bg-dark-blue-1">    
  </div>  

  <div class="w-full max-w-[1140px] flex flex-row h-full">
    
    <div class="bg-dark-blue-1 rounded-br-[80px_80px] pr-6 lg:rounded-br-[100px_100px] lg:pr-10">
      <a href="/" class="flex h-full items-center">
        <img 
          src="/logo/logo_white.svg" 
          alt="Austrofit" 
          class="pr-4 h-10  md:h-12 lg:h-14 w-auto"
        />
      </a>
    </div>

    <div class=" flex flex-1 gap-2 justify-end items-center">
      <ul class="hidden lg:flex flex-row gap-6 items-center">
        {#each navigation as item, index}
          <li class={index >= navigation.length - 2 ? 'menu-right-edge' : ''}>
            <MainNavItem {item} />
          </li>
        {/each}
      </ul>

      <!-- Mobile hamburger button -->
      <button
        class="mr-2 lg:hidden bg-light-blue-1 rounded-md 1 p-2 cursor-pointer text-dark-blue-1 hover:bg-dark-blue-1 hover:text-light-blue-1 transition-colors"
        onclick={toggleMobileMenu}
        aria-label="Menu"
        aria-expanded={mobileMenuOpen}
      >
        {#if mobileMenuOpen}
          <!-- X icon -->
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        {:else}
          <!-- Hamburger icon -->
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        {/if}
      </button>

      <a 
      href="/spenden"
      class="px-6 py-1 ml-2 text-[16px] font-medium self-center inline-flex font-montserrat rounded-md whitespace-nowrap transition-colors border-2 border-dark-green-1  bg-dark-green-1  text-white hover:bg-dark-green-1 /90 hover:border-dark-green-1 /90">
        Spenden
      </a>     

    </div>
  </div>

  <div class="grow flex items-cente h-full min-w-2"></div>

</nav>



{#if mobileMenuOpen}
  <button
    class="fixed inset-0 bg-black/25 z-40 lg:hidden border-0 p-0 cursor-default"
    onclick={closeMobileMenu}
    aria-label="Menü schließen"
  >
  </button>
  
  <!-- Mobile menu panel -->
  <div class="fixed top-[75px] w-full max-w-[100vw] bg-light-grey shadow-md z-50 overflow-y-auto lg:hidden">
    <nav class="py-4">
      {#each navigation as item}
        <MobileNavItem {item} onNavigate={closeMobileMenu} />
      {/each}
    </nav>
  </div>
{/if}


<noscript>
  <style>
    .mobile-menu-nojs {
      display: block !important;
    }
  </style>
</noscript>

<!-- Fallback menu (hidden when JS works) -->
<div class="hidden mobile-menu-nojs lg:hidden">
  <ul class="flex flex-col gap-2 p-4 bg-white mt-2">
    {#each navigation as item}
      <li>
        <a href="/{item.page?.slug || item.url}" class="block py-2 text-dark-blue-1">
          {item.title}
        </a>
        <!-- Flatten children -->
        {#if item.children}
          <ul class="pl-4">
            {#each item.children as child}
              <li>
                <a href="/{child.page?.slug || child.url}" class="block py-1 text-sm">
                  {child.title}
                </a>
              </li>
            {/each}
          </ul>
        {/if}
      </li>
    {/each}
  </ul>
</div>
