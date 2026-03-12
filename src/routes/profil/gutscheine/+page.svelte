<!-- src/routes/profil/gutscheine/+page.svelte -->
<!-- Gutschein-Übersicht: alle Gutscheine des eingeloggten Users, aufgeteilt in Aktiv/Verwendet/Abgelaufen -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getAccessToken } from '$lib/utils/auth';
  import GutscheinKarte from '$lib/components/profil/GutscheinKarte.svelte';
  import type { GutscheinData } from '$lib/components/profil/GutscheinKarte.svelte';
  import GutscheinDetailModal from '$lib/components/profil/GutscheinDetailModal.svelte';

  type Tab = 'aktiv' | 'verwendet' | 'abgelaufen';

  // ── State ─────────────────────────────────────────────────────────────────
  let loading = $state(true);
  let errorMsg = $state('');

  let aktiv = $state<GutscheinData[]>([]);
  let verwendet = $state<GutscheinData[]>([]);
  let abgelaufen = $state<GutscheinData[]>([]);

  let activeTab = $state<Tab>('aktiv');
  let selectedGutschein = $state<GutscheinData | null>(null);

  // ── Computed ──────────────────────────────────────────────────────────────
  const tabs: { key: Tab; label: string; count: () => number }[] = [
    { key: 'aktiv',      label: 'Aktiv',      count: () => aktiv.length },
    { key: 'verwendet',  label: 'Verwendet',  count: () => verwendet.length },
    { key: 'abgelaufen', label: 'Abgelaufen', count: () => abgelaufen.length }
  ];

  const currentList = $derived(
    activeTab === 'aktiv'      ? aktiv      :
    activeTab === 'verwendet'  ? verwendet  :
    abgelaufen
  );

  // ── Load ──────────────────────────────────────────────────────────────────
  onMount(async () => {
    const token = getAccessToken();
    if (!token) { goto('/login?next=/profil/gutscheine'); return; }

    try {
      const res = await fetch('/api/gutscheine', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) { goto('/login?next=/profil/gutscheine'); return; }
      if (!res.ok) throw new Error(`Fehler (${res.status})`);

      const data = await res.json();
      aktiv      = data.aktiv      ?? [];
      verwendet  = data.verwendet  ?? [];
      abgelaufen = data.abgelaufen ?? [];
    } catch (e: unknown) {
      errorMsg = e instanceof Error ? e.message : 'Fehler beim Laden.';
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head><title>Meine Gutscheine – AustroFit</title></svelte:head>

<main class="min-h-[calc(100vh-75px)] bg-gray-50 pb-24">

  <!-- ── Header ──────────────────────────────────────────────────────────── -->
  <div class="text-white" style="background:#4CAF50;">
    <div class="mx-auto max-w-2xl px-4 pt-8 pb-14">
      <a
        href="/profil"
        class="mb-4 inline-flex items-center gap-1.5 text-sm opacity-80 hover:opacity-100 transition-opacity"
      >
        ← Profil
      </a>
      <h1 class="text-2xl font-bold" style="font-family: 'Jost', sans-serif;">
        Meine Gutscheine
      </h1>
    </div>
  </div>

  <div class="mx-auto -mt-8 max-w-2xl px-4">

    {#if loading}
      <!-- Lade-Zustand -->
      <div class="rounded-2xl border border-black/10 bg-white p-12 shadow-sm">
        <div class="flex flex-col items-center gap-3">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600"></div>
          <p class="text-sm text-gray-500">Gutscheine werden geladen…</p>
        </div>
      </div>

    {:else if errorMsg}
      <!-- Fehler-Zustand -->
      <div class="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        {errorMsg}
      </div>

    {:else}

      <!-- ── Tab-Navigation ─────────────────────────────────────────────── -->
      <div class="mb-5 flex rounded-2xl border border-black/10 bg-white p-1 shadow-sm">
        {#each tabs as tab}
          {@const count = tab.count()}
          <button
            onclick={() => (activeTab = tab.key)}
            class="relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all
              {activeTab === tab.key ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}"
            style={activeTab === tab.key ? 'background:#4CAF50;' : ''}
          >
            {tab.label}
            {#if count > 0}
              <span
                class="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-xs
                  {activeTab === tab.key ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'}"
              >
                {count}
              </span>
            {/if}
          </button>
        {/each}
      </div>

      <!-- ── Karten-Liste ────────────────────────────────────────────────── -->
      {#if currentList.length === 0}
        <!-- Leerer Zustand -->
        <div class="flex flex-col items-center gap-4 rounded-2xl border border-black/10 bg-white p-12 text-center shadow-sm">
          <div class="text-5xl">🎟️</div>
          {#if activeTab === 'aktiv'}
            <div>
              <p class="font-semibold text-gray-900">Noch keine aktiven Gutscheine</p>
              <p class="mt-1 text-sm text-gray-500">
                Sammle Punkte und löse sie bei unseren Partnern ein.
              </p>
            </div>
            <a
              href="/partner"
              class="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style="background:#4CAF50;"
            >
              Partner entdecken
            </a>
          {:else}
            <p class="text-sm text-gray-500">
              {activeTab === 'verwendet'
                ? 'Noch keine eingelösten Gutscheine.'
                : 'Keine abgelaufenen Gutscheine.'}
            </p>
          {/if}
        </div>

      {:else}
        <!-- Karten-Grid: 1 Spalte auf Mobile, 2 Spalten ab md -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          {#each currentList as gutschein (gutschein.id)}
            <GutscheinKarte
              {gutschein}
              variant={activeTab}
              onclick={activeTab === 'aktiv'
                ? () => (selectedGutschein = gutschein)
                : undefined}
            />
          {/each}
        </div>
      {/if}

    {/if}
  </div>
</main>

<!-- ── Gutschein-Detail-Modal ─────────────────────────────────────────────── -->
{#if selectedGutschein}
  <GutscheinDetailModal
    gutschein={selectedGutschein}
    onclose={() => (selectedGutschein = null)}
  />
{/if}
