<!-- src/lib/components/partner/PartnerFilter.svelte -->
<!-- Kategorie-Chips, Regions-Dropdown und ESG-Toggle -->
<script lang="ts">
  interface Props {
    kategorie: string;
    region: string;
    esg: boolean;
    onchange: (filter: { kategorie: string; region: string; esg: boolean }) => void;
  }

  const { kategorie, region, esg, onchange }: Props = $props();

  const kategorien = [
    { value: '', label: 'Alle' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'ernaehrung', label: 'Ernährung & Bio' },
    { value: 'apotheke', label: 'Apotheke & Gesundheit' },
    { value: 'wellness', label: 'Wellness' }
  ];

  const regionen = [
    { value: '', label: 'Alle Regionen' },
    { value: 'wien', label: 'Wien' },
    { value: 'niederoesterreich', label: 'Niederösterreich' }
  ];

  function setKategorie(val: string) {
    onchange({ kategorie: val, region, esg });
  }

  function setRegion(val: string) {
    onchange({ kategorie, region: val, esg });
  }

  function toggleEsg() {
    onchange({ kategorie, region, esg: !esg });
  }
</script>

<div class="flex flex-col gap-3">
  <!-- Kategorie-Chips -->
  <div class="flex flex-wrap gap-2">
    {#each kategorien as k}
      <button
        onclick={() => setKategorie(k.value)}
        class="rounded-full border px-4 py-1.5 text-sm font-medium transition-colors"
        style={kategorie === k.value
          ? 'background:#2E7D32; color:white; border-color:#2E7D32;'
          : 'background:white; color:#374151; border-color:#d1d5db;'}
      >
        {k.label}
      </button>
    {/each}
  </div>

  <!-- Regions-Dropdown + ESG-Toggle -->
  <div class="flex flex-wrap items-center gap-3">
    <select
      value={region}
      onchange={(e) => setRegion((e.currentTarget as HTMLSelectElement).value)}
      class="rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-gray-400"
    >
      {#each regionen as r}
        <option value={r.value}>{r.label}</option>
      {/each}
    </select>

    <!-- ESG-Toggle -->
    <button
      onclick={toggleEsg}
      class="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors
        {esg ? 'border-green-600 bg-green-50 text-green-700' : 'border-black/15 bg-white text-gray-600 hover:bg-gray-50'}"
    >
      <span style="color:#16a34a;">🌱</span>
      Nur nachhaltige Partner
      {#if esg}
        <span class="ml-1 text-xs text-green-600">✓</span>
      {/if}
    </button>
  </div>
</div>
