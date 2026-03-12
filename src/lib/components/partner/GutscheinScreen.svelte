<!-- src/lib/components/partner/GutscheinScreen.svelte -->
<!-- Zeigt den erstellten Gutschein mit Code und QR-Code an -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  export interface Gutschein {
    id: string;
    code: string;
    ablaeuft_am: string;
    reward_titel: string;
    punkte_kosten: number;
  }

  interface Props {
    gutschein: Gutschein;
    partnerName?: string;
    partnerAdresse?: string;
    onclose: () => void;
  }

  const { gutschein, partnerName = '', partnerAdresse = '', onclose }: Props = $props();

  let canvasEl = $state<HTMLCanvasElement | null>(null);
  let showAnim = $state(false);

  const ablaeuftFormatted = $derived(
    gutschein.ablaeuft_am
      ? new Date(gutschein.ablaeuft_am).toLocaleDateString('de-AT', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      : ''
  );

  onMount(async () => {
    if (!browser) return;
    showAnim = true;

    // QR-Code auf Canvas rendern
    if (canvasEl) {
      try {
        const QRCode = await import('qrcode');
        await QRCode.toCanvas(canvasEl, gutschein.code, {
          width: 200,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' }
        });
      } catch {
        // QR-Code konnte nicht gerendert werden – Code-Text reicht aus
      }
    }
  });
</script>

<div class="flex flex-col items-center gap-6 p-2">
  <!-- Erfolgs-Animation -->
  <div
    class="flex h-16 w-16 items-center justify-center rounded-full text-3xl transition-transform duration-500
      {showAnim ? 'scale-100' : 'scale-0'}"
    style="background:#dcfce7;"
  >
    🎉
  </div>

  <div class="text-center">
    <h3 class="text-lg font-bold text-gray-900" style="font-family:'Syne',sans-serif;">
      Gutschein aktiviert!
    </h3>
    <p class="mt-1 text-sm text-gray-500">{gutschein.reward_titel}</p>
    {#if partnerName}
      <p class="text-xs text-gray-400">{partnerName}</p>
    {/if}
  </div>

  <!-- QR-Code -->
  <div class="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <canvas bind:this={canvasEl} width="200" height="200" class="rounded-xl"></canvas>
    <div class="rounded-lg bg-gray-50 px-4 py-2 text-center">
      <p class="text-xs text-gray-400 mb-1">Dein Gutschein-Code</p>
      <p class="text-2xl font-bold tracking-[0.2em] text-gray-900">{gutschein.code}</p>
    </div>
  </div>

  <!-- Anleitung -->
  <div class="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
    Zeige diesen Code im Geschäft vor oder gib ihn online ein.
  </div>

  <!-- Ablauf + Adresse -->
  <div class="w-full text-center text-xs text-gray-400 flex flex-col gap-1">
    {#if ablaeuftFormatted}
      <span>Gültig bis: {ablaeuftFormatted}</span>
    {/if}
    {#if partnerAdresse}
      <span>{partnerAdresse}</span>
    {/if}
  </div>

  <!-- Buttons -->
  <div class="flex w-full flex-col gap-2">
    <a
      href="/profil/gutscheine"
      class="block w-full rounded-xl py-2.5 text-center text-sm font-semibold text-white transition"
      style="background:#2E7D32;"
    >
      Meine Gutscheine ansehen
    </a>
    <button
      onclick={onclose}
      class="w-full rounded-xl border border-black/15 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
    >
      Schließen
    </button>
  </div>
</div>
