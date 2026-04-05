<!-- src/routes/profil/level-roadmap/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getValidAccessToken } from '$lib/utils/auth';
  import { getLevelInfo } from '$lib/utils/level';
  import { levelDefs } from '$lib/stores/levels';
  import { qs } from '$lib/utils/qs';
  import LevelFortschritt from '$lib/components/profil/LevelFortschritt.svelte';
  import { apiUrl } from '$lib/utils/api';

  let loading = $state(true);
  let errorMsg = $state('');
  let earnedPoints = $state(0);

  const levelInfo = $derived(getLevelInfo(earnedPoints, $levelDefs));

  onMount(async () => {
    const token = await getValidAccessToken();
    if (!token) { goto('/login?next=/profil/level-roadmap'); return; }
    const authHeader = { Authorization: `Bearer ${token}` };

    try {
      const meRes = await fetch(apiUrl('/api/me'), { headers: authHeader });
      if (!meRes.ok) { goto('/login?next=/profil/level-roadmap'); return; }
      const me = await meRes.json();
      const userId = me?.data?.id;
      if (!userId) { goto('/login?next=/profil/level-roadmap'); return; }

      const earnedRes = await fetch(apiUrl(`/api/ledger-total?${qs({ user: userId, positive_only: 'true' })}`), { headers: authHeader });
      if (earnedRes.ok) earnedPoints = Number((await earnedRes.json()).total ?? 0);
    } catch (e: unknown) {
      errorMsg = e instanceof Error ? e.message : 'Fehler beim Laden.';
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head><title>Level-Roadmap – AustroFit</title></svelte:head>

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
        <h1 class="text-2xl font-bold font-heading">Level-Roadmap</h1>
        <p class="mt-1 text-sm opacity-70">
          {levelInfo.current.name} · {earnedPoints.toLocaleString('de-AT')} Punkte verdient
        </p>
      </div>
    </div>

    <div class="mx-auto -mt-8 flex max-w-2xl flex-col gap-4 px-4">

      <!-- Aktueller Fortschritt -->
      <div class="rounded-[var(--radius-card)] border border-black/10 bg-white p-6 shadow-sm">
        <div class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Dein Fortschritt
        </div>
        <LevelFortschritt punkte={earnedPoints} />
      </div>

      <!-- Roadmap -->
      <div class="rounded-[var(--radius-card)] border border-black/10 bg-white p-6 shadow-sm">
        <div class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Alle Level
        </div>
        <div class="flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-1">
          {#each $levelDefs as lvl (lvl.level)}
            {@const isCurrent = lvl.level === levelInfo.current.level}
            {@const isDone    = lvl.level < levelInfo.current.level}
            {@const isNext    = levelInfo.next !== null && lvl.level === levelInfo.next.level}
            {@const isHidden  = !isDone && !isCurrent && !isNext}
            <div
              class="flex items-center gap-4 rounded-xl p-3 transition-all select-none
                {isCurrent
                  ? 'border-2 border-primary bg-primary/5 shadow-sm'
                  : isNext
                    ? 'border border-secondary/40 bg-secondary/5'
                    : 'border border-black/5'}
                {isHidden ? 'blur-[3px] opacity-40 pointer-events-none' : ''}"
            >
              <!-- Level-Nummer / Icon -->
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold
                  {isCurrent
                    ? 'bg-primary text-white'
                    : isDone
                      ? 'bg-primary/10 text-primary'
                      : isNext
                        ? 'bg-secondary/20 text-secondary'
                        : 'bg-gray-100 text-gray-400'}"
              >
                {#if isHidden}🔒{:else}{isDone ? '✓' : lvl.level}{/if}
              </div>

              <!-- Level-Info -->
              <div class="min-w-0 flex-1">
                <div class="flex items-baseline gap-2">
                  <span class="font-semibold
                    {isCurrent ? 'text-heading' : isDone ? 'text-primary' : isNext ? 'text-body' : 'text-gray-400'}">
                    {isHidden ? '???' : lvl.name}
                  </span>
                  {#if isDone}
                    <span class="text-xs text-primary">Erreicht</span>
                  {/if}
                </div>
                <div class="text-xs text-gray-400">
                  {isHidden ? 'Noch verborgen' : `ab ${lvl.min.toLocaleString('de-AT')} Punkte`}
                </div>
              </div>

              <!-- Fehlende Punkte (nur beim nächsten Level) -->
              {#if isNext}
                <div class="shrink-0 text-right">
                  <div class="text-sm font-semibold text-secondary">
                    {(lvl.min - earnedPoints).toLocaleString('de-AT')} P
                  </div>
                  <div class="text-xs text-gray-400">fehlen noch</div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
        <p class="mt-4 text-center text-xs text-gray-400">
          Erreiche das nächste Level, um weitere Stufen zu enthüllen.
        </p>
      </div>

    </div>
  {/if}
</main>
