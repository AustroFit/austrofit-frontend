import { describe, it, expect, vi, afterEach } from 'vitest';
import { calculatePoints, calculateStreakDays, lookupTierBonus, FALLBACK_STREAK_TIERS } from './streak';

// ── calculatePoints ────────────────────────────────────────────────────────────

describe('calculatePoints', () => {
  it('unter 4000 Schritte → 0 Punkte', () => {
    expect(calculatePoints(0)).toBe(0);
    expect(calculatePoints(3999)).toBe(0);
  });

  it('genau 4000 Schritte → 10 Punkte', () => {
    expect(calculatePoints(4000)).toBe(10);
  });

  it('4500 Schritte → 15 Punkte (erste 500er-Stufe)', () => {
    expect(calculatePoints(4500)).toBe(15);
  });

  it('6999 Schritte → 35 Punkte (letzte Stufe vor 7k)', () => {
    // floor((6999-4000)/500) = floor(5.998) = 5 → 10 + 5*5 = 35
    expect(calculatePoints(6999)).toBe(35);
  });

  it('genau 7000 Schritte → 40 Punkte (Sprung)', () => {
    expect(calculatePoints(7000)).toBe(40);
  });

  it('7500 Schritte → 45 Punkte', () => {
    expect(calculatePoints(7500)).toBe(45);
  });

  it('10000 Schritte → 70 Punkte', () => {
    // floor((10000-7000)/500) = 6 → 40 + 6*5 = 70
    expect(calculatePoints(10000)).toBe(70);
  });
});

// ── lookupTierBonus ────────────────────────────────────────────────────────────

describe('lookupTierBonus – step_tag', () => {
  const tiers = FALLBACK_STREAK_TIERS;

  it('Tag 1 → 0 Punkte (kein Bonus am ersten Tag)', () => {
    expect(lookupTierBonus(1, tiers, 'step_tag')).toBe(0);
  });

  it('Tag 2 → 20P (Tier 1 Beginn)', () => {
    expect(lookupTierBonus(2, tiers, 'step_tag')).toBe(20);
  });

  it('Tag 13 → 20P (Tier 1 Ende)', () => {
    expect(lookupTierBonus(13, tiers, 'step_tag')).toBe(20);
  });

  it('Tag 14 → 30P (Tier 2 Beginn)', () => {
    expect(lookupTierBonus(14, tiers, 'step_tag')).toBe(30);
  });

  it('Tag 27 → 30P (Tier 2 Ende)', () => {
    expect(lookupTierBonus(27, tiers, 'step_tag')).toBe(30);
  });

  it('Tag 28 → 45P (Tier 3)', () => {
    expect(lookupTierBonus(28, tiers, 'step_tag')).toBe(45);
  });

  it('Tag 55 → 45P (Tier 3 Ende)', () => {
    expect(lookupTierBonus(55, tiers, 'step_tag')).toBe(45);
  });

  it('Tag 56 → 60P (Tier 4, kein max)', () => {
    expect(lookupTierBonus(56, tiers, 'step_tag')).toBe(60);
  });

  it('Tag 200 → 60P (Tier 4, weit über min_value)', () => {
    expect(lookupTierBonus(200, tiers, 'step_tag')).toBe(60);
  });
});

describe('lookupTierBonus – quiz_tag', () => {
  const tiers = FALLBACK_STREAK_TIERS;

  it('Tag 2–6 → 5P (Tier 1)', () => {
    expect(lookupTierBonus(2, tiers, 'quiz_tag')).toBe(5);
    expect(lookupTierBonus(6, tiers, 'quiz_tag')).toBe(5);
  });

  it('Tag 7–13 → 10P (Tier 2)', () => {
    expect(lookupTierBonus(7, tiers, 'quiz_tag')).toBe(10);
    expect(lookupTierBonus(13, tiers, 'quiz_tag')).toBe(10);
  });

  it('Tag 14–29 → 15P (Tier 3)', () => {
    expect(lookupTierBonus(14, tiers, 'quiz_tag')).toBe(15);
    expect(lookupTierBonus(29, tiers, 'quiz_tag')).toBe(15);
  });

  it('Tag 30+ → 20P (Tier 4)', () => {
    expect(lookupTierBonus(30, tiers, 'quiz_tag')).toBe(20);
    expect(lookupTierBonus(100, tiers, 'quiz_tag')).toBe(20);
  });
});

describe('lookupTierBonus – cardio_week', () => {
  const tiers = FALLBACK_STREAK_TIERS;

  it('Woche 1 → 0P (kein Bonus in Woche 1)', () => {
    expect(lookupTierBonus(1, tiers, 'cardio_week')).toBe(0);
  });

  it('Woche 2–3 → 100P (Tier 1)', () => {
    expect(lookupTierBonus(2, tiers, 'cardio_week')).toBe(100);
    expect(lookupTierBonus(3, tiers, 'cardio_week')).toBe(100);
  });

  it('Woche 4–7 → 200P (Tier 2)', () => {
    expect(lookupTierBonus(4, tiers, 'cardio_week')).toBe(200);
    expect(lookupTierBonus(7, tiers, 'cardio_week')).toBe(200);
  });

  it('Woche 8–11 → 300P (Tier 3)', () => {
    expect(lookupTierBonus(8, tiers, 'cardio_week')).toBe(300);
    expect(lookupTierBonus(11, tiers, 'cardio_week')).toBe(300);
  });

  it('Woche 12+ → 400P (Tier 4)', () => {
    expect(lookupTierBonus(12, tiers, 'cardio_week')).toBe(400);
    expect(lookupTierBonus(50, tiers, 'cardio_week')).toBe(400);
  });
});

// ── calculateStreakDays ────────────────────────────────────────────────────────

describe('calculateStreakDays', () => {
  afterEach(() => vi.useRealTimers());

  it('erster Tag → Streak 1', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-04T10:00:00Z'));
    expect(calculateStreakDays([], '2026-04-04')).toBe(1);
  });

  it('zwei aufeinanderfolgende Tage → Streak 2', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-04T10:00:00Z'));
    expect(calculateStreakDays(['2026-04-03'], '2026-04-04')).toBe(2);
  });

  it('Lücke im Datum bricht Streak', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-04T10:00:00Z'));
    // 02. April fehlt → Streak ist nur 1 (nur heute)
    expect(calculateStreakDays(['2026-04-01'], '2026-04-04')).toBe(1);
  });

  it('7-Tage-Streak wird korrekt gezählt', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-07T10:00:00Z'));
    const existing = ['2026-04-01', '2026-04-02', '2026-04-03', '2026-04-04', '2026-04-05', '2026-04-06'];
    expect(calculateStreakDays(existing, '2026-04-07')).toBe(7);
  });
});
