/**
 * Lap-based display percentage.
 * Caps progress within the current lap (0–100).
 * e.g. 150% → 50%, 200% → 100%, 201% → 1%
 */
export function lapDisplayPercent(raw: number): number {
  const r = Math.max(0, raw);
  return r <= 100 ? r : (r - 1) % 100 + 1;
}

/**
 * Lap-based Tailwind background class for progress bars.
 * <100%: bg-secondary (orange), =100%: bg-darkblue, >100%: alternating bg-primary / bg-darkblue
 */
export function lapTailwindBg(raw: number): string {
  if (raw < 100) return 'bg-gray-300';
  if (raw === 100) return 'bg-primary';
  const lap = Math.floor((raw - 1) / 100);
  return lap % 2 === 1 ? 'bg-primary' : 'bg-primary-dark';
}

/**
 * Lap-based CSS variable stroke color for SVG rings.
 */
export function lapCssColor(raw: number): string {
  if (raw < 100) return 'var(--color-gray-300)';
  if (raw === 100) return 'var(--color-primary)';
  const lap = Math.floor((raw - 1) / 100);
  return lap % 2 === 1 ? 'var(--color-primary)' : 'var(--color-primary-dark)';
}
