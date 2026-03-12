<!-- src/lib/components/partner/AwinAngebotKarte.svelte -->
<!-- Karte für AWIN-Affiliate-Angebote (kein Punkte-Einlösen, sondern Deeplink) -->
<script lang="ts">
  import { getAccessToken } from '$lib/utils/auth';

  interface Props {
    programId: number;
    name: string;
    logoUrl?: string | null;
    displayUrl?: string;
    description?: string | null;
    category?: string | null;
    targetUrl?: string;
  }

  const { programId, name, logoUrl, displayUrl, description, category, targetUrl }: Props =
    $props();

  // Deeplink-URL: via /api/awin/click/[programId] (serverseitig, Publisher-ID bleibt geheim)
  function getClickUrl(): string {
    const base = `/api/awin/click/${programId}`;
    if (targetUrl) return `${base}?url=${encodeURIComponent(targetUrl)}`;
    return base;
  }

  // Beim Klick: Bearer-Token als Header kann nicht bei <a href> gesetzt werden.
  // Lösung: fetch mit redirect:manual → dann window.open auf Location-Header.
  // Einfacher: direkt zu /api/awin/click (Server liest Cookie/Header nicht – clickref optional).
  // Die Serverroute liest den Authorization-Header aus dem Request – bei direktem Link-Klick
  // gibt es keinen Header. Wir schicken stattdessen einen kurzen fetch-Call, um den
  // finalen Deeplink zu ermitteln, und öffnen ihn dann.
  let loading = $state(false);

  async function handleClick(e: MouseEvent) {
    e.preventDefault();
    if (loading) return;
    loading = true;

    try {
      const token = getAccessToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // redirect:'manual' → fetch folgt nicht dem 302 → wir bekommen Location-Header
      const res = await fetch(getClickUrl(), {
        method: 'GET',
        headers,
        redirect: 'manual'
      });

      // 302: Location-Header enthält fertigen AWIN-Deeplink
      const location = res.headers.get('Location') ?? getClickUrl();
      window.open(location, '_blank', 'noopener,noreferrer');
    } catch {
      // Fallback: direkt öffnen (ohne Attribution)
      window.open(getClickUrl(), '_blank', 'noopener,noreferrer');
    } finally {
      loading = false;
    }
  }

  const categoryLabels: Record<string, string> = {
    'Health/Beauty': 'Gesundheit & Beauty',
    'Sport/Fitness': 'Sport & Fitness',
    'Food/Drink': 'Ernährung',
    Pharmacy: 'Apotheke',
    Wellness: 'Wellness'
  };

  const categoryColors: Record<string, string> = {
    'Health/Beauty': '#15803d',
    'Sport/Fitness': '#1d4ed8',
    'Food/Drink': '#92400e',
    Pharmacy: '#b45309',
    Wellness: '#7c3aed'
  };

  const labelText = category ? (categoryLabels[category] ?? category) : null;
  const labelColor = category ? (categoryColors[category] ?? '#374151') : '#374151';
</script>

<article class="flex flex-col rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
  <!-- Partner-Header -->
  <div class="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-black/5">
    {#if logoUrl}
      <img
        src={logoUrl}
        alt={name}
        class="h-10 w-10 rounded-lg object-contain border border-black/10 p-1 bg-white flex-shrink-0"
        loading="lazy"
      />
    {:else}
      <div
        class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-white text-sm font-bold"
        style="background:#2E7D32;"
      >
        {name.charAt(0).toUpperCase()}
      </div>
    {/if}

    <div class="min-w-0">
      <p class="truncate font-semibold text-gray-900 text-sm">{name}</p>
      {#if displayUrl}
        <p class="truncate text-xs text-gray-400">{displayUrl}</p>
      {/if}
    </div>

    <!-- Online-Partner Badge -->
    <span
      class="ml-auto flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-white"
      style="background:#2E7D32;"
    >
      Online
    </span>
  </div>

  <!-- Content -->
  <div class="flex flex-1 flex-col gap-2 px-4 py-3">
    {#if labelText}
      <span
        class="w-fit rounded-full px-2 py-0.5 text-xs font-medium text-white"
        style="background:{labelColor};"
      >
        {labelText}
      </span>
    {/if}

    {#if description}
      <p class="text-sm text-gray-600 line-clamp-3">{description}</p>
    {:else}
      <p class="text-sm text-gray-400 italic">Keine Beschreibung verfügbar.</p>
    {/if}
  </div>

  <!-- CTA -->
  <div class="px-4 pb-4">
    <button
      onclick={handleClick}
      disabled={loading}
      class="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
      style="background:#2E7D32;"
    >
      {#if loading}
        <span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
        Wird geöffnet…
      {:else}
        Zum Angebot
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      {/if}
    </button>
    <p class="mt-1.5 text-center text-xs text-gray-400">
      Öffnet den Online-Shop in einem neuen Tab
    </p>
  </div>
</article>
