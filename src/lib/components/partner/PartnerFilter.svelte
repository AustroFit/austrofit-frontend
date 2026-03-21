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
    { value: 'fitnessstudio', label: 'Fitnessstudio' },
    { value: 'sportgeraete', label: 'Sportgeräte' },
    { value: 'sportbekleidung', label: 'Sportbekleidung' },
    { value: 'privat-sport', label: 'Private Sportangebote' },
    { value: 'wellness', label: 'Wellness & Therme' },
    { value: 'apotheke', label: 'Apotheken' },
    { value: 'nahrungsergaenzung', label: 'Nahrungsergänzungsmittel' },
    { value: 'bio-lebensmittel', label: 'BIO-Lebensmittel' },
    { value: 'pflegeprodukte', label: 'Pflegeprodukte' }
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
        class="rounded-[var(--radius-pill)] border px-4 py-1.5 text-sm font-medium transition-colors {kategorie === k.value
          ? 'bg-primary border-primary text-white'
          : 'bg-white border-gray-200 text-body hover:border-primary hover:text-primary'}"
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
      class="rounded-[var(--radius-pill)] border border-gray-200 bg-white px-3 py-2 text-sm text-body outline-none transition focus:border-primary"
    >
      {#each regionen as r}
        <option value={r.value}>{r.label}</option>
      {/each}
    </select>

    <!-- ESG-Toggle -->
    <button
      onclick={toggleEsg}
      class="flex items-center gap-2 rounded-[var(--radius-pill)] border px-4 py-2 text-sm font-medium transition-colors
        {esg ? 'border-primary bg-primary-light text-primary' : 'border-gray-200 bg-white text-body hover:border-primary hover:text-primary'}"
    >
      🌱
      Nur nachhaltige Partner
      {#if esg}
        <span class="ml-1 text-xs text-primary">✓</span>
      {/if}
    </button>
  </div>
</div>
