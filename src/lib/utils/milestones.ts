// src/lib/utils/milestones.ts
// Central milestone definitions – one-time achievement bonuses.
// Points = same as the regular reward earned at that milestone moment.

export const MILESTONES = {
  // ── Step milestones ─────────────────────────────────────────────────────
  first_step:              40,  // Erstes ≥7.000-Schritte-Tagesziel
  first_step_streak_day:   20,  // Erster Streak-Tag-Bonus (Tag 2)
  first_streak_4:          80,  // Erste 4-Tage-Streak
  first_step_streak_week:  60,  // Erste Streak-Woche (Tag 8)
  second_step_streak_week: 90,  // 2. Streak-Woche (Tag 15)
  third_step_streak_week:  90,  // 3. Streak-Woche (Tag 22)
  fourth_step_streak_week: 120, // 4. Streak-Woche / 1 Monat (Tag 29)
  // ── Cardio milestones ───────────────────────────────────────────────────
  first_cardio:                 50,  // Erste gewertete Cardio-Woche (≥ Start-Schwelle)
  first_cardio_streak_week:    100,  // Erste volle Cardio-Streak-Woche (W2)
  second_cardio_streak_week:   100,  // W3
  third_cardio_streak_week:    200,  // W4 / 1 Monat
  // ── Quiz milestones ─────────────────────────────────────────────────────
  first_quiz:              40, // Erstes erfolgreich geclaimtes Quiz
  first_quiz_streak_day:    5, // Erster Quiz-Streak-Tag-Bonus (Tag 2)
  first_quiz_streak_4:     80, // Erste 4-Tage-Quiz-Streak
  first_quiz_streak_week:  30, // Erste Quiz-Streak-Woche (Tag 8)
  second_quiz_streak_week: 50, // Tag 15
  third_quiz_streak_week:  75, // Tag 22
  fourth_quiz_streak_week: 75, // Tag 29 / 1 Monat
} as const;

export type MilestoneSlug = keyof typeof MILESTONES;
