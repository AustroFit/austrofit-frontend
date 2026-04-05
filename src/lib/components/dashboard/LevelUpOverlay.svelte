<!-- src/lib/components/dashboard/LevelUpOverlay.svelte -->
<!-- Overlay bei Level-Aufstieg nach Sync -->
<script lang="ts">
  interface Props {
    levelName: string;
    levelNumber: number;
    onDismiss: () => void;
  }
  const { levelName, levelNumber, onDismiss }: Props = $props();

  const LEVEL_EMOJI: Record<number, string> = {
    5:  '🏔️',
    10: '🦅',
    15: '🌟',
    20: '🏆',
  };
  const emoji = $derived(LEVEL_EMOJI[levelNumber] ?? '⬆️');
</script>

<!-- Backdrop -->
<div
  class="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
  role="dialog"
  aria-modal="true"
  aria-label="Level-Aufstieg"
>
  <!-- Sheet -->
  <div class="relative w-full max-w-sm rounded-t-3xl bg-white px-6 pb-10 pt-8 shadow-2xl sm:rounded-3xl">

    <!-- Konfetti-Punkte (dekorativ) -->
    <div class="pointer-events-none absolute inset-x-0 top-0 flex justify-center gap-3 -translate-y-1/2">
      {#each [0,1,2,3,4] as i}
        <div
          class="h-2.5 w-2.5 rounded-full"
          style="background: {['#22c55e','#fbbf24','#86efac','#34d399','#a3e635'][i]}; opacity: 0.85;"
        ></div>
      {/each}
    </div>

    <!-- Icon -->
    <div class="mb-5 flex justify-center">
      <div class="relative flex h-28 w-28 items-center justify-center rounded-full bg-secondary/10 shadow-inner ring-4 ring-secondary/20">
        <span class="text-5xl">{emoji}</span>
        <div class="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white shadow">
          {levelNumber}
        </div>
      </div>
    </div>

    <!-- Text -->
    <div class="text-center">
      <p class="text-xs font-semibold uppercase tracking-widest text-secondary">Level-Aufstieg!</p>
      <h2 class="mt-1 text-2xl font-bold text-heading">{levelName}</h2>
      <p class="mt-1.5 text-sm text-gray-500">Du hast Level {levelNumber} erreicht. Weiter so!</p>
    </div>

    <!-- Button -->
    <button
      onclick={onDismiss}
      class="mt-7 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white active:scale-95 transition-transform"
    >
      Weiter geht's! 🎉
    </button>
  </div>
</div>
