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
  import { formatDateNumeric, daysUntilExpiry as calcDaysUntil } from '$lib/utils/date';
  import QRCodeCanvas from '$lib/components/QRCodeCanvas.svelte';

  interface Props {
    gutschein: GutscheinData;
    variant: 'aktiv' | 'verwendet' | 'abgelaufen';
    onclick?: () => void;
  }

  const { gutschein, variant, onclick }: Props = $props();

  let copied = $state(false);

  const isAktiv = $derived(variant === 'aktiv');

  const ablaeuftFormatted = $derived(formatDateNumeric(gutschein.ablaeuft_am));
  const daysUntilExpiry = $derived(calcDaysUntil(gutschein.ablaeuft_am));

  const isExpiringSoon = $derived(isAktiv && daysUntilExpiry <= 7 && daysUntilExpiry > 0);
  const isExpiredToday = $derived(isAktiv && daysUntilExpiry <= 0);

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
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
  class="relative overflow-hidden rounded-[var(--radius-card)] border border-black/10 bg-white shadow-sm transition-shadow
    {isAktiv ? 'cursor-pointer hover:shadow-md' : ''}"
  onclick={isAktiv ? onclick : undefined}
>
  <!-- Ablauf-Warnung (Banner oben) -->
  {#if isExpiredToday}
    <div class="bg-error/10 px-4 py-2 text-xs font-semibold text-error text-center">
      Heute abgelaufen
    </div>
  {:else if isExpiringSoon}
    <div class="bg-secondary/15 px-4 py-2 text-xs font-semibold text-center text-secondary-dark">
      Läuft in {daysUntilExpiry} {daysUntilExpiry === 1 ? 'Tag' : 'Tagen'} ab
    </div>
  {/if}

  <!-- Inner content (mit Fade für verwendet/abgelaufen) -->
  <div class="p-4 {!isAktiv ? 'opacity-50' : ''}">

    <!-- Partner-Header -->
    <div class="mb-3 flex items-center gap-3">
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
        {partnerInitial}
      </div>
      <div class="min-w-0 flex-1">
        <div class="truncate text-sm font-semibold text-heading">
          {gutschein.partner_name || 'Partner'}
        </div>
        <div class="truncate text-xs text-body">{gutschein.reward_titel}</div>
      </div>
      <!-- Punkte-Badge -->
      {#if gutschein.punkte_kosten}
        <div class="shrink-0 rounded-full bg-secondary/15 px-2.5 py-1 text-xs font-semibold text-secondary">
          {gutschein.punkte_kosten} Pt
        </div>
      {/if}
    </div>

    <!-- QR-Code (120px) -->
    <div class="mb-3 flex justify-center">
      {#if variant === 'abgelaufen'}
        <div class="flex h-[120px] w-[120px] items-center justify-center rounded-lg bg-gray-100 text-4xl" style="filter: grayscale(1);">
          🎟️
        </div>
      {:else}
        <div style={variant === 'verwendet' ? 'filter: grayscale(0.8);' : ''}>
          <QRCodeCanvas value={gutschein.code} size={120} />
        </div>
      {/if}
    </div>

    <!-- Code + Kopieren-Button -->
    <div class="mb-3 flex items-center gap-2 rounded-lg bg-light-grey px-3 py-2">
      <code class="min-w-0 flex-1 truncate font-mono text-sm font-bold tracking-wider text-heading">
        {gutschein.code}
      </code>
      {#if isAktiv}
        <button
          onclick={copyCode}
          class="shrink-0 rounded-md border px-2 py-1 text-xs font-medium transition-colors
            {copied
              ? 'border-primary/30 bg-primary-light text-primary'
              : 'border-black/15 bg-white hover:bg-gray-50'}"
        >
          {copied ? '✓ Kopiert!' : 'Kopieren'}
        </button>
      {/if}
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between text-xs text-body">
      <span>Gültig bis {ablaeuftFormatted}</span>
      {#if gutschein.eingeloest_am}
        <span class="text-gray-400">
          Eingelöst {formatDateNumeric(gutschein.eingeloest_am)}
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
