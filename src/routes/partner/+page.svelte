<!-- src/routes/partner/+page.svelte -->
<!-- Partner-Marketplace: öffentlich sichtbar, Einlösen nur mit Login -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { getAccessToken } from '$lib/utils/auth';
  import AngebotKarte from '$lib/components/partner/AngebotKarte.svelte';
  import AwinAngebotKarte from '$lib/components/partner/AwinAngebotKarte.svelte';
  import PartnerFilter from '$lib/components/partner/PartnerFilter.svelte';

  interface Reward {
    id: string;
    titel: string;
    beschreibung?: string;
    punkte_kosten: number;
  }

  interface Partner {
    id: string;
    name: string;
    logo_url?: string | null;
    kategorie?: string;
    region?: string;
    esg_zertifiziert?: boolean;
    rewards: Reward[];
  }

  interface AwinProgram {
    id: number;
    name: string;
    url: string;
    logoUrl: string | null;
    displayUrl: string;
    description: string | null;
    category: string | null;
  }

  let loading = $state(true);
  let errorMsg = $state('');
  let partners = $state<Partner[]>([]);
  let awinPrograms = $state<AwinProgram[]>([]);
  let userPoints = $state(0);
  let isLoggedIn = $state(false);

  // Filter state
  let filterKategorie = $state('');
  let filterRegion = $state('');
  let filterEsg = $state(false);

  const alleAngebote = $derived(
    partners.flatMap((p) =>
      p.rewards.map((r) => ({ reward: r, partner: p }))
    )
  );

  // Client-side Filterung – funktioniert sobald kategorie/region/esg in API-Daten vorhanden
  const gefilterteAngebote = $derived(
    alleAngebote.filter(({ partner }) => {
      if (filterKategorie && partner.kategorie !== filterKategorie) return false;
      if (filterRegion && partner.region !== filterRegion) return false;
      if (filterEsg && !partner.esg_zertifiziert) return false;
      return true;
    })
  );

  // Zeige Filter nur wenn mindestens ein Partner Kategorie-Daten hat
  const hatFilterDaten = $derived(
    partners.some((p) => p.kategorie != null || p.region != null || p.esg_zertifiziert)
  );

  onMount(async () => {
    const token = getAccessToken();
    isLoggedIn = !!token;
    const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;

    try {
      // Alle Daten parallel laden
      const [partnerRes, awinRes, profileRes] = await Promise.all([
        fetch('/api/partner'),
        fetch('/api/awin/programs'),
        authHeader ? fetch('/api/profile', { headers: authHeader }) : Promise.resolve(null)
      ]);

      if (!partnerRes.ok) throw new Error(`Angebote konnten nicht geladen werden (${partnerRes.status})`);
      const body = await partnerRes.json();
      partners = body.data ?? [];

      if (awinRes.ok) {
        const awinBody = await awinRes.json();
        awinPrograms = awinBody.data ?? [];
      }

      // null → undefined normalisieren (API kann null liefern, Interface erwartet undefined)
      partners = partners.map((p) => ({
        ...p,
        kategorie: p.kategorie ?? undefined,
        region: p.region ?? undefined
      }));

      if (profileRes?.ok) {
        const meBody = await profileRes.json();
        const userId = meBody?.data?.id ?? '';
        if (userId) {
          const ledgerRes = await fetch(`/api/ledger-total?user=${userId}`);
          if (ledgerRes.ok) {
            const ledger = await ledgerRes.json();
            userPoints = ledger?.total ?? 0;
          }
        }
      }
    } catch (e: unknown) {
      errorMsg = e instanceof Error ? e.message : 'Fehler beim Laden.';
    } finally {
      loading = false;
    }
  });

  function handleRedeemed(newPoints: number) {
    userPoints = newPoints;
  }

  function handleFilterChange(f: { kategorie: string; region: string; esg: boolean }) {
    filterKategorie = f.kategorie;
    filterRegion = f.region;
    filterEsg = f.esg;
  }
</script>

<svelte:head><title>Partner-Marketplace – AustroFit</title></svelte:head>

<main class="min-h-[calc(100vh-75px)] bg-gray-50 pb-24">
  {#if loading}
    <div class="flex items-center justify-center py-32">
      <div class="flex flex-col items-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600"></div>
        <p class="text-sm text-gray-500">Angebote werden geladen…</p>
      </div>
    </div>

  {:else if errorMsg}
    <div class="mx-auto max-w-2xl px-4 py-16">
      <div class="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">{errorMsg}</div>
    </div>

  {:else}
    <!-- Header -->
    <div class="text-white" style="background:#5EA500;">
      <div class="mx-auto max-w-3xl px-4 pt-8 pb-14">
        <h1 class="text-3xl font-bold" style="font-family:'Syne',sans-serif;">
          Partner-Marketplace
        </h1>
        <p class="mt-2 text-sm opacity-80">
          Löse deine Punkte gegen Angebote regionaler Partner ein.
        </p>

        {#if isLoggedIn}
          <div class="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2">
            <span class="text-sm font-medium">Deine Punkte:</span>
            <span class="text-xl font-bold">{userPoints}P</span>
          </div>
        {:else}
          <a
            href="/registrierung"
            class="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium transition hover:bg-white/30"
          >
            Jetzt anmelden & Punkte sammeln →
          </a>
        {/if}
      </div>
    </div>

    <div class="mx-auto -mt-8 max-w-3xl px-4">

      <!-- Filter (nur sichtbar wenn Direktus Partner-Relation befüllt) -->
      {#if hatFilterDaten}
        <div class="mb-5 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <PartnerFilter
            kategorie={filterKategorie}
            region={filterRegion}
            esg={filterEsg}
            onchange={handleFilterChange}
          />
        </div>
      {/if}

      {#if gefilterteAngebote.length === 0}
        <div class="rounded-2xl border border-black/10 bg-white p-10 text-center text-gray-400 shadow-sm">
          <p class="text-4xl mb-3">🔍</p>
          {#if alleAngebote.length === 0}
            <p class="font-medium">Keine Angebote verfügbar</p>
            <p class="text-sm mt-1">Schau später nochmal vorbei.</p>
          {:else}
            <p class="font-medium">Kein Angebot passt zu deinem Filter</p>
            <button
              onclick={() => { filterKategorie = ''; filterRegion = ''; filterEsg = false; }}
              class="mt-3 text-sm underline underline-offset-2"
              style="color:#5EA500;"
            >
              Filter zurücksetzen
            </button>
          {/if}
        </div>
      {:else}
        <div class="grid gap-4 sm:grid-cols-2">
          {#each gefilterteAngebote as { reward, partner } (reward.id)}
            <AngebotKarte
              {reward}
              {partner}
              {userPoints}
              {isLoggedIn}
              onredeemed={handleRedeemed}
            />
          {/each}
        </div>
        <p class="mt-4 text-center text-xs text-gray-400">
          {gefilterteAngebote.length}
          {gefilterteAngebote.length === 1 ? 'Angebot' : 'Angebote'}
          {gefilterteAngebote.length < alleAngebote.length ? `von ${alleAngebote.length} gefiltert` : 'verfügbar'}
        </p>
      {/if}

      <!-- AWIN Online-Partner (Affiliate) -->
      {#if awinPrograms.length > 0}
        <div class="mt-8">
          <div class="mb-3 flex items-center gap-2">
            <h2 class="font-semibold text-gray-900" style="font-family:'Syne',sans-serif;">
              Online-Partner
            </h2>
            <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              {awinPrograms.length}
            </span>
          </div>
          <p class="mb-4 text-sm text-gray-500">
            Exklusive Angebote unserer Online-Partner – kostenlos & ohne Punkte einlösen.
          </p>
          <div class="grid gap-4 sm:grid-cols-2">
            {#each awinPrograms as program (program.id)}
              <AwinAngebotKarte
                programId={program.id}
                name={program.name}
                logoUrl={program.logoUrl}
                displayUrl={program.displayUrl}
                description={program.description}
                category={program.category}
                targetUrl={program.url}
              />
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</main>
