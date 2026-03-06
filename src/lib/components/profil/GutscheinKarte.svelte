<!-- src/lib/components/profil/GutscheinKarte.svelte -->
<!-- Zeigt einen Gutschein als Karte an. Varianten: aktiv | verwendet | abgelaufen -->
<script lang="ts" module>
  export interface GutscheinData {
    id: string;
    code: string;
    reward_titel: string;
    beschreibung: string | null;
    punkte_kosten: number;
    partner_name: string;
    erstellt_am: string;
    ablaeuft_am: string;
    eingeloest_am: string | null;
    status: 'active' | 'used';
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  interface Props {
    gutschein: GutscheinData;
    variant: 'aktiv' | 'verwendet' | 'abgelaufen';
    onclick?: () => void;
  }

  const { gutschein, variant, onclick }: Props = $props();

  let canvasEl = $state<HTMLCanvasElement | null>(null);
  let copied = $state(false);

  const isAktiv = $derived(variant === 'aktiv');

  const ablaeuftFormatted = $derived(
    new Date(gutschein.ablaeuft_am).toLocaleDateString('de-AT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  );

  const partnerInitial = $derived(
    gutschein.partner_name ? gutschein.partner_name[0].toUpperCase() : '?'
  );

  async function copyCode(e: MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(gutschein.code);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      // Fallback: ignore silently
    }
  }

  onMount(async () => {
    if (!browser || !canvasEl || variant === 'abgelaufen') return;
    try {
      const QRCode = await import('qrcode');
      await QRCode.toCanvas(canvasEl, gutschein.code, {
        width: 120,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' }
      });
    } catch {
      // QR rendering failed – code text bleibt sichtbar
    }
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
  class="relative overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition-shadow
    {isAktiv ? 'cursor-pointer hover:shadow-md' : ''}"
  onclick={isAktiv ? onclick : undefined}
>
  <!-- Inner content (mit Fade für verwendet/abgelaufen) -->
  <div class="p-4 {!isAktiv ? 'opacity-50' : ''}">

    <!-- Partner-Header -->
    <div class="mb-3 flex items-center gap-3">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
        style="background:#E8272A;"
      >
        {partnerInitial}
      </div>
      <div class="min-w-0 flex-1">
        <div class="truncate text-sm font-semibold text-gray-900">
          {gutschein.partner_name || 'Partner'}
        </div>
        <div class="truncate text-xs text-gray-500">{gutschein.reward_titel}</div>
      </div>
    </div>

    <!-- QR-Code (120px) -->
    <div class="mb-3 flex justify-center">
      {#if variant === 'abgelaufen'}
        <!-- Platzhalter statt echtem QR für Abgelaufene -->
        <div
          class="flex h-[120px] w-[120px] items-center justify-center rounded-lg bg-gray-100 text-4xl"
          style="filter: grayscale(1);"
        >
          🎟️
        </div>
      {:else}
        <canvas
          bind:this={canvasEl}
          width="120"
          height="120"
          class="rounded-lg bg-white"
          style={variant === 'verwendet' ? 'filter: grayscale(0.8);' : ''}
        ></canvas>
      {/if}
    </div>

    <!-- Code + Kopieren-Button -->
    <div class="mb-3 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
      <code class="min-w-0 flex-1 truncate font-mono text-sm font-bold tracking-wider text-gray-900">
        {gutschein.code}
      </code>
      {#if isAktiv}
        <button
          onclick={copyCode}
          class="shrink-0 rounded-md border px-2 py-1 text-xs font-medium transition-colors
            {copied
              ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
              : 'border-black/15 bg-white hover:bg-gray-50'}"
        >
          {copied ? '✓ Kopiert!' : 'Kopieren'}
        </button>
      {/if}
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between text-xs text-gray-500">
      <span>Gültig bis {ablaeuftFormatted}</span>
      {#if gutschein.eingeloest_am}
        <span class="text-gray-400">
          Eingelöst {new Date(gutschein.eingeloest_am).toLocaleDateString('de-AT')}
        </span>
      {/if}
    </div>
  </div>

  <!-- Diagonaler Text-Stempel für verwendet/abgelaufen -->
  {#if !isAktiv}
    <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span
        class="select-none text-2xl font-black text-gray-800 opacity-25"
        style="transform: rotate(-15deg);"
      >
        {variant === 'verwendet' ? 'EINGELÖST' : 'ABGELAUFEN'}
      </span>
    </div>
  {/if}
</div>
