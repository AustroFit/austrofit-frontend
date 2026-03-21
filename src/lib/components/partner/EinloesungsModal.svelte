<!-- src/lib/components/partner/EinloesungsModal.svelte -->
<!-- Bestätigungs-Modal vor der Einlösung + Gutschein-Screen nach Erfolg -->
<script lang="ts">
  import { onMount } from 'svelte';
  import GutscheinScreen from './GutscheinScreen.svelte';
  import type { Gutschein } from './GutscheinScreen.svelte';
  import { getAccessToken } from '$lib/utils/auth';
  import { track } from '$lib/utils/mixpanel';

  interface Reward {
    id: string;
    titel: string;
    beschreibung?: string;
    punkte_kosten: number;
  }

  interface Partner {
    id: string;
    name: string;
    adresse?: string;
  }

  interface Props {
    reward: Reward;
    partner: Partner;
    userPoints: number;
    onclose: () => void;
    onredeemed: (newPoints: number) => void;
  }

  const { reward, partner, userPoints, onclose, onredeemed }: Props = $props();

  onMount(() => {
    track('reward_viewed', {
      reward_id: reward.id,
      reward_titel: reward.titel,
      punkte_kosten: reward.punkte_kosten,
      partner_id: partner.id,
      partner_name: partner.name
    });
  });

  let loading = $state(false);
  let error = $state('');
  let gutschein = $state<Gutschein | null>(null);

  const hatGenugPunkte = $derived(userPoints >= reward.punkte_kosten);
  const punkteDanach = $derived(userPoints - reward.punkte_kosten);

  async function einloesen() {
    if (!hatGenugPunkte || loading) return;
    loading = true;
    error = '';

    try {
      const token = getAccessToken();
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reward_id: reward.id })
      });

      const data = await res.json();
      if (!res.ok) {
        error = data?.error ?? `Fehler (${res.status})`;
        return;
      }

      gutschein = data.gutschein;
      track('voucher_redeemed', {
        reward_id: reward.id,
        reward_titel: reward.titel,
        punkte_kosten: reward.punkte_kosten,
        partner_id: partner.id,
        partner_name: partner.name
      });
      onredeemed(punkteDanach);
    } catch {
      error = 'Netzwerkfehler. Kein Punkt-Abzug erfolgt – bitte versuche es erneut.';
    } finally {
      loading = false;
    }
  }

  function closeModal(e: MouseEvent) {
    if ((e.target as HTMLElement).dataset.overlay === 'true') onclose();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Wrapper für Overlay + Panel -->
<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
  <!-- Backdrop (aria-hidden: nur visuell, kein Focus-Trap nötig) -->
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    aria-hidden="true"
    class="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
    onclick={closeModal}
  ></div>

  <!-- Dialog panel -->
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
    class="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
  >
    {#if gutschein}
      <!-- Gutschein-Screen nach erfolgreicher Einlösung -->
      <GutscheinScreen
        {gutschein}
        partnerName={partner.name}
        partnerAdresse={partner.adresse}
        onclose={onclose}
      />
    {:else}
      <!-- Bestätigung -->
      <h2 id="modal-title" class="mb-1 text-xl font-bold font-heading text-heading">
        Angebot einlösen
      </h2>

      <div class="mb-5 mt-3 rounded-xl bg-gray-50 p-4">
        <p class="font-semibold text-gray-900">{reward.titel}</p>
        <p class="text-sm text-gray-500">{partner.name}</p>
        {#if reward.beschreibung}
          <p class="mt-1 text-xs text-gray-400">{reward.beschreibung}</p>
        {/if}
      </div>

      <!-- Punkte-Übersicht -->
      <div class="mb-5 flex flex-col gap-1.5 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-500">Deine aktuellen Punkte</span>
          <span class="font-semibold">{userPoints}P</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Kosten dieses Angebots</span>
          <span class="font-semibold text-primary">−{reward.punkte_kosten}P</span>
        </div>
        <div class="my-1 border-t border-black/10"></div>
        <div class="flex justify-between font-semibold">
          <span>Danach verbleibend</span>
          <span class={punkteDanach < 0 ? 'text-error' : ''}>{Math.max(0, punkteDanach)}P</span>
        </div>
      </div>

      {#if error}
        <div class="mb-4 rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          <p>{error}</p>
          {#if error.includes('Netzwerkfehler')}
            <button
              onclick={einloesen}
              class="mt-2 text-xs font-medium underline"
            >Erneut versuchen</button>
          {/if}
        </div>
      {/if}

      <div class="flex gap-3">
        <button
          onclick={onclose}
          class="flex-1 rounded-xl border border-black/15 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
        >
          Abbrechen
        </button>
        <button
          onclick={einloesen}
          disabled={!hatGenugPunkte || loading}
          class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition disabled:opacity-50
            {hatGenugPunkte ? 'bg-primary' : 'bg-gray-500'}"
        >
          {#if loading}
            Wird eingelöst…
          {:else}
            Jetzt einlösen
          {/if}
        </button>
      </div>
    {/if}
  </div>
</div>
