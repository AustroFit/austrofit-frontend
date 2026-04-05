<!-- src/lib/components/SyncToast.svelte -->
<!-- Brief success toast after automatic step sync or streak bonus. -->
<script lang="ts">
  interface Props {
    punkte: number;
    show: boolean;
    onHide: () => void;
    type?: 'schritte' | 'streak';
  }
  const { punkte, show, onHide, type = 'schritte' }: Props = $props();

  $effect(() => {
    if (show) {
      const t = setTimeout(onHide, 3000);
      return () => clearTimeout(t);
    }
  });
</script>

{#if show}
  <div
    role="status"
    aria-live="polite"
    class="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg bg-primary"
    style="animation: slideInUp 250ms ease-out;"
  >
    {#if type === 'streak'}
      <span>🔥</span>
      <span>+{punkte} Punkte Streak-Bonus!</span>
    {:else}
      <span>👟</span>
      <span>+{punkte} Punkte für deine Schritte!</span>
    {/if}
  </div>
{/if}

<style>
  @keyframes slideInUp {
    from { transform: translateY(16px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
</style>
