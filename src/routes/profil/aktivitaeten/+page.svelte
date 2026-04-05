<!-- src/routes/profil/aktivitaeten/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getValidAccessToken } from '$lib/utils/auth';
  import { qs } from '$lib/utils/qs';
  import BuchungsZeile from '$lib/components/profil/BuchungsZeile.svelte';
  import type { LedgerEntry } from '$lib/components/profil/BuchungsZeile.svelte';
  import { apiUrl } from '$lib/utils/api';

  type FilterKey = 'all' | 'education' | 'schritte' | 'cardio' | 'streak' | 'onboarding' | 'einloesung';

  const PAGE_SIZE = 20;

  let loading = $state(true);
  let errorMsg = $state('');
  let userId = $state('');

  let entries = $state<LedgerEntry[]>([]);
  let totalEntries = $state(0);
  let currentPage = $state(0);
  let loadingMore = $state(false);
  let activeFilter = $state<FilterKey>('all');

  const hasMore = $derived(entries.length < totalEntries);

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all',        label: 'Alle' },
    { key: 'education',  label: '📚 Quizze' },
    { key: 'schritte',   label: '👟 Schritte' },
    { key: 'cardio',     label: '🏃 Bewegung' },
    { key: 'streak',     label: '🔥 Streak' },
    { key: 'onboarding', label: '🎁 Onboarding' },
    { key: 'einloesung', label: '🎫 Einlösung' }
  ];

  async function fetchEntries(reset: boolean) {
    const page = reset ? 0 : currentPage + 1;
    const params: Record<string, string> = {
      user: userId,
      limit: String(PAGE_SIZE),
      offset: String(page * PAGE_SIZE)
    };
    if (activeFilter !== 'all') params.source_type = activeFilter;

    loadingMore = true;
    try {
      const res = await fetch(apiUrl(`/api/ledger-entries?${qs(params)}`), { headers: { Authorization: `Bearer ${await getValidAccessToken()}` } });
      if (!res.ok) { errorMsg = 'Aktivitäten konnten nicht geladen werden.'; return; }
      const data = await res.json();
      if (reset) {
        entries = data.data ?? [];
        currentPage = 0;
      } else {
        entries = [...entries, ...(data.data ?? [])];
        currentPage = page;
      }
      totalEntries = data.total ?? 0;
    } finally {
      loadingMore = false;
    }
  }

  function setFilter(key: FilterKey) {
    activeFilter = key;
    fetchEntries(true);
  }

  onMount(async () => {
    const token = await getValidAccessToken();
    if (!token) { goto('/login?next=/profil/aktivitaeten'); return; }
    const authHeader = { Authorization: `Bearer ${token}` };

    try {
      const meRes = await fetch(apiUrl('/api/me'),{ headers: authHeader });
      if (!meRes.ok) { goto('/login?next=/profil/aktivitaeten'); return; }
      const me = await meRes.json();
      const user = me?.data;
      if (!user?.id) { goto('/login?next=/profil/aktivitaeten'); return; }
      userId = user.id;

      const entriesRes = await fetch(apiUrl(`/api/ledger-entries?${qs({ user: userId, limit: String(PAGE_SIZE) })}`), { headers: authHeader });
      if (entriesRes.ok) {
        const ed = await entriesRes.json();
        entries      = ed.data  ?? [];
        totalEntries = ed.total ?? 0;
      }
    } catch (e: unknown) {
      errorMsg = e instanceof Error ? e.message : 'Fehler beim Laden.';
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head><title>Alle Aktivitäten – AustroFit</title></svelte:head>

<main class="min-h-[calc(100vh-75px)] bg-gray-50 pb-24">
  {#if loading}
    <div class="flex items-center justify-center py-32">
      <div class="flex flex-col items-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600"></div>
        <p class="text-sm text-gray-500">Wird geladen…</p>
      </div>
    </div>

  {:else if errorMsg}
    <div class="mx-auto max-w-lg px-4 py-16">
      <div class="rounded-[var(--radius-card)] border border-error/30 bg-error/5 p-6 text-sm text-error">{errorMsg}</div>
    </div>

  {:else}
    <!-- Minimal header without dark background -->
    <div class="bg-white border-b border-black/5">
      <div class="mx-auto max-w-2xl px-4 py-4 flex items-center gap-3">
      </div>
    </div>

    <div class="mx-auto max-w-2xl px-4 pt-6 flex flex-col gap-4 pb-4">
      <h1 class="text-xl font-bold font-heading text-heading">Alle Aktivitäten</h1>

      <!-- Filter-Chips -->
      <div class="flex flex-wrap gap-2">
        {#each filters as f}
          <button
            class="rounded-full border px-3 py-1.5 text-sm transition-colors
              {activeFilter === f.key
                ? 'border-primary bg-primary text-white'
                : 'border-black/15 hover:bg-black/5'}"
            onclick={() => setFilter(f.key)}
          >{f.label}</button>
        {/each}
      </div>

      <!-- Einträge -->
      <div class="rounded-2xl border border-black/10 bg-white shadow-sm">
        {#if entries.length === 0}
          <div class="px-6 py-10 text-center text-sm text-gray-400">
            Keine Einträge in dieser Kategorie.
          </div>
        {:else}
          <div class="divide-y divide-black/5 px-6">
            {#each entries as entry (entry.id)}
              <BuchungsZeile buchung={entry} />
            {/each}
          </div>
          {#if hasMore}
            <div class="border-t border-black/5 p-4 text-center">
              <button
                class="rounded-full border border-black/15 px-5 py-2 text-sm font-medium transition-colors hover:bg-black/5 disabled:opacity-50"
                onclick={() => fetchEntries(false)}
                disabled={loadingMore}
              >
                {loadingMore ? 'Wird geladen…' : 'Mehr laden'}
              </button>
            </div>
          {/if}
        {/if}
      </div>
    </div>
  {/if}
</main>
