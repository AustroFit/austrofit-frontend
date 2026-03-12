<!-- src/lib/components/partner/AngebotKarte.svelte -->
<!-- Einzelne Angebots-Karte mit Einlösungs-Button -->
<script lang="ts">
  import EinloesungsModal from './EinloesungsModal.svelte';

  interface Reward {
    id: string;
    titel: string;
    beschreibung?: string;
    punkte_kosten: number;
    gueltig_bis?: string;
  }

  interface Partner {
    id: string;
    name: string;
    kategorie?: string;
    adresse?: string;
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

  const gueltigBis = $derived(
    reward.gueltig_bis
      ? new Date(reward.gueltig_bis).toLocaleDateString('de-AT', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      : null
  );

  const abgelaufen = $derived(
    reward.gueltig_bis ? new Date(reward.gueltig_bis) < new Date() : false
  );

  const kategorieBadgeStyle: Record<string, string> = {
    fitness:    'background:#dbeafe; color:#1d4ed8;',
    ernaehrung: 'background:#dcfce7; color:#15803d;',
    apotheke:   'background:#fef3c7; color:#b45309;',
    wellness:   'background:#f3e8ff; color:#7c3aed;'
  };

  const kategorieLabel: Record<string, string> = {
    fitness:    'Fitness',
    ernaehrung: 'Ernährung & Bio',
    apotheke:   'Apotheke & Gesundheit',
    wellness:   'Wellness'
  };

  function handleRedeemed(newPoints: number) {
    modalOpen = false;
    onredeemed(newPoints);
  }
</script>

<div
  class="relative flex flex-col rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md
    {abgelaufen ? 'opacity-50' : ''}"
>
  <!-- Partner-Header -->
  <div class="mb-3 flex items-start justify-between gap-2">
    <div class="flex items-center gap-2 min-w-0">
      {#if partner.logo_url}
        <img src={partner.logo_url} alt={partner.name} class="h-8 w-8 rounded-full object-cover shrink-0" />
      {/if}
      <div class="min-w-0">
        <p class="truncate text-sm font-semibold text-gray-900">{partner.name}</p>
        {#if partner.kategorie}
          <span
            class="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
            style={kategorieBadgeStyle[partner.kategorie] ?? 'background:#f3f4f6; color:#374151;'}
          >
            {kategorieLabel[partner.kategorie] ?? partner.kategorie}
          </span>
        {/if}
      </div>
    </div>

    <!-- ESG-Badge -->
    {#if partner.esg_zertifiziert}
      <span
        class="shrink-0 flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
        style="background:#f0fdf4; color:#16a34a; border-color:#bbf7d0;"
        title="Nachhaltig zertifizierter Partner"
      >
        🌱 Nachhaltig
      </span>
    {/if}
  </div>

  <!-- Angebots-Inhalt -->
  <div class="flex-1">
    <h3 class="text-base font-bold text-gray-900 leading-tight" style="font-family:'Syne',sans-serif;">
      {reward.titel}
    </h3>
    {#if reward.beschreibung}
      <p class="mt-1 line-clamp-2 text-sm text-gray-500">{reward.beschreibung}</p>
    {/if}
  </div>

  <!-- Punkte + Ablauf -->
  <div class="mt-3 flex items-center justify-between gap-2">
    <div>
      <span class="text-2xl font-bold" style="color:#2E7D32;">{reward.punkte_kosten}P</span>
      {#if gueltigBis && !abgelaufen}
        <p class="text-xs text-gray-400">Gültig bis {gueltigBis}</p>
      {:else if abgelaufen}
        <p class="text-xs text-red-500">Abgelaufen</p>
      {/if}
    </div>

    <!-- Einlösen-Button -->
    {#if abgelaufen}
      <button
        disabled
        class="rounded-xl px-4 py-2 text-sm font-semibold text-white opacity-40 cursor-not-allowed"
        style="background:#6b7280;"
      >
        Abgelaufen
      </button>
    {:else if !isLoggedIn}
      <a
        href="/login?next=/partner"
        class="rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        style="background:#2E7D32;"
      >
        Anmelden
      </a>
    {:else if hatGenugPunkte}
      <button
        onclick={() => (modalOpen = true)}
        class="rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        style="background:#2E7D32;"
      >
        Einlösen
      </button>
    {:else}
      <div class="text-right">
        <button
          disabled
          class="rounded-xl px-4 py-2 text-sm font-semibold text-white cursor-not-allowed"
          style="background:#6b7280;"
          title="Noch {fehlendePunkte} Punkte fehlen"
        >
          Einlösen
        </button>
        <p class="mt-0.5 text-xs text-gray-400">Noch {fehlendePunkte}P fehlen</p>
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
