<!-- src/lib/components/SchrittSyncButton.svelte -->
<!-- Manual step sync button for the dashboard. Only visible on native builds. -->
<script lang="ts">
  import { browser } from '$app/environment';
  import { syncSteps, getLastSyncTime, type SyncResult } from '$lib/services/stepSync';
  import { track } from '$lib/utils/mixpanel';

  interface Props {
    onSyncComplete: (result: SyncResult) => void;
  }
  const { onSyncComplete }: Props = $props();

  type SyncState = 'idle' | 'syncing' | 'success' | 'error';

  let syncState = $state<SyncState>('idle');
  let lastPunkte = $state(0);
  let lastSyncDisplay = $state('');

  function formatLastSync(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    const diffMs = Date.now() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'gerade eben';
    if (diffMin < 60) return `vor ${diffMin} Min.`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) {
      const time = d.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' });
      return `heute um ${time}`;
    }
    return 'gestern';
  }

  $effect(() => {
    if (!browser) return;
    lastSyncDisplay = formatLastSync(getLastSyncTime());
    // Refresh display every minute
    const interval = setInterval(() => {
      lastSyncDisplay = formatLastSync(getLastSyncTime());
    }, 60_000);
    return () => clearInterval(interval);
  });

  async function handleSync() {
    if (syncState === 'syncing') return;
    syncState = 'syncing';
    try {
      const result = await syncSteps({ days: 7, mode: 'automatic' });
      lastPunkte = result.punkte_total;
      syncState = 'success';
      lastSyncDisplay = formatLastSync(getLastSyncTime());
      track('steps_synced', { punkte: result.punkte_total, days: 7 });
      onSyncComplete(result);
      setTimeout(() => { syncState = 'idle'; }, 3000);
    } catch {
      syncState = 'error';
      setTimeout(() => { syncState = 'idle'; }, 5000);
    }
  }
</script>

<div class="flex flex-col gap-1.5">
  <button
    onclick={handleSync}
    disabled={syncState === 'syncing'}
    class="flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60
      {syncState === 'error'
        ? 'border-error/30 bg-error/5 text-error'
        : syncState === 'success'
          ? 'border-primary/30 bg-primary/5 text-primary'
          : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'}"
  >
    {#if syncState === 'syncing'}
      <span class="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></span>
      <span>Synchronisiere…</span>
    {:else if syncState === 'success'}
      <span>✓</span>
      <span>Synchronisiert{lastPunkte > 0 ? ` · +${lastPunkte} Punkte` : ''}</span>
    {:else if syncState === 'error'}
      <span>⚠</span>
      <span>Fehler – erneut versuchen</span>
    {:else}
      <!-- sync icon (two circular arrows) -->
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
      </svg>
      <span>Schritte synchronisieren</span>
    {/if}
  </button>

  {#if lastSyncDisplay}
    <p class="text-center text-xs text-gray-400">Zuletzt: {lastSyncDisplay}</p>
  {/if}
</div>
