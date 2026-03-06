<!-- src/lib/components/profil/GutscheinDetailModal.svelte -->
<!-- Vollbild-Modal mit großem QR-Code für einen aktiven Gutschein -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import type { GutscheinData } from './GutscheinKarte.svelte';

  interface Props {
    gutschein: GutscheinData;
    onclose: () => void;
  }

  const { gutschein, onclose }: Props = $props();

  let canvasEl = $state<HTMLCanvasElement | null>(null);
  let copied = $state(false);

  const ablaeuftFormatted = $derived(
    new Date(gutschein.ablaeuft_am).toLocaleDateString('de-AT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  );

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(gutschein.code);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      // Fallback: ignore silently
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onclose();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose();
  }

  onMount(async () => {
    if (!browser || !canvasEl) return;
    try {
      const QRCode = await import('qrcode');
      await QRCode.toCanvas(canvasEl, gutschein.code, {
        width: 250,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });
    } catch {
      // QR rendering failed – code text bleibt sichtbar
    }
  });
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
  class="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
  onclick={handleBackdropClick}
>
  <!-- Backdrop -->
  <div
    aria-hidden="true"
    class="absolute inset-0 bg-black/50 backdrop-blur-sm"
  ></div>

  <!-- Dialog-Panel -->
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="gutschein-modal-title"
    class="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
  >
    <!-- Partner + Angebots-Titel -->
    <div class="mb-5 text-center">
      <p class="text-sm font-medium text-gray-500">{gutschein.partner_name}</p>
      <h2
        id="gutschein-modal-title"
        class="mt-1 text-xl font-bold text-gray-900"
        style="font-family: 'Syne', sans-serif;"
      >
        {gutschein.reward_titel}
      </h2>
    </div>

    <!-- QR-Code 250px (zentriert, weißer Hintergrund für Scan-Kompatibilität) -->
    <div class="mb-4 flex justify-center">
      <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <canvas
          bind:this={canvasEl}
          width="250"
          height="250"
          class="block rounded-xl"
        ></canvas>
      </div>
    </div>

    <!-- Code monospace (groß) -->
    <div class="mb-4 rounded-xl bg-gray-50 px-4 py-3 text-center">
      <p class="mb-1 text-xs text-gray-400">Dein Gutschein-Code</p>
      <p class="font-mono text-2xl font-bold tracking-[0.15em] text-gray-900">
        {gutschein.code}
      </p>
    </div>

    <!-- Kopieren-Button -->
    <button
      onclick={copyCode}
      class="mb-4 w-full rounded-xl border py-2.5 text-sm font-semibold transition-colors
        {copied
          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
          : 'border-black/15 hover:bg-gray-50'}"
    >
      {copied ? '✓ Code kopiert!' : 'Code kopieren'}
    </button>

    <!-- Einlöse-Anleitung -->
    <div class="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
      Zeige diesen QR-Code oder den Code im Geschäft vor,
      oder gib den Code bei der Online-Bestellung ein.
    </div>

    <!-- Gültig bis -->
    <p class="mb-4 text-center text-xs text-gray-400">Gültig bis {ablaeuftFormatted}</p>

    <!-- Schließen -->
    <button
      onclick={onclose}
      class="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      style="background:#E8272A;"
    >
      Schließen
    </button>
  </div>
</div>
