<!-- src/lib/components/dashboard/OnboardingChecklist.svelte -->
<!-- Onboarding-Checkliste: zeigt 3 Einstiegs-Aufgaben für neue User. -->
<!-- Wird ausgeblendet sobald onboarding_checklist_completed_at gesetzt ist. -->
<script lang="ts">
  import { apiUrl } from '$lib/utils/api';
  import { getAccessToken } from '$lib/utils/auth';

  interface Props {
    healthConnected: boolean;
    hasCompletedFirstQuiz: boolean;
    streakDays: number;
    onDismiss: () => void;
  }

  const { healthConnected, hasCompletedFirstQuiz, streakDays, onDismiss }: Props = $props();

  let open = $state(true);
  let dismissing = $state(false);

  const items = $derived([
    {
      id: 'health',
      label: 'Health-App verbinden',
      description: '+20 Punkte',
      done: healthConnected
    },
    {
      id: 'quiz',
      label: 'Ersten Quiz lösen',
      description: '+40 Punkte',
      done: hasCompletedFirstQuiz
    },
    {
      id: 'streak',
      label: '3-Tage-Streak erreichen',
      description: '+20 Punkte',
      done: streakDays >= 3
    }
  ]);

  const completedCount = $derived(items.filter((i) => i.done).length);
  const allDone = $derived(completedCount === items.length);

  async function dismiss() {
    if (dismissing) return;
    dismissing = true;
    try {
      const token = getAccessToken();
      if (token) {
        await fetch(apiUrl('/api/profile'), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ onboarding_checklist_completed_at: new Date().toISOString() })
        });
      }
    } catch { /* non-critical */ } finally {
      dismissing = false;
      onDismiss();
    }
  }
</script>

<div class="rounded-[var(--radius-card)] border border-primary/20 bg-primary/5 p-4">
  <button
    class="flex w-full items-center justify-between gap-2 text-left"
    onclick={() => (open = !open)}
    aria-expanded={open}
  >
    <div class="flex items-center gap-2">
      <span class="text-base">🚀</span>
      <span class="text-sm font-semibold text-heading">Erste Schritte</span>
      <span class="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
        {completedCount}/{items.length}
      </span>
    </div>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
      class="h-4 w-4 text-gray-400 transition-transform {open ? 'rotate-180' : ''}">
      <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
    </svg>
  </button>

  {#if open}
    <div class="mt-3 flex flex-col gap-2">
      {#each items as item (item.id)}
        <div class="flex items-center gap-3">
          <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2
            {item.done ? 'border-primary bg-primary' : 'border-gray-300 bg-white'}">
            {#if item.done}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5 text-white">
                <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
              </svg>
            {/if}
          </div>
          <div class="flex-1">
            <span class="text-sm {item.done ? 'line-through text-gray-400' : 'text-heading font-medium'}">{item.label}</span>
          </div>
          <span class="text-xs font-semibold {item.done ? 'text-primary' : 'text-gray-400'}">{item.description}</span>
        </div>
      {/each}
    </div>

    <div class="mt-3 flex items-center justify-between border-t border-primary/10 pt-3">
      {#if allDone}
        <p class="text-xs font-medium text-primary">🎉 Alle Aufgaben erledigt!</p>
      {:else}
        <p class="text-xs text-body/60">Schließ die Aufgaben ab und sammle Punkte.</p>
      {/if}
      <button
        onclick={dismiss}
        disabled={dismissing}
        class="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600 disabled:opacity-50"
      >
        {dismissing ? '…' : 'Ausblenden'}
      </button>
    </div>
  {/if}
</div>
