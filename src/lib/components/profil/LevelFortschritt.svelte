<!-- src/lib/components/profil/LevelFortschritt.svelte -->
<!-- Fortschrittsbalken: aktuelles Level + Punkte bis zum nächsten -->
<script lang="ts">
  import { getLevelInfo } from '$lib/utils/level';
  import { levelDefs } from '$lib/stores/levels';

  interface Props {
    punkte: number;
    size?: 'large' | 'small';
  }

  let { punkte = 0, size = 'large' }: Props = $props();

  const info = $derived(getLevelInfo(punkte, $levelDefs));
</script>

{#if size === 'large'}
  <div>
    <div class="mb-1.5 flex items-baseline justify-between gap-2">
      <span class="font-semibold">
        {info.current.name}
      </span>
      {#if info.next}
        <span class="shrink-0 text-xs text-gray-500">
          {info.progress} / {info.needed} P bis Level {info.next.level}
        </span>
      {:else}
        <span class="shrink-0 text-xs font-medium text-primary">Maximales Level 🏆</span>
      {/if}
    </div>
    <div class="h-3 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        class="h-full rounded-full bg-primary transition-all duration-500"
        style="width:{info.percent}%;"
      ></div>
    </div>
  </div>
{:else}
  <div class="flex items-center gap-2">
    <span class="shrink-0 text-xs font-bold text-primary">Lv.{info.current.level}</span>
    <div class="min-w-0 flex-1">
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          class="h-full rounded-full bg-primary transition-all"
          style="width:{info.percent}%;"
        ></div>
      </div>
    </div>
    <span class="shrink-0 text-xs text-gray-400">
      {info.next ? `${info.next.min} P` : '∞'}
    </span>
  </div>
{/if}
