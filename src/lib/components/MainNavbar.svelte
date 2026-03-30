<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { getAccessToken, logout as authAbmelden } from '$lib/utils/auth';

  let mobileMenuOpen = $state(false);
  let loggedIn = $state(false);
  let navInitial = $state('');

  $effect(() => {
    page.url;
    const wasLoggedIn = loggedIn;
    loggedIn = !!getAccessToken();
    if (loggedIn && !wasLoggedIn) fetchNavInitial();
    if (!loggedIn) navInitial = '';
  });

  async function fetchNavInitial() {
    try {
      const token = getAccessToken();
      const res = await fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        navInitial = data?.data?.first_name?.[0]?.toUpperCase() ?? '';
      }
    } catch { /* non-blocking */ }
  }

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  function logout() {
    authAbmelden();
    loggedIn = false;
    navInitial = '';
    closeMobileMenu();
    goto('/');
  }

  const currentPath = $derived(page.url?.pathname ?? '');

  function isActive(href: string): boolean {
    return currentPath === href || (href !== '/' && currentPath.startsWith(href));
  }

  const guestNav = [
    { href: '/', label: 'Home' },
    { href: '/partner-werden', label: 'Für Partner' },
    { href: '/gesundheitswegweiser', label: 'Gesundheitswegweiser' },
    { href: '/ueber-uns', label: 'Über uns' },
  ];

  const authNav = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/gesundheitswegweiser', label: 'Gesundheitswegweiser' },
    { href: '/profil', label: 'Profil' },
    { href: '/belohnung', label: 'Belohnungen' },
  ];
</script>

<nav class="z-50 flex flex-row justify-center font-montserrat h-[75px] bg-light-grey shadow-sm">
  <div class="w-full max-w-[1140px] flex flex-row h-full px-4 lg:px-6">

    <!-- Logo -->
    <div class="pr-6 lg:pr-10">
      <a href="/" class="flex h-full items-center">
        <img src="/AF_Logo.png" alt="AustroFit" class="hidden md:block h-9 lg:h-10 w-auto" />
        <img src="/AF_Favicon.png" alt="AustroFit" class="md:hidden h-10 w-auto" />
      </a>
    </div>

    <div class="flex flex-1 gap-2 justify-end items-center">

      <!-- Desktop nav links -->
      <ul class="hidden lg:flex flex-row gap-6 items-center">
        {#each (loggedIn ? authNav : guestNav) as item}
          <li>
            <a
              href={item.href}
              data-sveltekit-preload-code="hover"
              class="text-[15px] tracking-wide font-medium transition-colors py-2
                {isActive(item.href) ? 'border-b-2 font-semibold' : 'text-dark-kvb-blue hover:text-dark-kvb-blue/70'}"
              style={isActive(item.href) ? 'color: var(--color-primary); border-color: var(--color-primary);' : ''}
            >
              {item.label}
            </a>
          </li>
        {/each}
      </ul>

      <!-- Desktop auth buttons -->
      {#if loggedIn}
        <button
          onclick={logout}
          class="hidden lg:inline-flex px-4 py-1 text-[15px] font-medium font-montserrat rounded-md whitespace-nowrap transition-colors border-2 border-primary/40 text-primary/70 hover:border-primary hover:text-primary">
          Abmelden
        </button>
      {:else}
        <a
          href="/registrierung"
          class="hidden lg:inline-flex px-4 py-1 text-[15px] font-medium font-montserrat rounded-md whitespace-nowrap transition-colors border-2 border-primary bg-primary text-white hover:bg-primary-dark hover:border-primary-dark">
          Registrieren
        </a>
        <a
          href="/login"
          class="hidden lg:inline-flex px-4 py-1 text-[15px] font-medium font-montserrat rounded-md whitespace-nowrap transition-colors border-2 border-primary text-primary hover:bg-primary hover:text-white">
          Anmelden
        </a>
      {/if}

      <!-- Mobile profile icon (logged in only) -->
      {#if loggedIn}
        <a
          href="/profil"
          class="lg:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary hover:bg-primary/20 transition-colors"
          aria-label="Zu meinem Profil"
        >
          {navInitial || '?'}
        </a>
      {/if}

      <!-- Mobile hamburger -->
      <button
        class="lg:hidden bg-primary-light rounded-md p-2 cursor-pointer text-primary hover:bg-primary hover:text-white transition-colors"
        onclick={toggleMobileMenu}
        aria-label="Menu"
        aria-expanded={mobileMenuOpen}
      >
        {#if mobileMenuOpen}
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        {:else}
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        {/if}
      </button>

    </div>
  </div>
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
      {#each (loggedIn ? authNav : guestNav) as item}
        <div class="border-b border-gray-200">
          <a
            href={item.href}
            data-sveltekit-preload-code="hover"
            onclick={closeMobileMenu}
            class="pl-6 pr-4 flex-1 py-3 block font-medium transition-colors hover:bg-light-grey/50
              {isActive(item.href) ? 'font-semibold' : 'text-dark-kvb-blue'}"
            style={isActive(item.href) ? 'color: var(--color-primary);' : ''}
          >
            {item.label}
          </a>
        </div>
      {/each}

      <!-- Mobile auth actions -->
      {#if loggedIn}
        <div class="border-b border-gray-200">
          <button
            onclick={logout}
            class="pl-6 pr-4 w-full text-left py-3 font-medium text-dark-kvb-blue/60 hover:bg-light-grey/50 hover:text-dark-kvb-blue transition-colors">
            Abmelden
          </button>
        </div>
      {:else}
        <div class="flex gap-3 px-6 py-3">
          <a
            href="/registrierung"
            onclick={closeMobileMenu}
            class="flex-1 py-2 font-medium bg-primary text-white text-center rounded-md hover:bg-primary-dark transition-colors text-sm">
            Registrieren
          </a>
          <a
            href="/login"
            onclick={closeMobileMenu}
            class="flex-1 py-2 font-medium border-2 border-primary text-primary text-center rounded-md hover:bg-primary hover:text-white transition-colors text-sm">
            Anmelden
          </a>
        </div>
      {/if}
    </nav>
  </div>
{/if}
