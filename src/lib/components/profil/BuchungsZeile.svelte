<!-- src/lib/components/profil/BuchungsZeile.svelte -->
<!-- Eine Zeile in der Punkte-Buchungshistorie -->
<script lang="ts">
  export interface LedgerEntry {
    id: string;
    points_delta: number;
    source_type: string;
    source_ref: string | null;
    occurred_at: string | null;
    created_at: string | null;
    meta?: { steps?: number } | null;
    description?: string | null;
  }

  interface Props {
    buchung: LedgerEntry;
    zeige_datum?: boolean;
  }

  let { buchung, zeige_datum = true }: Props = $props();

  const SOURCE_MAP: Record<string, { icon: string; label: string }> = {
    education:   { icon: '📚', label: 'Quiz abgeschlossen' },
    onboarding:  { icon: '🎁', label: 'Onboarding-Bonus' },
    streak:      { icon: '🔥', label: 'Wochen-Streak-Bonus' },
    streak_tag:  { icon: '🔥', label: 'Tages-Streak-Bonus' },
    streak_quiz: { icon: '🧠', label: 'Quiz-Streak-Bonus' },
    cardio:      { icon: '🏃', label: 'Bewegung' },
    milestone:   { icon: '🏅', label: 'Erster Erfolg' }, // Fallback; slug-spezifisch unten überschrieben
    einloesung:  { icon: '🎫', label: 'Gutschein eingelöst' },
    awin_unlock: { icon: '🔓', label: 'Online-Rabattcode freigeschaltet' },
  };

  const MILESTONE_LABELS: Record<string, { icon: string; label: string }> = {
    first_step:                { icon: '👟', label: 'Erstes Tagesziel erreicht' },
    first_step_streak_day:     { icon: '🔥', label: 'Erster Schritte-Streak-Tag' },
    first_streak_4:            { icon: '🔥', label: '4 Tage Schritte-Streak' },
    first_step_streak_week:    { icon: '🏅', label: 'Erste Schritte-Streak-Woche' },
    second_step_streak_week:   { icon: '🏅', label: '2 Schritte-Streak-Wochen' },
    third_step_streak_week:    { icon: '🏅', label: '3 Schritte-Streak-Wochen' },
    fourth_step_streak_week:   { icon: '🏅', label: '1 Monat Schritte-Streak' },
    first_cardio:              { icon: '🏃', label: 'Erste Bewegungswoche' },
    first_cardio_streak_week:  { icon: '🏃', label: '2 Bewegungswochen am Stück' },
    second_cardio_streak_week: { icon: '🏃', label: '3 Bewegungswochen am Stück' },
    third_cardio_streak_week:  { icon: '🏃', label: '1 Monat Bewegungs-Streak' },
    first_quiz:                { icon: '📚', label: 'Erstes Quiz abgeschlossen' },
    first_quiz_streak_day:     { icon: '🧠', label: 'Erster Quiz-Streak-Tag' },
    first_quiz_streak_4:       { icon: '🧠', label: '4 Tage Quiz-Streak' },
    first_quiz_streak_week:    { icon: '🧠', label: 'Erste Quiz-Streak-Woche' },
    second_quiz_streak_week:   { icon: '🧠', label: '2 Quiz-Streak-Wochen' },
    third_quiz_streak_week:    { icon: '🧠', label: '3 Quiz-Streak-Wochen' },
    fourth_quiz_streak_week:   { icon: '🧠', label: '1 Monat Quiz-Streak' },
  };

  const mapped = $derived.by(() => {
    // Schritte: ≥40P = Tagesziel erreicht (7.000 Schritte), <40P = Schritte-Bonus (Delta-Korrektur)
    if (buchung.source_type === 'schritte' || buchung.source_type === 'step') {
      const base = buchung.points_delta >= 40
        ? { icon: '👟', label: 'Tagesziel erreicht' }
        : { icon: '👟', label: 'Schritte-Bonus' };
      return buchung.description ? { ...base, label: buchung.description } : base;
    }
    // Milestone: slug aus source_ref extrahieren (Format: "milestone-{slug}")
    if (buchung.source_type === 'milestone') {
      const slug = String(buchung.source_ref ?? '').replace(/^milestone-/, '');
      const milestoneEntry = MILESTONE_LABELS[slug] ?? { icon: '🏅', label: 'Erster Erfolg' };
      return buchung.description ? { ...milestoneEntry, label: buchung.description } : milestoneEntry;
    }
    const base = SOURCE_MAP[buchung.source_type] ?? { icon: '⚡', label: buchung.source_type };
    return buchung.description ? { ...base, label: buchung.description } : base;
  });
  const isPositive = $derived(buchung.points_delta >= 0);

  import { formatDateShort } from '$lib/utils/date';

  const date = $derived(formatDateShort(buchung.occurred_at ?? buchung.created_at));
</script>

<div class="flex items-center gap-3 py-3">
  <div
    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-base"
  >
    {mapped.icon}
  </div>
  <div class="min-w-0 flex-1">
    <div class="text-sm font-medium">{mapped.label}</div>
    {#if zeige_datum && date}
      <div class="text-xs text-gray-400">{date}</div>
    {/if}
  </div>
  <div
    class="shrink-0 text-sm font-semibold {isPositive ? 'text-primary' : 'text-error'}"
  >
    {isPositive ? '+' : ''}{buchung.points_delta} P
  </div>
</div>
