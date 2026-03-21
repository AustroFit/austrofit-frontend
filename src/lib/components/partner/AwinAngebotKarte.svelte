<!-- src/lib/components/partner/AwinAngebotKarte.svelte -->
<!-- AWIN-Affiliate-Karte mit gesperrtem Rabattcode (Freischaltung via Punkte) -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { getAccessToken } from '$lib/utils/auth';
  import { formatDateNumeric } from '$lib/utils/date';
  import { AWIN_KATEGORIE_LABELS } from '$lib/data/categoryMaps';

  interface AwinPromotionPublic {
    id: string;
    type: string;
    description: string;
    endDate: string | null;
    pointsCost: number;
  }

  interface Props {
    programId: number;
    name: string;
    logoUrl?: string | null;
    displayUrl?: string;
    description?: string | null;
    category?: string | null;
    targetUrl?: string;
    promotions?: AwinPromotionPublic[];
    userPoints?: number;
    isLoggedIn?: boolean;
    onUnlocked?: (pointsSpent: number) => void;
  }

  const {
    programId,
    name,
    logoUrl,
    displayUrl,
    description,
    category,
    targetUrl,
    promotions = [],
    userPoints = 0,
    isLoggedIn = false,
    onUnlocked
  }: Props = $props();

  // Erste Promotion als Haupt-Promo
  const promo = $derived(promotions[0] ?? null);

  // Gespeicherter Code aus localStorage (falls bereits freigeschaltet)
  let unlockedCode = $state<string | null>(null);
  let unlocking = $state(false);
  let unlockError = $state('');
  let copied = $state(false);
  let shopLoading = $state(false);

  const storageKey = $derived(promo ? `austrofit_awin_${promo.id}` : '');

  onMount(() => {
    if (storageKey) {
      unlockedCode = localStorage.getItem(storageKey);
    }
  });

  async function handleUnlock() {
    if (!promo || unlocking) return;

    if (!isLoggedIn) {
      window.location.href = `/login?next=/belohnung`;
      return;
    }

    unlocking = true;
    unlockError = '';

    try {
      const token = getAccessToken();
      const res = await fetch('/api/awin/unlock-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ promoId: promo.id })
      });

      const data = await res.json();

      if (!res.ok) {
        unlockError = data.error ?? 'Fehler beim Freischalten';
        return;
      }

      unlockedCode = data.code;
      localStorage.setItem(storageKey, data.code);
      if (!data.alreadyUnlocked && promo) onUnlocked?.(promo.pointsCost);
    } catch {
      unlockError = 'Verbindungsfehler – bitte erneut versuchen';
    } finally {
      unlocking = false;
    }
  }

  async function copyCode() {
    if (!unlockedCode) return;
    try {
      await navigator.clipboard.writeText(unlockedCode);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch { /* ignore */ }
  }

  function getClickUrl(): string {
    const base = `/api/awin/click/${programId}`;
    if (targetUrl) return `${base}?url=${encodeURIComponent(targetUrl)}`;
    return base;
  }

  async function handleShopClick(e: MouseEvent) {
    e.preventDefault();
    if (shopLoading) return;
    shopLoading = true;
    try {
      const token = getAccessToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(getClickUrl(), { method: 'GET', headers, redirect: 'manual' });
      const location = res.headers.get('Location') ?? getClickUrl();
      window.open(location, '_blank', 'noopener,noreferrer');
    } catch {
      window.open(getClickUrl(), '_blank', 'noopener,noreferrer');
    } finally {
      shopLoading = false;
    }
  }

  const formatDate = formatDateNumeric;

  const canAfford = $derived(userPoints >= (promo?.pointsCost ?? 0));

  const labelText = category ? (AWIN_KATEGORIE_LABELS[category] ?? category) : null;
</script>

<article class="flex flex-col rounded-[var(--radius-card)] border border-gray-200 bg-white shadow-[var(--shadow-s)] overflow-hidden">

  <!-- Partner-Header -->
  <div class="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-100">
    {#if logoUrl}
      <img
        src={logoUrl}
        alt={name}
        class="h-10 w-10 rounded-lg object-contain border border-gray-200 p-1 bg-white flex-shrink-0"
        loading="lazy"
      />
    {:else}
      <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-white text-sm font-bold">
        {name.charAt(0).toUpperCase()}
      </div>
    {/if}

    <div class="min-w-0">
      <p class="truncate font-semibold text-heading text-sm">{name}</p>
      {#if displayUrl}
        <p class="truncate text-xs text-body/60">{displayUrl}</p>
      {/if}
    </div>

    <span class="ml-auto flex-shrink-0 rounded-[var(--radius-pill)] bg-primary px-2.5 py-0.5 text-xs font-medium text-white">
      Online
    </span>
  </div>

  <!-- Content -->
  <div class="flex flex-1 flex-col gap-3 px-4 py-3">

    {#if labelText}
      <span class="w-fit rounded-[var(--radius-pill)] bg-primary-light px-2 py-0.5 text-xs font-medium text-primary">
        {labelText}
      </span>
    {/if}

    {#if promo}
      <p class="text-sm text-body line-clamp-2">{promo.description}</p>

      <!-- Code-Block: gesperrt oder freigeschaltet -->
      {#if unlockedCode}
        <!-- ✅ Freigeschaltet -->
        <div class="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary-light px-3 py-2">
          <span class="flex-1 font-mono text-sm font-bold tracking-widest text-primary select-all">
            {unlockedCode}
          </span>
          <button
            onclick={copyCode}
            class="flex-shrink-0 rounded-md px-2 py-1 text-xs font-medium transition-colors
              {copied ? 'bg-primary text-white' : 'bg-white border border-primary/30 text-primary hover:bg-primary hover:text-white'}"
          >
            {copied ? '✓ Kopiert' : 'Kopieren'}
          </button>
        </div>
        {#if promo.endDate}
          <p class="text-xs text-body/50">Gültig bis {formatDate(promo.endDate)}</p>
        {/if}

      {:else}
        <!-- 🔒 Gesperrt -->
        <div class="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2.5">
          <div class="flex items-center gap-2">
            <!-- Gesperrter Code als Platzhalter -->
            <span class="flex-1 font-mono text-sm font-bold tracking-[0.3em] text-gray-400 select-none">
              ••••••••••••
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
            </svg>
          </div>
          <p class="mt-1 text-xs text-gray-400">
            Rabattcode gesperrt
            {#if promo.endDate}· Gültig bis {formatDate(promo.endDate)}{/if}
          </p>
        </div>

        {#if unlockError}
          <p class="text-xs text-error">{unlockError}</p>
        {/if}
      {/if}

    {:else if description}
      <p class="text-sm text-body line-clamp-3">{description}</p>
    {/if}
  </div>

  <!-- CTA-Bereich -->
  <div class="flex flex-col gap-2 px-4 pb-4">

    {#if promo && !unlockedCode}
      <!-- Freischalten-Button -->
      <button
        onclick={handleUnlock}
        disabled={unlocking || (!isLoggedIn ? false : !canAfford)}
        class="flex w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] py-2.5 text-sm font-semibold transition
          {!isLoggedIn
            ? 'bg-gray-100 text-body hover:bg-gray-200'
            : canAfford
              ? 'bg-secondary text-white hover:bg-secondary-dark'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'}"
      >
        {#if unlocking}
          <span class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
          Wird freigeschaltet…
        {:else if !isLoggedIn}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
          </svg>
          Anmelden & Freischalten
        {:else if !canAfford}
          Zu wenig Punkte ({userPoints}P / {promo.pointsCost}P)
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
          </svg>
          Freischalten – {promo.pointsCost}P
        {/if}
      </button>

    {:else}
      <!-- Code freigeschaltet → Shop-Button -->
      <button
        onclick={handleShopClick}
        disabled={shopLoading}
        class="flex w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] py-2.5 text-sm font-semibold text-white bg-primary transition hover:bg-primary-dark disabled:opacity-60"
      >
        {#if shopLoading}
          <span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
          Wird geöffnet…
        {:else}
          Code einlösen im Shop
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        {/if}
      </button>
      <p class="text-center text-xs text-body/60">Code kopieren, dann im Shop beim Checkout eingeben</p>
    {/if}

  </div>
</article>
