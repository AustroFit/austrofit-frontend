<!-- src/routes/profil/auszeichnungen/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getValidAccessToken } from '$lib/utils/auth';
  import { apiUrl } from '$lib/utils/api';

  let loading = $state(true);
  let errorMsg = $state('');

  interface DirectusBadge {
    id: number;
    slug: string;
    name: string;
    description: string;
    hint: string;
    step_threshold: number;
    condition_type: string;
    kategorie: string;
    typ: string;
    sort: number;
    image_url: string | null;
    earned: boolean;
  }

  const TYP_META: Record<string, { label: string; emoji: string; subtitle: string }> = {
    hauptstadt: { label: 'Bundeshauptstädte',  emoji: '🏙️', subtitle: 'Alle 9 Städte verbunden' },
    bundesland: { label: 'Bundesländer',        emoji: '🗺️', subtitle: 'Landesgrenzen erwandert' },
    oesterreich:{ label: 'Österreich',          emoji: '🇦🇹', subtitle: 'Das große Ziel' },
    wanderweg:  { label: 'Wanderwege',          emoji: '🥾', subtitle: 'Etappen & Fernwege' },
    see:        { label: 'Seen',                emoji: '🏊', subtitle: 'Österreichs Gewässer umrundet' },
    berg:       { label: 'Berge',               emoji: '⛰️', subtitle: 'Gipfel symbolisch erklommen' },
  };

  const TYP_ORDER = ['hauptstadt','bundesland','oesterreich','wanderweg','see','berg'];

  let directusBadges = $state<DirectusBadge[]>([]);
  let totalSteps = $state(0);

  const directusByTyp = $derived(
    TYP_ORDER
      .map(typ => {
        const list = directusBadges.filter(b => b.typ === typ);
        if (!list.length) return null;
        return {
          typ,
          ...TYP_META[typ],
          badges: list,
          earnedCount: list.filter(b => b.earned).length
        };
      })
      .filter(Boolean) as { typ: string; label: string; emoji: string; subtitle: string; badges: DirectusBadge[]; earnedCount: number }[]
  );

  const totalEarned = $derived(directusBadges.filter(b => b.earned).length);
  const totalCount = $derived(directusBadges.length);

  onMount(async () => {
    const token = await getValidAccessToken();
    if (!token) { goto('/login?next=/profil/auszeichnungen'); return; }
    const authHeader = { Authorization: `Bearer ${token}` };

    try {
      const directusRes = await fetch(apiUrl('/api/badges'), { headers: authHeader });
      if (!directusRes.ok) {
        if (directusRes.status === 401) { goto('/login?next=/profil/auszeichnungen'); return; }
        throw new Error(`Fehler ${directusRes.status}`);
      }
      const db = await directusRes.json();
      directusBadges = db.badges ?? [];
      totalSteps     = db.total_steps ?? 0;
    } catch (e: unknown) {
      errorMsg = e instanceof Error ? e.message : 'Fehler beim Laden.';
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head><title>Auszeichnungen – AustroFit</title></svelte:head>

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
    <!-- Header -->
    <div class="bg-darkblue text-white">
      <div class="mx-auto max-w-2xl px-4 pt-8 pb-14">
        <h1 class="text-2xl font-bold font-heading">Auszeichnungen</h1>
        <p class="mt-1 text-sm opacity-70">{totalEarned} von {totalCount} Badges verdient</p>
        {#if totalSteps > 0}
          <p class="mt-0.5 text-xs opacity-50">{totalSteps.toLocaleString('de-AT')} Schritte gesamt</p>
        {/if}
      </div>
    </div>

    <div class="mx-auto -mt-8 flex max-w-2xl flex-col gap-4 px-4">

      {#if directusByTyp.length === 0}
        <div class="rounded-[var(--radius-card)] border border-black/10 bg-white shadow-sm p-8 text-center text-sm text-gray-400">
          Noch keine Badges verfügbar.
        </div>
      {/if}

      {#each directusByTyp as cat}
        {@const nextIdx = cat.badges.findIndex(b => !b.earned)}
        <div class="rounded-[var(--radius-card)] border border-black/10 bg-white shadow-sm overflow-hidden">
          <div class="flex items-center justify-between px-4 pt-4 pb-2">
            <div>
              <h2 class="font-bold text-heading leading-tight">{cat.emoji} {cat.label}</h2>
              <p class="text-xs text-gray-400">{cat.subtitle}</p>
            </div>
            <span class="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              {cat.earnedCount}/{cat.badges.length}
            </span>
          </div>
          <div class="relative">
            <div class="flex gap-2.5 overflow-x-auto px-4 pb-4 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {#each cat.badges as badge, i}
                {@const isNext = !badge.earned && i === nextIdx}
                {@const isBlurred = !badge.earned && nextIdx !== -1 && i > nextIdx}
                <div class="flex w-[7.5rem] shrink-0 flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all select-none
                  {badge.earned ? 'border-primary/20 bg-primary/5 shadow-sm' : isNext ? 'border-dashed border-gray-300 bg-gray-50' : 'border-dashed border-gray-200 bg-gray-50'}
                  {isBlurred ? 'blur-[3px] opacity-40 pointer-events-none' : ''}">
                  {#if badge.image_url}
                    <img
                      src={badge.image_url}
                      alt={badge.name}
                      class="h-10 w-10 object-contain {badge.earned ? '' : 'grayscale opacity-40'}"
                    />
                  {:else}
                    <div class="flex h-10 w-10 items-center justify-center rounded-full border-2
                      {badge.earned ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 bg-gray-100 text-gray-300'}">
                      <span class="text-lg">{cat.emoji}</span>
                    </div>
                  {/if}
                  <div class="text-[11px] font-semibold leading-tight {badge.earned ? 'text-heading' : 'text-gray-400'}">
                    {badge.name}
                  </div>
                  {#if badge.earned}
                    <div class="text-[10px] text-primary leading-tight">{badge.description}</div>
                    <div class="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary"></div>
                  {:else if isNext}
                    <div class="text-[10px] text-gray-400 leading-tight">{badge.hint}</div>
                  {:else}
                    <div class="text-[10px] text-gray-300 leading-tight">🔒 Noch gesperrt</div>
                  {/if}
                </div>
              {/each}
            </div>
            <div class="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent"></div>
          </div>
        </div>
      {/each}

    </div>
  {/if}
</main>
