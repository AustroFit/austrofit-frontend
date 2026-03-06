<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import MainNavItem from './MainNavItem.svelte';
  import MobileNavItem from './MobileNavItem.svelte';
  import { getMainNavClasses } from '$lib/design-system/classes';
  import { getAccessToken, logout as authLogout } from '$lib/utils/auth';

  const { navigation } = $props();
  const styles = getMainNavClasses();

  let mobileMenuOpen = $state(false);
  let loggedIn = $state(false);

  $effect(() => {
    page.url;
    loggedIn = !!getAccessToken();
  });

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  function logout() {
    authLogout();
    loggedIn = false;
    closeMobileMenu();
    goto('/');
  }

  // Aktiver Link: currentPath prüfen
  const currentPath = $derived(page.url?.pathname ?? '');

  function isActive(href: string): boolean {
    return currentPath === href || (href !== '/' && currentPath.startsWith(href));
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
        <li>
          <a
            href="/gesundheitswegweiser"
            class="text-[15px] tracking-wide font-medium transition-colors py-2
              {isActive('/gesundheitswegweiser')
                ? 'border-b-2 font-semibold'
                : 'text-dark-kvb-blue hover:text-dark-kvb-blue/70'}"
            style={isActive('/gesundheitswegweiser') ? 'color:#E8272A; border-color:#E8272A;' : ''}
          >
            Gesundheitswegweiser
          </a>
        </li>
        <li>
          <a
            href="/partner"
            class="text-[15px] tracking-wide font-medium transition-colors py-2
              {isActive('/partner')
                ? 'border-b-2 font-semibold'
                : 'text-dark-kvb-blue hover:text-dark-kvb-blue/70'}"
            style={isActive('/partner') ? 'color:#E8272A; border-color:#E8272A;' : ''}
          >
            Partner
          </a>
        </li>
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

      <!-- Auth links (desktop) -->
      {#if loggedIn}
        <a
          href="/dashboard"
          class="hidden lg:inline-flex px-4 py-1 text-[15px] font-medium font-montserrat rounded-md whitespace-nowrap transition-colors border-2
            {isActive('/dashboard')
              ? 'text-white border-transparent'
              : 'border-dark-blue-1 text-dark-blue-1 hover:bg-dark-blue-1 hover:text-white'}"
          style={isActive('/dashboard') ? 'background:#E8272A; border-color:#E8272A;' : ''}>
          Dashboard
        </a>
        <a
          href="/profil"
          class="hidden lg:inline-flex px-4 py-1 text-[15px] font-medium font-montserrat rounded-md whitespace-nowrap transition-colors border-2
            {isActive('/profil')
              ? 'text-white border-transparent'
              : 'border-dark-blue-1 text-dark-blue-1 hover:bg-dark-blue-1 hover:text-white'}"
          style={isActive('/profil') ? 'background:#E8272A; border-color:#E8272A;' : ''}>
          Profil
        </a>
        <button
          onclick={logout}
          class="hidden lg:inline-flex px-4 py-1 text-[15px] font-medium font-montserrat rounded-md whitespace-nowrap transition-colors border-2 border-dark-blue-1/40 text-dark-blue-1/70 hover:border-dark-blue-1 hover:text-dark-blue-1">
          Logout
        </button>
      {:else}
        <a
          href="/login"
          class="hidden lg:inline-flex px-4 py-1 text-[15px] font-medium font-montserrat rounded-md whitespace-nowrap transition-colors border-2 border-dark-blue-1 text-dark-blue-1 hover:bg-dark-blue-1 hover:text-white">
          Login
        </a>
        <a
          href="/registrierung"
          class="hidden lg:inline-flex px-4 py-1 text-[15px] font-medium font-montserrat rounded-md whitespace-nowrap transition-colors border-2 border-light-blue-1 bg-light-blue-1 text-dark-blue-1 hover:bg-dark-blue-1 hover:text-white hover:border-dark-blue-1">
          Registrieren
        </a>
      {/if}

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
  <div class="fixed top-[75px] w-full max-w-[100vw] bg-white shadow-md z-50 overflow-y-auto lg:hidden">
    <nav class="py-4">
      {#each navigation as item}
        <MobileNavItem {item} onNavigate={closeMobileMenu} />
      {/each}

      <!-- Gesundheitswegweiser (mobile) -->
      <a
        href="/gesundheitswegweiser"
        onclick={closeMobileMenu}
        class="block py-2 px-4 font-medium transition-colors border-t border-black/10 mt-1 pt-3
          {isActive('/gesundheitswegweiser') ? 'font-semibold' : 'text-dark-kvb-blue hover:text-dark-kvb-blue/70'}"
        style={isActive('/gesundheitswegweiser') ? 'color:#E8272A;' : ''}
      >
        Gesundheitswegweiser
      </a>

      <!-- Partner (mobile) -->
      <a
        href="/partner"
        onclick={closeMobileMenu}
        class="block py-2 px-4 font-medium transition-colors border-t border-black/10 mt-1 pt-3
          {isActive('/partner') ? 'font-semibold' : 'text-dark-kvb-blue hover:text-dark-kvb-blue/70'}"
        style={isActive('/partner') ? 'color:#E8272A;' : ''}
      >
        Partner
      </a>

      <!-- Auth links (mobile) -->
      <div class="border-t border-black/10 mt-2 pt-2 px-4 flex flex-col gap-2">
        {#if loggedIn}
          <a
            href="/dashboard"
            onclick={closeMobileMenu}
            class="block py-2 px-3 rounded-md font-medium transition-colors
              {isActive('/dashboard') ? 'font-semibold' : 'text-dark-blue-1 hover:bg-dark-blue-1/10'}"
            style={isActive('/dashboard') ? 'color:#E8272A;' : ''}
          >
            Dashboard
          </a>
          <a
            href="/profil"
            onclick={closeMobileMenu}
            class="block py-2 px-3 rounded-md font-medium transition-colors
              {isActive('/profil') ? 'font-semibold' : 'text-dark-blue-1 hover:bg-dark-blue-1/10'}"
            style={isActive('/profil') ? 'color:#E8272A;' : ''}
          >
            Profil
          </a>
          <button
            onclick={logout}
            class="text-left py-2 px-3 rounded-md font-medium text-dark-blue-1/60 hover:text-dark-blue-1 hover:bg-dark-blue-1/10 transition-colors">
            Logout
          </button>
        {:else}
          <a
            href="/login"
            onclick={closeMobileMenu}
            class="block py-2 px-3 rounded-md font-medium text-dark-blue-1 hover:bg-dark-blue-1/10 transition-colors">
            Login
          </a>
          <a
            href="/registrierung"
            onclick={closeMobileMenu}
            class="block py-2 px-3 rounded-md font-medium text-dark-blue-1 hover:bg-dark-blue-1/10 transition-colors">
            Registrieren
          </a>
        {/if}
      </div>
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
