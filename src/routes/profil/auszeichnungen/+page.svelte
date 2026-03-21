<!-- src/routes/profil/auszeichnungen/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getValidAccessToken } from '$lib/utils/auth';
  import { getBadgeDefs, BADGE_CATEGORY_DEFS } from '$lib/utils/badges';
  import type { BadgeDef } from '$lib/utils/badges';
  import { qs } from '$lib/utils/qs';

  let loading = $state(true);
  let errorMsg = $state('');

  let earnedPoints = $state(0);
  let longestStreak = $state(0);
  let quizPassCount = $state(0);
  let hasSchritte = $state(false);
  let schrittDays = $state(0);
  let hasEinloesung = $state(false);

  const badges = $derived<BadgeDef[]>(
    getBadgeDefs({ hasSchritte, schrittDays, quizPassCount, longestStreak, earnedPoints, hasEinloesung })
  );

  const badgesByKategorie = $derived(
    BADGE_CATEGORY_DEFS.map(cat => ({
      ...cat,
      badges: badges.filter(b => b.kategorie === cat.key),
      earnedCount: badges.filter(b => b.kategorie === cat.key && b.earned).length
    }))
  );

  const totalEarned = $derived(badges.filter(b => b.earned).length);

  onMount(async () => {
    const token = await getValidAccessToken();
    if (!token) { goto('/login?next=/profil/auszeichnungen'); return; }
    const authHeader = { Authorization: `Bearer ${token}` };

    try {
      const meRes = await fetch('/api/me', { headers: authHeader });
      if (!meRes.ok) { goto('/login?next=/profil/auszeichnungen'); return; }
      const me = await meRes.json();
      const user = me?.data;
      if (!user?.id) { goto('/login?next=/profil/auszeichnungen'); return; }

      longestStreak = Number(user.longest_streak ?? 0);

      const [earnedRes, badgesRes] = await Promise.all([
        fetch(`/api/ledger-total?${qs({ user: user.id, positive_only: 'true' })}`, { headers: authHeader }),
        fetch(`/api/badges-summary?${qs({ user: user.id })}`)
      ]);

      if (earnedRes.ok) earnedPoints = Number((await earnedRes.json()).total ?? 0);
      if (badgesRes.ok) {
        const bd = await badgesRes.json();
        quizPassCount = bd.quizPassCount ?? 0;
        hasSchritte   = bd.hasSchritte   ?? false;
        schrittDays   = bd.schrittDays   ?? 0;
        hasEinloesung = bd.hasEinloesung ?? false;
      }
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
        <a
          href="/dashboard"
          class="mb-4 inline-flex items-center gap-1.5 text-sm opacity-70 hover:opacity-100 transition-opacity"
        >
          ← Dashboard
        </a>
        <h1 class="text-2xl font-bold font-heading">Auszeichnungen</h1>
        <p class="mt-1 text-sm opacity-70">
          {totalEarned} von {badges.length} Badges verdient
        </p>
      </div>
    </div>

    <div class="mx-auto -mt-8 flex max-w-2xl flex-col gap-4 px-4">

      {#each badgesByKategorie as cat}
        {@const nextIdx = cat.badges.findIndex(b => !b.earned)}
        <div class="rounded-[var(--radius-card)] border border-black/10 bg-white shadow-sm overflow-hidden">
          <!-- Kategorie-Header -->
          <div class="flex items-center justify-between px-4 pt-4 pb-2">
            <div>
              <h2 class="font-bold text-heading leading-tight">
                {cat.emoji} {cat.label}
              </h2>
              <p class="text-xs text-gray-400">{cat.subtitle}</p>
            </div>
            <span class="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              {cat.earnedCount}/{cat.badges.length}
            </span>
          </div>

          <!-- Horizontal-Scroll-Reihe -->
          <div class="relative">
            <div class="flex gap-2.5 overflow-x-auto px-4 pb-4 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {#each cat.badges as badge, i}
                {@const isNext = !badge.earned && i === nextIdx}
                {@const isBlurred = !badge.earned && nextIdx !== -1 && i > nextIdx}
                <div
                  class="flex w-[7.5rem] shrink-0 flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all select-none
                    {badge.earned
                      ? 'border-primary/20 bg-primary/5 shadow-sm'
                      : isNext
                        ? 'border-dashed border-gray-300 bg-gray-50'
                        : 'border-dashed border-gray-200 bg-gray-50'}
                    {isBlurred ? 'blur-[3px] opacity-40 pointer-events-none' : ''}"
                >
                  <div class="text-3xl leading-none
                    {badge.earned ? '' : isNext ? 'grayscale opacity-50' : 'grayscale opacity-30'}">
                    {badge.icon}
                  </div>
                  <div class="text-[11px] font-semibold leading-tight
                    {badge.earned ? 'text-heading' : 'text-gray-400'}">
                    {badge.name}
                  </div>
                  {#if badge.earned}
                    <div class="text-[10px] text-primary leading-tight">{badge.beschreibung}</div>
                    <div class="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary"></div>
                  {:else if isNext}
                    <div class="text-[10px] text-gray-400 leading-tight">{badge.hint}</div>
                  {:else}
                    <div class="text-[10px] text-gray-300 leading-tight">🔒 Noch gesperrt</div>
                  {/if}
                </div>
              {/each}
            </div>
            <!-- Rechter Fade-Overlay -->
            <div class="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent"></div>
          </div>
        </div>
      {/each}

    </div>
  {/if}
</main>
