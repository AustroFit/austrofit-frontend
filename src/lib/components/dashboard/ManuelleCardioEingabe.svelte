<!-- src/lib/components/dashboard/ManuelleCardioEingabe.svelte -->
<!-- Manual cardio entry for dev/test mode. Builds a list of workouts, then posts all at once. -->
<script lang="ts">
  import { getAccessToken } from '$lib/utils/auth';

  interface Props {
    onSave?: () => void;
  }
  const { onSave }: Props = $props();

  const WORKOUT_TYPES: { value: string; label: string; multiplier: number; icon: string }[] = [
    { value: 'running',       label: 'Laufen',         multiplier: 2, icon: '🏃' },
    { value: 'cycling',       label: 'Radfahren',      multiplier: 2, icon: '🚴' },
    { value: 'crossTraining', label: 'CrossTraining',  multiplier: 2, icon: '💪' },
    { value: 'walking',       label: 'Gehen',          multiplier: 1, icon: '🚶' },
    { value: 'hiking',        label: 'Wandern',        multiplier: 1, icon: '🥾' },
    { value: 'stairClimbing', label: 'Treppensteigen', multiplier: 1, icon: '🪜' },
    { value: 'elliptical',    label: 'Elliptical',     multiplier: 1, icon: '⚙️' },
    { value: 'other',         label: 'Sonstiges',      multiplier: 1, icon: '🏅' },
  ];

  function buildDateOptions(): { value: string; label: string }[] {
    const opts = [];
    for (let i = 0; i < 9; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const v = d.toISOString().split('T')[0];
      let label: string;
      if (i === 0) label = 'Heute';
      else if (i === 1) label = 'Gestern';
      else {
        const wd = d.toLocaleDateString('de-AT', { weekday: 'short' });
        const dm = d.toLocaleDateString('de-AT', { day: 'numeric', month: '2-digit' });
        label = `${wd}, ${dm}`;
      }
      opts.push({ value: v, label });
    }
    return opts;
  }

  const dateOptions = buildDateOptions();

  // Preview points formula (adult group, 50/150 targets) — server-side logic mirrored for display only
  function previewPoints(eqMin: number): number {
    if (eqMin < 50) return 0;
    if (eqMin >= 150) return 200 + Math.ceil((eqMin - 150) / 10) * 15;
    return 50 + Math.ceil((eqMin - 50) / 10) * 15;
  }

  // ── Pending list ──
  interface PendingWorkout {
    workoutType: string;
    label: string;
    multiplier: number;
    durationMinutes: number;
    date: string;
    dateLabel: string;
    eqMinutes: number;
  }

  let pendingList = $state<PendingWorkout[]>([]);

  const pendingEqTotal = $derived(pendingList.reduce((s, w) => s + w.eqMinutes, 0));
  const pendingPointsPreview = $derived(previewPoints(pendingEqTotal));

  // ── Current input ──
  let workoutType = $state('running');
  let durationMinutes = $state(30);
  let selectedDate = $state(dateOptions[0].value);

  const selectedType = $derived(WORKOUT_TYPES.find((t) => t.value === workoutType)!);
  const currentEqMinutes = $derived(selectedType.multiplier * durationMinutes);

  function addToPending() {
    const dateLabel = dateOptions.find((d) => d.value === selectedDate)?.label ?? selectedDate;
    pendingList = [
      ...pendingList,
      {
        workoutType,
        label: selectedType.label,
        multiplier: selectedType.multiplier,
        durationMinutes,
        date: selectedDate,
        dateLabel,
        eqMinutes: currentEqMinutes
      }
    ];
  }

  function removeFromPending(index: number) {
    pendingList = pendingList.filter((_, i) => i !== index);
  }

  // ── Submit ──
  let saving = $state(false);
  let error = $state('');
  let lastResult = $state<{ pointsDelta: number; equivalentMinutes: number; weeklyTotal: number } | null>(null);

  async function submitAll() {
    if (saving || pendingList.length === 0) return;
    saving = true;
    error = '';
    lastResult = null;

    const token = getAccessToken();
    const workouts = pendingList.map((w) => {
      const durationSeconds = w.durationMinutes * 60;
      const startDate = `${w.date}T10:00:00.000Z`;
      const endDate = new Date(new Date(startDate).getTime() + durationSeconds * 1000).toISOString();
      return { workoutType: w.workoutType, durationSeconds, date: w.date, startDate, endDate };
    });

    try {
      const res = await fetch('/api/cardio/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ platform: 'android', workouts })
      });
      const body = await res.json();
      if (!res.ok) {
        error = body.error ?? 'Fehler beim Speichern';
      } else {
        lastResult = {
          pointsDelta: body.pointsDelta ?? 0,
          equivalentMinutes: body.equivalentMinutes ?? 0,
          weeklyTotal: body.pointsTotal ?? 0
        };
        pendingList = [];
        onSave?.();
      }
    } catch {
      error = 'Netzwerkfehler';
    } finally {
      saving = false;
    }
  }
</script>

<div>
  <!-- Header -->
  <div class="mb-3 flex items-center gap-2">
    <span class="text-sm font-semibold">🧪 Cardio-Testmodus</span>
    <span class="rounded-full bg-secondary/20 px-2 py-0.5 text-xs font-semibold text-secondary">Test</span>
  </div>
  <p class="mb-4 text-xs text-gray-500 leading-relaxed">
    Füge mehrere Einheiten zur Liste hinzu — sie werden gemeinsam als Wochentotal gesendet.
    Mehrfach absenden akkumuliert korrekt (je Typ+Tag wird dedupliziert).
  </p>

  <div class="flex flex-col gap-3">

    <!-- Workout type -->
    <div>
      <div class="mb-1.5 text-xs font-medium text-gray-500">Aktivität</div>
      <div class="flex flex-wrap gap-1.5">
        {#each WORKOUT_TYPES as t}
          <button
            onclick={() => (workoutType = t.value)}
            class="rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors
              {workoutType === t.value
                ? 'border-primary bg-primary text-white'
                : 'border-black/15 hover:bg-black/5'}"
          >
            {t.icon} {t.label} <span class="opacity-60">{t.multiplier}×</span>
          </button>
        {/each}
      </div>
    </div>

    <!-- Duration + Date -->
    <div class="flex gap-2">
      <div class="flex-1">
        <div class="mb-1.5 text-xs font-medium text-gray-500">Dauer (Min.)</div>
        <div class="flex items-center gap-1">
          <button
            onclick={() => (durationMinutes = Math.max(5, durationMinutes - 5))}
            class="rounded-lg border border-black/10 px-2.5 py-1.5 text-sm font-mono hover:bg-gray-100 transition-colors"
          >−</button>
          <input
            type="number"
            bind:value={durationMinutes}
            min="5"
            max="300"
            step="5"
            class="min-w-0 flex-1 rounded-lg border border-black/15 bg-gray-50 px-3 py-1.5 text-center text-sm outline-none transition focus:border-black focus:bg-white"
          />
          <button
            onclick={() => (durationMinutes = Math.min(300, durationMinutes + 5))}
            class="rounded-lg border border-black/10 px-2.5 py-1.5 text-sm font-mono hover:bg-gray-100 transition-colors"
          >+</button>
        </div>
      </div>
      <div class="flex-1">
        <div class="mb-1.5 text-xs font-medium text-gray-500">Tag</div>
        <select
          bind:value={selectedDate}
          class="w-full rounded-lg border border-black/15 bg-gray-50 px-3 py-1.5 text-sm outline-none transition focus:border-black focus:bg-white"
        >
          {#each dateOptions as opt}
            <option value={opt.value}>{opt.label}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- Add button with preview -->
    <button
      onclick={addToPending}
      disabled={durationMinutes < 1}
      class="flex items-center justify-between w-full rounded-xl border border-primary/40 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/10 disabled:opacity-60"
    >
      <span>+ {selectedType.icon} {selectedType.label}, {durationMinutes} Min. hinzufügen</span>
      <span class="text-xs opacity-70">{currentEqMinutes} Äquiv.min</span>
    </button>

    <!-- Pending list -->
    {#if pendingList.length > 0}
      <div class="rounded-xl border border-black/10 bg-gray-50 px-3 py-2.5">
        <div class="mb-2 text-xs font-medium text-gray-500">Warteschlange ({pendingList.length})</div>
        <div class="flex flex-col gap-1.5">
          {#each pendingList as item, i}
            <div class="flex items-center justify-between text-xs">
              <span class="font-medium">{item.label}, {item.durationMinutes} Min. · {item.dateLabel}</span>
              <div class="flex items-center gap-2">
                <span class="text-gray-400">{item.eqMinutes} Äquiv.min</span>
                <button
                  onclick={() => removeFromPending(i)}
                  class="text-gray-400 hover:text-error transition-colors"
                  aria-label="Entfernen"
                >✕</button>
              </div>
            </div>
          {/each}
        </div>
        <div class="mt-2 pt-2 border-t border-black/10 flex justify-between text-xs font-semibold">
          <span>Gesamt</span>
          <span>{pendingEqTotal} Äquiv.min → ~{pendingPointsPreview}P <span class="font-normal text-gray-400">(adult)</span></span>
        </div>
      </div>

      <!-- Submit all -->
      <button
        onclick={submitAll}
        disabled={saving}
        class="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition disabled:opacity-60 hover:bg-primary-dark"
      >
        {saving ? 'Wird gespeichert…' : `${pendingList.length} Einheit${pendingList.length > 1 ? 'en' : ''} eintragen`}
      </button>
    {/if}

    {#if error}
      <p class="text-xs text-error">{error}</p>
    {/if}

    {#if lastResult}
      <div class="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
        {#if lastResult.pointsDelta > 0}
          <p class="font-semibold text-primary">+{lastResult.pointsDelta}P vergeben ✓</p>
        {:else}
          <p class="font-semibold text-gray-600">Eingetragen – keine neuen Punkte</p>
        {/if}
        <p class="mt-0.5 text-xs text-gray-500">
          {lastResult.equivalentMinutes} Äquiv.min diese Woche · {lastResult.weeklyTotal}P Wochensumme
        </p>
      </div>
    {/if}

  </div>
</div>
