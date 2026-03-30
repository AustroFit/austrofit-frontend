<!-- src/lib/components/partner/AngebotKarte.svelte -->
<!-- Einzelne Angebots-Karte mit Einlösungs-Button -->
<script lang="ts">
  import EinloesungsModal from './EinloesungsModal.svelte';
  import { formatDateNumeric } from '$lib/utils/date';
  import { KATEGORIE_LABELS, KATEGORIE_BADGE_STYLE } from '$lib/data/categoryMaps';

  interface Reward {
    id: string;
    titel: string;
    beschreibung?: string | null;
    punkte_kosten: number;
    gueltig_bis?: string | null;
  }

  interface Partner {
    id: string;
    name: string;
    kategorie?: string[];
    adresse?: string | null;
    esg_zertifiziert?: boolean;
    logo_url?: string | null;
  }

  interface Props {
    reward: Reward;
    partner: Partner;
    userPoints: number;
    isLoggedIn?: boolean;
    onredeemed: (newPoints: number) => void;
  }

  const { reward, partner, userPoints, isLoggedIn = false, onredeemed }: Props = $props();

  let modalOpen = $state(false);

  const hatGenugPunkte = $derived(userPoints >= reward.punkte_kosten);
  const fehlendePunkte = $derived(reward.punkte_kosten - userPoints);

  const gueltigBis = $derived(reward.gueltig_bis ? formatDateNumeric(reward.gueltig_bis) : null);

  const abgelaufen = $derived(
    reward.gueltig_bis ? new Date(reward.gueltig_bis) < new Date() : false
  );


  function handleRedeemed(newPoints: number) {
    modalOpen = false;
    onredeemed(newPoints);
  }
</script>

<div
  class="relative flex flex-col rounded-[var(--radius-card)] border border-gray-200 bg-white p-5 shadow-[var(--shadow-s)] transition-shadow hover:shadow-md
    {abgelaufen ? 'opacity-50' : ''}"
>
  <!-- Partner-Header -->
  <div class="mb-3 flex items-start justify-between gap-2">
    <div class="flex items-center gap-2 min-w-0">
      {#if partner.logo_url}
        <img src={partner.logo_url} alt={partner.name} class="h-8 w-8 rounded-full object-cover shrink-0" />
      {/if}
      <div class="min-w-0">
        <p class="truncate text-sm font-semibold text-heading">{partner.name}</p>
        {#if partner.kategorie && partner.kategorie.length > 0}
          <span
            class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {KATEGORIE_BADGE_STYLE[partner.kategorie[0]] ?? 'bg-gray-100 text-gray-700'}"
          >
            {KATEGORIE_LABELS[partner.kategorie[0]] ?? partner.kategorie[0]}
          </span>
        {/if}
      </div>
    </div>

    <!-- ESG-Badge -->
    {#if partner.esg_zertifiziert}
      <span
        class="shrink-0 flex items-center gap-1 rounded-[var(--radius-pill)] border border-primary/20 bg-primary-light px-2 py-0.5 text-xs font-medium text-primary"
        title="Nachhaltig zertifizierter Partner"
      >
        🌱 Nachhaltig
      </span>
    {/if}
  </div>

  <!-- Angebots-Inhalt -->
  <div class="flex-1">
    <h3 class="font-heading text-base font-bold text-heading leading-tight">
      {reward.titel}
    </h3>
    {#if reward.beschreibung}
      <p class="mt-1 line-clamp-2 text-sm text-body">{reward.beschreibung}</p>
    {/if}
  </div>

  <!-- Punkte + Ablauf -->
  <div class="mt-3 flex items-center justify-between gap-2">
    <div>
      <span class="text-2xl font-bold text-primary">{reward.punkte_kosten}P</span>
      {#if gueltigBis && !abgelaufen}
        <p class="text-xs text-body/60">Gültig bis {gueltigBis}</p>
      {:else if abgelaufen}
        <p class="text-xs text-error">Abgelaufen</p>
      {/if}
    </div>

    <!-- Einlösen-Button -->
    {#if abgelaufen}
      <button
        disabled
        class="rounded-[var(--radius-pill)] px-4 py-2 text-sm font-semibold text-white/60 bg-gray-300 opacity-60 cursor-not-allowed"
      >
        Abgelaufen
      </button>
    {:else if !isLoggedIn}
      <a
        href="/login?next=/belohnung"
        class="rounded-[var(--radius-pill)] px-4 py-2 text-sm font-semibold text-white bg-primary transition hover:bg-primary-dark"
      >
        Anmelden
      </a>
    {:else if hatGenugPunkte}
      <button
        onclick={() => (modalOpen = true)}
        class="rounded-[var(--radius-pill)] px-4 py-2 text-sm font-semibold text-white bg-primary transition hover:bg-primary-dark"
      >
        Einlösen
      </button>
    {:else}
      <div class="text-right">
        <button
          disabled
          class="rounded-[var(--radius-pill)] px-4 py-2 text-sm font-semibold text-white bg-gray-300 cursor-not-allowed"
          title="Noch {fehlendePunkte} Punkte fehlen"
        >
          Einlösen
        </button>
        <p class="mt-0.5 text-xs text-body/60">Noch {fehlendePunkte}P fehlen</p>
      </div>
    {/if}
  </div>
</div>

{#if modalOpen}
  <EinloesungsModal
    {reward}
    {partner}
    {userPoints}
    onclose={() => (modalOpen = false)}
    onredeemed={handleRedeemed}
  />
{/if}
