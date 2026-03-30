<!-- src/lib/components/profil/AwinOnlineCode.svelte -->
<!-- Zeigt einen freigeschalteten AWIN-Online-Rabattcode an. -->
<!-- Code kommt aus localStorage; wenn nicht vorhanden → idempotenter Neuabruf. -->
<script lang="ts" module>
  export interface AwinUnlockEntry {
    promoId: string;
    programId: number;
    programName: string;
    description: string;
    pointsCost: number;
    endDate: string;
    unlockedAt: string;
    isExpired: boolean;
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { getAccessToken } from '$lib/utils/auth';
  import { formatDateNumeric, daysUntilExpiry as calcDaysUntil } from '$lib/utils/date';

  interface Props {
    unlock: AwinUnlockEntry;
    /** 'awin' (Standard) oder 'tradedoubler' – steuert Endpoints und localStorage-Prefix */
    provider?: 'awin' | 'tradedoubler';
  }

  const { unlock, provider = 'awin' }: Props = $props();

  const unlockUrl = $derived(provider === 'tradedoubler' ? '/api/tradedoubler/unlock-code' : '/api/awin/unlock-code');
  const clickBasePath = $derived(provider === 'tradedoubler' ? '/api/tradedoubler/click' : '/api/awin/click');
  const storagePrefix = $derived(provider === 'tradedoubler' ? 'austrofit_td_' : 'austrofit_awin_');

  let code = $state<string | null>(null);
  let fetching = $state(false);
  let fetchError = $state('');
  let copied = $state(false);
  let shopLoading = $state(false);

  const storageKey = $derived(`${storagePrefix}${unlock.promoId}`);

  const ablaeuftFormatted = $derived(formatDateNumeric(unlock.endDate));
  const daysUntilExpiry = $derived(calcDaysUntil(unlock.endDate));

  const isExpiringSoon = $derived(!unlock.isExpired && daysUntilExpiry <= 7 && daysUntilExpiry > 0);

  onMount(() => {
    if (browser) {
      code = localStorage.getItem(storageKey);
    }
  });

  async function revealCode() {
    if (fetching) return;
    fetching = true;
    fetchError = '';
    try {
      const token = getAccessToken();
      const payload =
        provider === 'tradedoubler' ? { voucherId: unlock.promoId } : { promoId: unlock.promoId };
      const res = await fetch(unlockUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        fetchError = data.error ?? 'Fehler beim Laden des Codes';
        return;
      }
      code = data.code;
      if (browser) localStorage.setItem(storageKey, data.code);
    } catch {
      fetchError = 'Verbindungsfehler – bitte erneut versuchen';
    } finally {
      fetching = false;
    }
  }

  async function copyCode(e: MouseEvent) {
    e.stopPropagation();
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch { /* ignore */ }
  }

  async function handleShopClick(e: MouseEvent) {
    e.preventDefault();
    if (shopLoading) return;
    shopLoading = true;
    try {
      const token = getAccessToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const clickUrl = `${clickBasePath}/${unlock.programId}`;
      const res = await fetch(clickUrl, { method: 'GET', headers, redirect: 'manual' });
      const location = res.headers.get('Location') ?? clickUrl;
      window.open(location, '_blank', 'noopener,noreferrer');
    } catch {
      window.open(`${clickBasePath}/${unlock.programId}`, '_blank', 'noopener,noreferrer');
    } finally {
      shopLoading = false;
    }
  }
</script>

<article
  class="relative overflow-hidden rounded-[var(--radius-card)] border border-black/10 bg-white shadow-sm
    {unlock.isExpired ? 'opacity-60' : ''}"
>
  <!-- Ablauf-Banner -->
  {#if unlock.isExpired}
    <div class="bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-500 text-center">
      Abgelaufen am {ablaeuftFormatted}
    </div>
  {:else if isExpiringSoon}
    <div class="bg-secondary/15 px-4 py-2 text-xs font-semibold text-center text-secondary-dark">
      Läuft in {daysUntilExpiry} {daysUntilExpiry === 1 ? 'Tag' : 'Tagen'} ab
    </div>
  {/if}

  <div class="p-4">
    <!-- Header -->
    <div class="mb-3 flex items-center gap-3">
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
        {unlock.programName.charAt(0).toUpperCase()}
      </div>
      <div class="min-w-0 flex-1">
        <div class="truncate text-sm font-semibold text-heading">{unlock.programName}</div>
        <div class="truncate text-xs text-body">{unlock.description}</div>
      </div>
      <!-- Punkte-Badge -->
      <div class="shrink-0 rounded-full bg-secondary/15 px-2.5 py-1 text-xs font-semibold text-secondary">
        {unlock.pointsCost} Pt
      </div>
    </div>

    <!-- Code-Block -->
    {#if code}
      <!-- Code sichtbar -->
      <div class="mb-3 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary-light px-3 py-2">
        <code class="min-w-0 flex-1 truncate font-mono text-sm font-bold tracking-wider text-primary select-all">
          {code}
        </code>
        <button
          onclick={copyCode}
          class="shrink-0 rounded-md px-2 py-1 text-xs font-medium transition-colors
            {copied
              ? 'bg-primary text-white'
              : 'border border-primary/30 bg-white text-primary hover:bg-primary hover:text-white'}"
        >
          {copied ? '✓ Kopiert' : 'Kopieren'}
        </button>
      </div>
    {:else if !unlock.isExpired}
      <!-- Code noch nicht geladen -->
      <div class="mb-3 rounded-lg border border-dashed border-gray-300 bg-light-grey px-3 py-2.5">
        <div class="flex items-center gap-2">
          <span class="flex-1 font-mono text-sm font-bold tracking-[0.3em] text-gray-400 select-none">
            ••••••••
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
          </svg>
        </div>
        <p class="mt-1 text-xs text-body">Gespeicherter Rabattcode</p>
      </div>
      {#if fetchError}
        <p class="mb-2 text-xs text-error">{fetchError}</p>
      {/if}
    {/if}

    <!-- Footer -->
    <div class="flex items-center justify-between text-xs text-body">
      <span>Gültig bis {ablaeuftFormatted}</span>
      <span class="rounded-full bg-primary-light px-2 py-0.5 text-primary font-medium">Online</span>
    </div>
  </div>

  <!-- CTA -->
  {#if !unlock.isExpired}
    <div class="flex gap-2 px-4 pb-4">
      {#if !code}
        <button
          onclick={revealCode}
          disabled={fetching}
          class="flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-pill)] border border-primary py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white disabled:opacity-60"
        >
          {#if fetching}
            <span class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
            Wird geladen…
          {:else}
            Code anzeigen
          {/if}
        </button>
      {/if}
      <button
        onclick={handleShopClick}
        disabled={shopLoading}
        class="flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-pill)] bg-primary py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
      >
        {#if shopLoading}
          <span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
        {:else}
          Zum Shop
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        {/if}
      </button>
    </div>
  {/if}

  <!-- Stempel für Abgelaufene -->
  {#if unlock.isExpired}
    <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span
        class="select-none text-2xl font-black text-gray-800 opacity-25"
        style="transform: rotate(-15deg);"
      >
        ABGELAUFEN
      </span>
    </div>
  {/if}
</article>
