<!-- src/lib/components/dashboard/ManuelleSchrittEingabe.svelte -->
<!-- Manual step entry for the test mode / PWA users. -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { getAccessToken } from '$lib/utils/auth';
  import { calculatePoints } from '$lib/utils/streak';
  import { track } from '$lib/utils/mixpanel';

  interface Props {
    userId: string;
    onSave?: () => void;
  }
  const { userId, onSave }: Props = $props();

  const STEP_GOAL = 7000;
  const DAYS = 8;

  interface DayEntry {
    date: string; // YYYY-MM-DD
    label: string; // "Heute", "Gestern", "Mo, 24.02."
    steps: number; // current input value
    existingPoints: number | null; // null = not entered yet
    saving: boolean;
    error: string;
    success: boolean;
  }

  let entries = $state<DayEntry[]>([]);
  let loadingEntries = $state(true);
  let bulkSaving = $state(false);
  let bulkSuccess = $state(false);

  // ── Helpers ───────────────────────────────────────────────────────────────

  function formatLabel(dateStr: string, daysAgo: number): string {
    if (daysAgo === 0) return 'Heute';
    if (daysAgo === 1) return 'Gestern';
    const d = new Date(dateStr + 'T12:00:00');
    const wd = d.toLocaleDateString('de-AT', { weekday: 'short' });
    const dm = d.toLocaleDateString('de-AT', { day: 'numeric', month: '2-digit' });
    return `${wd}, ${dm}`;
  }

  function buildDays(): DayEntry[] {
    const days: DayEntry[] = [];
    for (let i = 0; i < DAYS; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        label: formatLabel(dateStr, i),
        steps: STEP_GOAL,
        existingPoints: null,
        saving: false,
        error: '',
        success: false
      });
    }
    return days;
  }

  // ── Load ──────────────────────────────────────────────────────────────────

  onMount(async () => {
    if (!browser) return;
    entries = buildDays();

    const token = getAccessToken();
    if (!token || !userId) {
      loadingEntries = false;
      return;
    }

    try {
      const res = await fetch(`/api/ledger-entries?user=${userId}&source_type=schritte&limit=30`);
      if (res.ok) {
        const body = await res.json();
        // Build date → points_delta map from existing entries
        const byDate = new Map<string, number>();
        for (const entry of body.data ?? []) {
          const d = (entry.source_ref ?? '').split('T')[0];
          if (d && !byDate.has(d)) byDate.set(d, entry.points_delta ?? 0);
        }
        entries = entries.map((e) => ({
          ...e,
          existingPoints: byDate.has(e.date) ? byDate.get(e.date)! : null
        }));
      }
    } catch (err) {
      console.warn('[ManuelleSchrittEingabe] load failed', err);
    } finally {
      loadingEntries = false;
    }
  });

  // ── Actions ───────────────────────────────────────────────────────────────

  async function saveDay(i: number) {
    const entry = entries[i];
    if (entry.saving || entry.existingPoints !== null) return;

    entries[i].saving = true;
    entries[i].error = '';

    const token = getAccessToken();
    try {
      const res = await fetch('/api/steps/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ date: entry.date, steps: entry.steps })
      });
      const body = await res.json();
      if (!res.ok) {
        entries[i].error = body.error ?? 'Fehler beim Speichern';
      } else {
        entries[i].existingPoints = body.punkte;
        entries[i].success = true;
        if (body.milestone_goal_awarded) {
          track('challenge_completed', { challenge_id: 'first-steps', challenge_type: 'first_goal' });
        }
        if (body.milestone_streak3_awarded) {
          track('challenge_completed', { challenge_id: 'first-streak-3', challenge_type: 'milestone' });
        }
        onSave?.();
      }
    } catch {
      entries[i].error = 'Netzwerkfehler';
    } finally {
      entries[i].saving = false;
    }
  }

  async function saveAll() {
    if (bulkSaving) return;
    const missing = entries.filter((e) => e.existingPoints === null);
    if (missing.length === 0) return;

    const totalP = missing.reduce((s) => s + calculatePoints(STEP_GOAL), 0);
    const ok = window.confirm(
      `${missing.length} Tage werden mit je 7.000 Schritten eingetragen – insgesamt ~${totalP} Punkte.\n\nFortfahren?`
    );
    if (!ok) return;

    bulkSaving = true;
    const token = getAccessToken();

    for (const entry of missing) {
      try {
        const res = await fetch('/api/steps/manual', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ date: entry.date, steps: STEP_GOAL })
        });
        const body = await res.json();
        const idx = entries.findIndex((e) => e.date === entry.date);
        if (idx >= 0) {
          if (res.ok) {
            entries[idx].existingPoints = body.punkte;
            entries[idx].success = true;
          } else {
            entries[idx].error = body.error ?? 'Fehler';
          }
        }
      } catch {
        /* continue with next day */
      }
    }

    bulkSaving = false;
    bulkSuccess = true;
    setTimeout(() => (bulkSuccess = false), 4000);
    onSave?.();
  }

  const missingCount = $derived(entries.filter((e) => e.existingPoints === null).length);
  const totalBulkPoints = $derived(missingCount * calculatePoints(STEP_GOAL));
</script>

{#if loadingEntries}
  <div class="flex items-center gap-2 py-4 text-sm text-gray-400">
    <div class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-500"></div>
    <span>Lade Einträge…</span>
  </div>
{:else}
  <!-- Header -->
  <div class="mb-3 flex items-center gap-2">
    <span class="text-sm font-semibold">🧪 Schritt-Testmodus</span>
    <span class="rounded-full bg-secondary/20 px-2 py-0.5 text-xs font-semibold text-secondary">
      Test
    </span>
  </div>
  <p class="mb-4 text-sm text-gray-500 leading-relaxed">
    Trage deine Schritte für die letzten Tage ein, um das Punkte-System zu testen.
  </p>

  <!-- Day rows -->
  <div class="flex flex-col gap-2">
    {#each entries as entry, i}
      <div
        class="rounded-xl border px-4 py-3
          {entry.existingPoints !== null
            ? 'border-primary/30 bg-primary/5'
            : 'border-black/10 bg-white'}"
      >
        {#if entry.existingPoints !== null}
          <!-- Already entered -->
          <div class="flex items-center justify-between gap-3">
            <span class="text-sm font-medium text-gray-700">{entry.label}</span>
            <span class="text-xs font-semibold text-primary">
              ✅ {entry.existingPoints}P vergeben
            </span>
          </div>
        {:else}
          <!-- Input row -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">{entry.label}</span>
              <span class="text-xs font-bold text-primary">
                → {calculatePoints(entry.steps)}P
              </span>
            </div>
            <div class="flex items-center gap-1.5">
              <button
                onclick={() => {
                  entries[i].steps = Math.max(0, entries[i].steps - 500);
                }}
                class="rounded-lg border border-black/10 px-2.5 py-1.5 text-sm font-mono hover:bg-gray-100 transition-colors"
              >
                −
              </button>
              <input
                type="number"
                bind:value={entries[i].steps}
                min="0"
                max="100000"
                step="500"
                class="min-w-0 flex-1 rounded-lg border border-black/15 bg-gray-50 px-3 py-1.5 text-center text-sm outline-none transition focus:border-black focus:bg-white"
              />
              <button
                onclick={() => {
                  entries[i].steps = Math.min(100000, entries[i].steps + 500);
                }}
                class="rounded-lg border border-black/10 px-2.5 py-1.5 text-sm font-mono hover:bg-gray-100 transition-colors"
              >
                +
              </button>
              <button
                onclick={() => saveDay(i)}
                disabled={entry.saving}
                class="shrink-0 rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-white transition disabled:opacity-60"
              >
                {entry.saving ? '…' : 'Speichern'}
              </button>
            </div>
            {#if entry.error}
              <p class="text-xs text-error">{entry.error}</p>
            {/if}
            {#if entry.success}
              <p class="text-xs text-primary">✓ Gespeichert!</p>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Bulk save -->
  {#if missingCount > 0}
    <div class="mt-4 border-t border-black/5 pt-4">
      {#if bulkSuccess}
        <p class="mb-2 text-xs text-primary">✓ Alle fehlenden Tage wurden eingetragen!</p>
      {/if}
      <button
        onclick={saveAll}
        disabled={bulkSaving}
        class="w-full rounded-xl border border-black/15 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
      >
        {bulkSaving
          ? 'Wird eingetragen…'
          : `7.000 Schritte für alle ${missingCount} fehlenden Tage (~${totalBulkPoints}P)`}
      </button>
    </div>
  {:else}
    <p class="mt-4 text-center text-xs text-gray-400">
      Alle Tage der letzten Woche sind eingetragen.
    </p>
  {/if}
{/if}
