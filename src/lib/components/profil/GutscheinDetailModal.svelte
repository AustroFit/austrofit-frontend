<!-- src/lib/components/profil/GutscheinDetailModal.svelte -->
<!-- Vollbild-Modal mit großem QR-Code für einen aktiven Gutschein -->
<script lang="ts">
  import type { GutscheinData } from './GutscheinKarte.svelte';
  import { formatDateNumeric, daysUntilExpiry as calcDaysUntil } from '$lib/utils/date';
  import QRCodeCanvas from '$lib/components/QRCodeCanvas.svelte';

  interface Props {
    gutschein: GutscheinData;
    onclose: () => void;
  }

  const { gutschein, onclose }: Props = $props();

  let copied = $state(false);

  const ablaeuftFormatted = $derived(formatDateNumeric(gutschein.ablaeuft_am));
  const daysUntilExpiry = $derived(calcDaysUntil(gutschein.ablaeuft_am));

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
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
  class="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
  onclick={handleBackdropClick}
>
  <!-- Backdrop -->
  <div aria-hidden="true" class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

  <!-- Dialog-Panel -->
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="gutschein-modal-title"
    class="relative w-full max-w-sm rounded-[var(--radius-card)] bg-white p-6 shadow-xl"
  >
    <!-- Partner + Angebots-Titel -->
    <div class="mb-5 text-center">
      <p class="text-sm font-medium text-body">{gutschein.partner_name}</p>
      <h2 id="gutschein-modal-title" class="mt-1 font-heading text-xl font-bold text-heading">
        {gutschein.reward_titel}
      </h2>
      {#if gutschein.punkte_kosten}
        <span class="mt-2 inline-flex items-center rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary">
          {gutschein.punkte_kosten} Punkte eingesetzt
        </span>
      {/if}
    </div>

    <!-- QR-Code 250px -->
    <div class="mb-4 flex justify-center">
      <div class="rounded-[var(--radius-card)] border border-gray-200 bg-white p-4 shadow-sm">
        <QRCodeCanvas value={gutschein.code} size={250} margin={2} />
      </div>
    </div>

    <!-- Code monospace (groß) -->
    <div class="mb-4 rounded-xl bg-light-grey px-4 py-3 text-center">
      <p class="mb-1 text-xs text-body">Dein Gutschein-Code</p>
      <p class="font-mono text-2xl font-bold tracking-[0.15em] text-heading">
        {gutschein.code}
      </p>
    </div>

    <!-- Kopieren-Button -->
    <button
      onclick={copyCode}
      class="mb-4 w-full rounded-xl border py-2.5 text-sm font-semibold transition-colors
        {copied
          ? 'border-primary/30 bg-primary-light text-primary'
          : 'border-black/15 hover:bg-gray-50 text-heading'}"
    >
      {copied ? '✓ Code kopiert!' : 'Code kopieren'}
    </button>

    <!-- Einlöse-Anleitung -->
    <div class="mb-4 rounded-xl border border-primary/20 bg-primary-light px-4 py-3 text-sm text-primary">
      Zeige diesen QR-Code oder den Code im Geschäft vor,
      oder gib den Code bei der Online-Bestellung ein.
    </div>

    <!-- Gültig bis + Ablaufwarnung -->
    {#if daysUntilExpiry <= 7 && daysUntilExpiry > 0}
      <p class="mb-3 text-center text-xs font-semibold text-secondary">
        Läuft in {daysUntilExpiry} {daysUntilExpiry === 1 ? 'Tag' : 'Tagen'} ab ({ablaeuftFormatted})
      </p>
    {:else}
      <p class="mb-4 text-center text-xs text-body">Gültig bis {ablaeuftFormatted}</p>
    {/if}

    <!-- Schließen -->
    <button
      onclick={onclose}
      class="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
    >
      Schließen
    </button>
  </div>
</div>
