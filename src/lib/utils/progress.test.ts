import { describe, it, expect } from 'vitest';
import { lapDisplayPercent, lapTailwindBg, lapCssColor } from './progress';

// ── lapDisplayPercent ──────────────────────────────────────────────────────────

describe('lapDisplayPercent', () => {
  it('0–100% → unverändert', () => {
    expect(lapDisplayPercent(0)).toBe(0);
    expect(lapDisplayPercent(50)).toBe(50);
    expect(lapDisplayPercent(100)).toBe(100);
  });

  it('150% → 50% (halber zweiter Lap)', () => {
    expect(lapDisplayPercent(150)).toBe(50);
  });

  it('200% → 100% (Ende zweiter Lap)', () => {
    expect(lapDisplayPercent(200)).toBe(100);
  });

  it('201% → 1% (Beginn dritter Lap)', () => {
    expect(lapDisplayPercent(201)).toBe(1);
  });

  it('negativ → 0', () => {
    expect(lapDisplayPercent(-10)).toBe(0);
  });
});

// ── lapCssColor ────────────────────────────────────────────────────────────────

describe('lapCssColor', () => {
  it('unter 100% → grau', () => {
    expect(lapCssColor(0)).toBe('#9CA3AF');
    expect(lapCssColor(99)).toBe('#9CA3AF');
  });

  it('genau 100% → primary', () => {
    expect(lapCssColor(100)).toBe('var(--color-primary)');
  });

  it('101–200% → primary (Lap 1)', () => {
    expect(lapCssColor(101)).toBe('var(--color-primary)');
    expect(lapCssColor(200)).toBe('var(--color-primary)');
  });

  it('201–300% → primary-dark (Lap 2)', () => {
    expect(lapCssColor(201)).toBe('var(--color-primary-dark)');
    expect(lapCssColor(300)).toBe('var(--color-primary-dark)');
  });

  it('301–400% → primary wieder (Lap 3)', () => {
    expect(lapCssColor(301)).toBe('var(--color-primary)');
  });
});

// ── lapTailwindBg ──────────────────────────────────────────────────────────────

describe('lapTailwindBg', () => {
  it('unter 100% → grau', () => {
    expect(lapTailwindBg(0)).toBe('bg-[#9CA3AF]');
    expect(lapTailwindBg(99)).toBe('bg-[#9CA3AF]');
  });

  it('genau 100% → bg-primary', () => {
    expect(lapTailwindBg(100)).toBe('bg-primary');
  });

  it('101–200% → bg-primary', () => {
    expect(lapTailwindBg(101)).toBe('bg-primary');
    expect(lapTailwindBg(200)).toBe('bg-primary');
  });

  it('201–300% → bg-primary-dark', () => {
    expect(lapTailwindBg(201)).toBe('bg-primary-dark');
    expect(lapTailwindBg(300)).toBe('bg-primary-dark');
  });
});
