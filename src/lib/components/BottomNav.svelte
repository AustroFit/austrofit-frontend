<!-- src/lib/components/BottomNav.svelte -->
<!-- Persistente Bottom-Navigation für Native-App (iOS/Android). -->
<!-- Nur gerendert wenn isNativePlatform() true ist. -->
<script lang="ts">
  import { page } from '$app/state';

  const currentPath = $derived(page.url?.pathname ?? '');

  function isActive(href: string): boolean {
    return currentPath === href || (href !== '/' && currentPath.startsWith(href));
  }

  const tabs = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6">
        <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
        <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
      </svg>`
    },
    {
      href: '/gesundheitswegweiser',
      label: 'Quiz',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6">
        <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
      </svg>`
    },
    {
      href: '/belohnung',
      label: 'Belohnungen',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6">
        <path d="M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0 1 12 2.753a3.375 3.375 0 0 1 5.432 3.997h3.943c1.035 0 1.875.84 1.875 1.875v.75c0 1.035-.84 1.875-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 1 0-1.875-1.875V6.75h-1.5V4.875C11.25 3.839 10.41 3 9.375 3ZM11.25 12.75H3v6.75a2.25 2.25 0 0 0 2.25 2.25h6v-9ZM12.75 12.75v9h6.75a2.25 2.25 0 0 0 2.25-2.25v-6.75h-9Z" />
      </svg>`
    },
    {
      href: '/profil',
      label: 'Profil',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6">
        <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
      </svg>`
    }
  ];
</script>

<nav
  class="fixed bottom-0 left-0 right-0 z-40 border-t border-black/10 bg-[var(--color-light-grey)]"
  style="padding-bottom: env(safe-area-inset-bottom);"
  aria-label="Hauptnavigation"
>
  <div class="flex h-16 items-stretch">
    {#each tabs as tab}
      {@const active = isActive(tab.href)}
      <a
        href={tab.href}
        class="relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors
          {active ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}"
        aria-current={active ? 'page' : undefined}
      >
        {@html tab.icon}
        <span>{tab.label}</span>
        {#if active}
          <span class="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary"></span>
        {/if}
      </a>
    {/each}
  </div>
</nav>
