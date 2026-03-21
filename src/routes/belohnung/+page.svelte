<!-- src/routes/belohnung/+page.svelte -->
<!-- Belohnungs-Seite: Aktiv / Archiv / Offen (AWIN + Direktus Gutscheine) -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { getValidAccessToken } from '$lib/utils/auth';
  import AwinAngebotKarte from '$lib/components/partner/AwinAngebotKarte.svelte';
  import AngebotKarte from '$lib/components/partner/AngebotKarte.svelte';
  import GutscheinKarte from '$lib/components/profil/GutscheinKarte.svelte';
  import type { GutscheinData } from '$lib/components/profil/GutscheinKarte.svelte';
  import GutscheinDetailModal from '$lib/components/profil/GutscheinDetailModal.svelte';
  import AwinOnlineCode from '$lib/components/profil/AwinOnlineCode.svelte';
  import type { AwinUnlockEntry } from '$lib/components/profil/AwinOnlineCode.svelte';
  import { KATEGORIE_LABELS } from '$lib/data/categoryMaps';

  interface AwinPromotionPublic {
    id: string;
    type: string;
    description: string;
    endDate: string | null;
    pointsCost: number;
  }

  interface AwinProgram {
    id: number;
    name: string;
    url: string;
    logoUrl: string | null;
    displayUrl: string;
    description: string | null;
    category: string | null;
    promotions: AwinPromotionPublic[];
  }

  interface DirektusPartner {
    id: string;
    name: string;
    logo_url: string | null;
    kategorie: string[];
    region: string | null;
    esg_zertifiziert: boolean;
    adresse: string | null;
  }

  interface DirektusReward {
    id: string;
    titel: string;
    beschreibung: string | null;
    punkte_kosten: number;
    gueltig_bis: string | null;
  }

  type Tab = 'aktiv' | 'archiv' | 'offen';

  const tabs: { key: Tab; label: string }[] = [
    { key: 'offen',  label: 'Offen'  },
    { key: 'aktiv',  label: 'Aktiv'  },
    { key: 'archiv', label: 'Archiv' },
  ];

  // Predefined categories for Aktiv filter chips (Direktus regional partners + AWIN categories)
  const aktivKategorien = [
    'Fitnessstudio',
    'Sportgeräte',
    'Sportbekleidung',
    'Private Sportangebote',
    'Wellness & Therme',
    'Apotheken',
    'Nahrungsergänzungsmittel',
    'BIO-Lebensmittel',
    'Pflegeprodukte'
  ];

  const awinKategorieLabels: Record<string, string> = {
    'Health/Beauty': 'Gesundheit & Beauty',
    'Sport/Fitness': 'Sport & Fitness',
    'Food/Drink': 'Ernährung',
    Pharmacy: 'Apotheke',
    Wellness: 'Wellness',
    Sportgeräte: 'Sportgeräte',
    Sportbekleidung: 'Sportbekleidung',
    'BIO-Lebensmittel': 'BIO-Lebensmittel',
    Pflegeprodukte: 'Pflegeprodukte',
    'Private Sportangebote': 'Sportangebote',
    'Wellness & Therme': 'Wellness & Therme',
    Nahrungsergänzung: 'Nahrungsergänzung'
  };

  // ── State ─────────────────────────────────────────────────────────────
  let loading = $state(true);
  let errorMsg = $state('');
  let awinPrograms = $state<AwinProgram[]>([]);
  let userPoints = $state(0);
  let isLoggedIn = $state(false);

  let aktiv = $state<GutscheinData[]>([]);
  let verwendet = $state<GutscheinData[]>([]);
  let abgelaufen = $state<GutscheinData[]>([]);
  let onlineUnlocks = $state<AwinUnlockEntry[]>([]);

  let activeTab = $state<Tab>('offen');
  let selectedGutschein = $state<GutscheinData | null>(null);
  let direktusAngebote = $state<Array<{ partner: DirektusPartner; reward: DirektusReward }>>([]);
  let filterKategorieDirektus = $state('');
  let filterKategorieAktiv = $state('');
  let filterAwinKategorie = $state('');
  let filterLeistbar = $state(false);

  // ── Derived ───────────────────────────────────────────────────────────
  const flatAwinOffers = $derived(
    awinPrograms.flatMap((p) => p.promotions.map((promo) => ({ program: p, promo })))
  );

  const awinKategorien = $derived.by(() => {
    const counts: Record<string, number> = {};
    for (const { program } of flatAwinOffers) {
      const cat = program.category ?? 'Sonstige';
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  });

  const programMap = $derived(new Map(awinPrograms.map((p) => [p.id, p])));
  const unlockedPromoIds = $derived(new Set(onlineUnlocks.map((u) => u.promoId)));

  const sortedAktiv = $derived(
    [...aktiv].sort((a, b) => new Date(a.ablaeuft_am).getTime() - new Date(b.ablaeuft_am).getTime())
  );

  // Unified aktiv: Direktus active gutscheine + non-expired AWIN unlocks
  const aktivItemsAll = $derived([
    ...sortedAktiv.map((g) => ({ kind: 'gutschein' as const, data: g })),
    ...onlineUnlocks.filter((u) => !u.isExpired).map((u) => ({ kind: 'awin' as const, data: u }))
  ]);

  // Aktiv filtered by category chip (Direktus items always show, AWIN filtered by program.category)
  const filteredAktivItems = $derived(
    filterKategorieAktiv
      ? aktivItemsAll.filter((item) => {
          if (item.kind === 'awin') {
            const prog = programMap.get(item.data.programId);
            return (prog?.category ?? '') === filterKategorieAktiv;
          }
          return true;
        })
      : aktivItemsAll
  );

  // Unified archiv: verwendet + abgelaufen Direktus + expired AWIN
  const archivItems = $derived([
    ...verwendet.map((g) => ({ kind: 'gutschein' as const, data: g, variant: 'verwendet' as const })),
    ...abgelaufen.map((g) => ({ kind: 'gutschein' as const, data: g, variant: 'abgelaufen' as const })),
    ...onlineUnlocks.filter((u) => u.isExpired).map((u) => ({ kind: 'awin' as const, data: u }))
  ]);

  // Offen: AWIN offers not yet unlocked by this user
  const offeneOffers = $derived(flatAwinOffers.filter((o) => !unlockedPromoIds.has(o.promo.id)));

  const direktusKategorienSlugs = $derived(
    [...new Set(direktusAngebote.flatMap((a) => a.partner.kategorie))]
  );

  const filteredDirektusAngebote = $derived(
    filterKategorieDirektus
      ? direktusAngebote.filter((a) => a.partner.kategorie.includes(filterKategorieDirektus))
      : direktusAngebote
  );

  const gefilterteOffeneOffers = $derived.by(() => {
    const base = filterLeistbar
      ? offeneOffers.filter((o) => o.promo.pointsCost <= userPoints)
      : offeneOffers;
    return filterAwinKategorie ? base.filter((o) => o.program.category === filterAwinKategorie) : base;
  });

  function handleUnlocked(pointsSpent: number) {
    userPoints = Math.max(0, userPoints - pointsSpent);
  }

  async function handleLokalRedeemed(newBalance: number) {
    userPoints = newBalance;
    // Gutscheine neu laden damit neuer Eintrag sofort in "Aktiv" erscheint
    const token = await getValidAccessToken();
    if (token) {
      const res = await fetch('/api/gutscheine', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const d = await res.json();
        aktiv      = d.aktiv      ?? [];
        verwendet  = d.verwendet  ?? [];
        abgelaufen = d.abgelaufen ?? [];
      }
    }
  }

  // ── Load ──────────────────────────────────────────────────────────────
  onMount(async () => {
    const token = await getValidAccessToken();
    isLoggedIn = !!token;
    const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;

    try {
      const [awinRes, partnerRes, profileRes, gutscheineRes, onlineRes] = await Promise.all([
        fetch('/api/awin/programs'),
        fetch('/api/partner'),
        authHeader ? fetch('/api/profile', { headers: authHeader }) : Promise.resolve(null),
        authHeader ? fetch('/api/gutscheine', { headers: authHeader }) : Promise.resolve(null),
        authHeader ? fetch('/api/awin/my-unlocks', { headers: authHeader }) : Promise.resolve(null)
      ]);

      if (awinRes.ok) {
        const b = await awinRes.json();
        awinPrograms = b.data ?? [];
      }

      if (partnerRes.ok) {
        const b = await partnerRes.json();
        const angebote: Array<{ partner: DirektusPartner; reward: DirektusReward }> = [];
        for (const p of b.data ?? []) {
          for (const r of p.rewards ?? []) {
            angebote.push({ partner: p, reward: r });
          }
        }
        direktusAngebote = angebote;
      }

      if (profileRes?.ok) {
        const b = await profileRes.json();
        const uid = b?.data?.id ?? '';
        if (uid) {
          const ledgerRes = await fetch(`/api/ledger-total?user=${uid}`, { headers: authHeader });
          if (ledgerRes.ok) {
            const l = await ledgerRes.json();
            userPoints = l?.total ?? 0;
          }
        }
      }

      if (gutscheineRes?.ok) {
        const d = await gutscheineRes.json();
        aktiv      = d.aktiv      ?? [];
        verwendet  = d.verwendet  ?? [];
        abgelaufen = d.abgelaufen ?? [];
      }

      if (onlineRes?.ok) {
        const d = await onlineRes.json();
        onlineUnlocks = d.data ?? [];
      }
    } catch (e: unknown) {
      errorMsg = e instanceof Error ? e.message : 'Fehler beim Laden.';
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head><title>Belohnungen – AustroFit</title></svelte:head>

<main class="min-h-[calc(100vh-75px)] bg-light-grey pb-24">
  {#if loading}
    <div class="flex items-center justify-center py-32">
      <div class="flex flex-col items-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div>
        <p class="text-sm text-body">Wird geladen…</p>
      </div>
    </div>

  {:else if errorMsg}
    <div class="mx-auto max-w-2xl px-[var(--spacing-container-x)] py-16">
      <div class="rounded-[var(--radius-card)] border border-error/20 bg-error/5 p-6 text-sm text-error">{errorMsg}</div>
    </div>

  {:else}
    <!-- Hero -->
    <section class="bg-darkblue text-white">
      <div class="mx-auto max-w-[var(--max-width-standard)] px-[var(--spacing-container-x)] lg:px-[var(--spacing-container-x-lg)] py-10 lg:py-14">
        <a
          href="/dashboard"
          class="mb-4 inline-flex items-center gap-1.5 text-sm opacity-70 hover:opacity-100 transition-opacity"
        >
          ← Dashboard
        </a>
        <h1 class="font-heading text-3xl font-bold md:text-4xl leading-tight mb-4">
          Belohnungen für deine Aktivität
        </h1>

        {#if isLoggedIn}
          <div class="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-white/15 px-5 py-2.5">
            <span class="text-sm font-medium text-white/80">Verfügbare Punkte:</span>
            <span class="text-xl font-bold text-secondary">{userPoints}P</span>
          </div>
        {:else}
          <a
            href="/registrierung"
            class="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Jetzt anmelden & Punkte sammeln →
          </a>
        {/if}
      </div>
    </section>

    <!-- Content -->
    <div class="mx-auto max-w-[var(--max-width-standard)] px-[var(--spacing-container-x)] lg:px-[var(--spacing-container-x-lg)] py-8">

      <!-- Tab Navigation -->
      <div class="mb-6 flex w-full rounded-[var(--radius-card)] border border-black/10 bg-white p-1 shadow-sm sm:w-auto sm:inline-flex">
        {#each tabs as tab}
          {@const count = tab.key === 'aktiv' ? aktivItemsAll.length : tab.key === 'archiv' ? archivItems.length : offeneOffers.length + direktusAngebote.length}
          <button
            onclick={() => (activeTab = tab.key)}
            class="relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-medium transition-all sm:flex-none
              {activeTab === tab.key ? 'bg-primary text-white shadow-sm' : 'text-body hover:text-heading'}"
          >
            {tab.label}
            {#if count > 0}
              <span
                class="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-xs
                  {activeTab === tab.key ? 'bg-white/25 text-white' : 'bg-primary-light text-primary'}"
              >
                {count}
              </span>
            {/if}
          </button>
        {/each}
      </div>

      <!-- ═══ Tab: Aktiv ═══ -->
      {#if activeTab === 'aktiv'}

        <!-- Kategorie-Chips -->
        <div class="mb-5 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-0.5">
          <button
            onclick={() => (filterKategorieAktiv = '')}
            class="shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors
              {filterKategorieAktiv === '' ? 'border-primary bg-primary text-white' : 'border-black/15 bg-white hover:border-primary hover:text-primary'}"
          >
            Alle
          </button>
          {#each aktivKategorien as kat}
            <button
              onclick={() => (filterKategorieAktiv = filterKategorieAktiv === kat ? '' : kat)}
              class="shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors
                {filterKategorieAktiv === kat ? 'border-primary bg-primary text-white' : 'border-black/15 bg-white hover:border-primary hover:text-primary'}"
            >
              {kat}
            </button>
          {/each}
        </div>

        {#if !isLoggedIn}
          <div class="flex flex-col items-center gap-4 rounded-[var(--radius-card)] border border-black/10 bg-white p-12 text-center shadow-sm">
            <div class="text-5xl">🎟️</div>
            <div>
              <p class="font-semibold text-heading">Melde dich an</p>
              <p class="mt-1 text-sm text-body">Sieh deine aktiven Gutscheine und freigeschalteten Codes.</p>
            </div>
            <a
              href="/login?next=/belohnung"
              class="rounded-[var(--radius-pill)] bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Anmelden
            </a>
          </div>

        {:else if filteredAktivItems.length === 0}
          <div class="flex flex-col items-center gap-4 rounded-[var(--radius-card)] border border-black/10 bg-white p-12 text-center shadow-sm">
            <div class="text-5xl">🎟️</div>
            {#if filterKategorieAktiv}
              <div>
                <p class="font-semibold text-heading">Keine Belohnungen in dieser Kategorie</p>
                <button onclick={() => (filterKategorieAktiv = '')} class="mt-1 text-sm text-primary hover:underline">
                  Alle anzeigen
                </button>
              </div>
            {:else}
              <div>
                <p class="font-semibold text-heading">Noch keine aktiven Belohnungen</p>
                <p class="mt-1 text-sm text-body">Sammle Punkte und schalte Belohnungen im Tab „Offen" frei.</p>
              </div>
              <button
                onclick={() => (activeTab = 'offen')}
                class="rounded-[var(--radius-pill)] bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Zu den Angeboten →
              </button>
            {/if}
          </div>

        {:else}
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {#each filteredAktivItems as item (item.kind === 'gutschein' ? `g-${item.data.id}` : `a-${item.data.promoId}`)}
              {#if item.kind === 'gutschein'}
                <GutscheinKarte
                  gutschein={item.data}
                  variant="aktiv"
                  onclick={() => (selectedGutschein = item.data)}
                />
              {:else}
                <AwinOnlineCode unlock={item.data} />
              {/if}
            {/each}
          </div>
        {/if}

      <!-- ═══ Tab: Archiv ═══ -->
      {:else if activeTab === 'archiv'}

        {#if archivItems.length === 0}
          <div class="flex flex-col items-center gap-4 rounded-[var(--radius-card)] border border-black/10 bg-white p-12 text-center shadow-sm">
            <div class="text-5xl">📁</div>
            <div>
              <p class="font-semibold text-heading">Noch kein Archiv</p>
              <p class="mt-1 text-sm text-body">Eingelöste oder abgelaufene Belohnungen erscheinen hier.</p>
            </div>
          </div>

        {:else}
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {#each archivItems as item (item.kind === 'gutschein' ? `g-${item.data.id}` : `a-${item.data.promoId}`)}
              <div class="flex flex-col gap-1.5">
                {#if item.kind === 'gutschein'}
                  <span
                    class="w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold
                      {item.variant === 'verwendet' ? 'bg-gray-100 text-gray-500' : 'bg-error/10 text-error'}"
                  >
                    {item.variant === 'verwendet' ? 'Verwendet' : 'Abgelaufen'}
                  </span>
                  <GutscheinKarte gutschein={item.data} variant={item.variant} />
                {:else}
                  <span class="w-fit rounded-full bg-error/10 px-2.5 py-0.5 text-xs font-semibold text-error">
                    Abgelaufen
                  </span>
                  <AwinOnlineCode unlock={item.data} />
                {/if}
              </div>
            {/each}
          </div>
        {/if}

      <!-- ═══ Tab: Offen ═══ -->
      {:else if activeTab === 'offen'}

        <!-- Kategorie-Chips (Regionale Partner) -->
        {#if direktusKategorienSlugs.length > 0}
          <div class="mb-5 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-0.5">
            <button
              onclick={() => (filterKategorieDirektus = '')}
              class="shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors
                {filterKategorieDirektus === '' ? 'border-primary bg-primary text-white' : 'border-black/15 bg-white hover:border-primary hover:text-primary'}"
            >
              Alle
            </button>
            {#each direktusKategorienSlugs as slug}
              <button
                onclick={() => (filterKategorieDirektus = filterKategorieDirektus === slug ? '' : slug)}
                class="shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors
                  {filterKategorieDirektus === slug ? 'border-primary bg-primary text-white' : 'border-black/15 bg-white hover:border-primary hover:text-primary'}"
              >
                {KATEGORIE_LABELS[slug] ?? slug}
              </button>
            {/each}
          </div>
        {/if}

        <div class="mb-5 flex flex-wrap items-center gap-3">
          <!-- Affordability toggle (nur eingeloggt) -->
          {#if isLoggedIn}
            <button
              onclick={() => (filterLeistbar = !filterLeistbar)}
              class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors
                {filterLeistbar ? 'border-primary bg-primary text-white' : 'border-black/15 bg-white hover:border-primary hover:text-primary'}"
            >
              {#if filterLeistbar}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 opacity-50" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clip-rule="evenodd"/>
                </svg>
              {/if}
              Mit meinen Punkten einlösbar
            </button>
          {/if}
        </div>

        <!-- AWIN Kategorie-Chips -->
        {#if awinKategorien.length > 1}
          <div class="mb-5 flex flex-wrap gap-2">
            <button
              onclick={() => (filterAwinKategorie = '')}
              class="rounded-full border px-3 py-1.5 text-sm font-medium transition-colors
                {filterAwinKategorie === '' ? 'border-primary bg-primary text-white' : 'border-black/15 bg-white hover:border-primary hover:text-primary'}"
            >
              Alle <span class="opacity-70">({offeneOffers.length})</span>
            </button>
            {#each awinKategorien as [cat]}
              {@const countInKat = offeneOffers.filter((o) => o.program.category === cat).length}
              {#if countInKat > 0}
                <button
                  onclick={() => (filterAwinKategorie = cat)}
                  class="rounded-full border px-3 py-1.5 text-sm font-medium transition-colors
                    {filterAwinKategorie === cat ? 'border-primary bg-primary text-white' : 'border-black/15 bg-white hover:border-primary hover:text-primary'}"
                >
                  {awinKategorieLabels[cat] ?? cat} <span class="opacity-70">({countInKat})</span>
                </button>
              {/if}
            {/each}
          </div>
        {/if}

        {#if gefilterteOffeneOffers.length === 0}
          <div class="rounded-[var(--radius-card)] border border-gray-200 bg-white p-10 text-center shadow-[var(--shadow-s)]">
            {#if filterLeistbar}
              <p class="font-medium text-heading">Keine Angebote mit deinen Punkten</p>
              <p class="text-sm mt-1 text-body">Sammle mehr Punkte oder deaktiviere den Filter.</p>
              <button
                onclick={() => (filterLeistbar = false)}
                class="mt-3 text-sm text-primary hover:underline"
              >Filter aufheben</button>
            {:else}
              <p class="font-medium text-heading">Derzeit keine Angebote verfügbar</p>
              <p class="text-sm mt-1 text-body">Wir arbeiten daran – schau bald wieder vorbei.</p>
            {/if}
          </div>

        {:else}
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {#each gefilterteOffeneOffers as { program, promo } (promo.id)}
              <AwinAngebotKarte
                programId={program.id}
                name={program.name}
                logoUrl={program.logoUrl}
                displayUrl={program.displayUrl}
                description={program.description}
                category={program.category}
                targetUrl={program.url}
                promotions={[promo]}
                {userPoints}
                {isLoggedIn}
                onUnlocked={handleUnlocked}
              />
            {/each}
          </div>
          {#if filterAwinKategorie && gefilterteOffeneOffers.length < offeneOffers.length}
            <p class="mt-3 text-center text-xs text-body/60">
              {gefilterteOffeneOffers.length} von {offeneOffers.length} Angeboten ·
              <button
                onclick={() => (filterAwinKategorie = '')}
                class="text-primary underline underline-offset-2 hover:text-primary-dark transition-colors"
              >
                Alle anzeigen
              </button>
            </p>
          {/if}
        {/if}

      {/if}

      <!-- Regionale Partner (Direktus) -->
      {#if activeTab === 'offen' && direktusAngebote.length > 0}
        <section class="mt-12">
          <h2 class="font-heading text-xl font-bold text-heading mb-4">Regionale Partner</h2>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {#each filteredDirektusAngebote as { partner, reward } (`${partner.id}-${reward.id}`)}
              <AngebotKarte
                {reward}
                {partner}
                {userPoints}
                {isLoggedIn}
                onredeemed={handleLokalRedeemed}
              />
            {/each}
          </div>
        </section>
      {/if}

    </div>
  {/if}
</main>

{#if selectedGutschein}
  <GutscheinDetailModal
    gutschein={selectedGutschein}
    onclose={() => (selectedGutschein = null)}
  />
{/if}
