<!-- src/lib/components/SyncToast.svelte -->
<!-- Brief success toast after automatic step sync. -->
<script lang="ts">
  interface Props {
    punkte: number;
    show: boolean;
    onHide: () => void;
  }
  const { punkte, show, onHide }: Props = $props();

  $effect(() => {
    if (show) {
      const t = setTimeout(onHide, 3000);
      return () => clearTimeout(t);
    }
  });
</script>

{#if show}
  <div
    class="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg"
    style="background:#4CAF50; animation: slideInUp 250ms ease-out;"
  >
    <span>👟</span>
    <span>+{punkte} Punkte für deine Schritte!</span>
  </div>
{/if}

<style>
  @keyframes slideInUp {
    from { transform: translateY(16px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
</style>
