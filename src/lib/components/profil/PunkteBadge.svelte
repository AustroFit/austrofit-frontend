<!-- src/lib/components/profil/PunkteBadge.svelte -->
<!-- Kompakte oder große Anzeige von Punktestand + Level -->
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
  <div class="flex flex-col items-center gap-2 py-4">
    <div
      class="text-6xl font-bold leading-none text-primary font-heading"
    >
      {punkte.toLocaleString('de-AT')}
    </div>
    <div class="text-sm uppercase tracking-widest text-gray-500">AustroFit-Punkte</div>
    <div class="mt-1 rounded-full bg-primary px-4 py-1 text-sm font-semibold text-white">
      Level {info.current.level} – {info.current.name}
    </div>
  </div>
{:else}
  <div class="flex items-center gap-3">
    <div class="text-3xl font-bold font-heading">
      {punkte.toLocaleString('de-AT')}
    </div>
    <div>
      <div class="text-xs text-gray-500">Punkte</div>
      <div class="text-xs font-semibold text-primary">
        Lv.{info.current.level} {info.current.name}
      </div>
    </div>
  </div>
{/if}
