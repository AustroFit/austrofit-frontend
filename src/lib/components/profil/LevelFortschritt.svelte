<!-- src/lib/components/profil/LevelFortschritt.svelte -->
<!-- Fortschrittsbalken: aktuelles Level + Punkte bis zum nächsten -->
<script lang="ts">
  import { getLevelInfo } from '$lib/utils/level';

  interface Props {
    punkte: number;
    size?: 'large' | 'small';
  }

  let { punkte = 0, size = 'large' }: Props = $props();

  const info = $derived(getLevelInfo(punkte));
</script>

{#if size === 'large'}
  <div>
    <div class="mb-1.5 flex items-baseline justify-between gap-2">
      <span class="font-semibold">
        Level {info.current.level} – {info.current.name}
      </span>
      {#if info.next}
        <span class="shrink-0 text-xs text-gray-500">
          {info.progress} / {info.needed} P bis Level {info.next.level}
        </span>
      {:else}
        <span class="shrink-0 text-xs font-medium" style="color:#2E7D32;">Maximales Level 🏆</span>
      {/if}
    </div>
    <div class="h-3 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        class="h-full rounded-full transition-all duration-500"
        style="width:{info.percent}%; background:#2E7D32;"
      ></div>
    </div>
    {#if info.next}
      <div class="mt-1 text-xs text-gray-400">
        Nächstes Level: <span class="font-medium text-gray-600">{info.next.name}</span>
      </div>
    {/if}
  </div>
{:else}
  <div class="flex items-center gap-2">
    <span class="shrink-0 text-xs font-bold" style="color:#2E7D32;">Lv.{info.current.level}</span>
    <div class="min-w-0 flex-1">
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          class="h-full rounded-full transition-all"
          style="width:{info.percent}%; background:#2E7D32;"
        ></div>
      </div>
    </div>
    <span class="shrink-0 text-xs text-gray-400">
      {info.next ? `${info.next.min} P` : '∞'}
    </span>
  </div>
{/if}
