<!-- src/lib/components/CircleRing.svelte -->
<!-- Circular progress ring, fills clockwise from 12 o'clock. -->
<!-- Lap-based color logic: orange (<100%), dark-forest-green (=100%),
     then alternating primary-green / dark-forest-green for each additional lap. -->
<script lang="ts">
  import { lapDisplayPercent, lapCssColor } from '$lib/utils/progress';

  interface Props {
    /** Raw progress percentage (0–∞). Laps every 100%. */
    percent: number;
    /** @deprecated color is now derived automatically from percent. Kept for backward compat. */
    color?: string;
    /** Highlight today with a faint colored track */
    isToday?: boolean;
    /** Optional text label rendered inside the ring (e.g. day number) */
    label?: string;
    /** SVG size in px (default 36 = h-9 w-9) */
    size?: number;
    /** Accessible description for screen readers, e.g. "Schritte heute: 6.240 von 8.000 (78%)" */
    ariaLabel?: string;
  }

  const { percent = 0, isToday = false, label = '', size = 36, ariaLabel = '' }: Props = $props();

  const titleId = $derived(ariaLabel ? `ring-title-${Math.random().toString(36).slice(2, 7)}` : '');

  const STROKE_WIDTH = 4.5;
  const cx = $derived(size / 2);
  const cy = $derived(size / 2);
  const r = $derived(cx - STROKE_WIDTH / 2 - 1); // stays within bounds
  const circumference = $derived(2 * Math.PI * r);

  const raw = $derived(Math.max(0, percent));
  const displayPercent = $derived(lapDisplayPercent(raw));
  const dashOffset = $derived(circumference - (displayPercent / 100) * circumference);
  const strokeColor = $derived(lapCssColor(raw));

  // Neutral track: same gray for all days including today
  const trackColor = '#e0e0e0';

  const labelFill = $derived(
    raw === 0
      ? (isToday ? '#1B7A44' : '#9CA3AF')
      : strokeColor
  );
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 {size} {size}"
  aria-hidden={ariaLabel ? undefined : 'true'}
  aria-labelledby={ariaLabel ? titleId : undefined}
  role={ariaLabel ? 'img' : undefined}
>
  {#if ariaLabel}
    <title id={titleId}>{ariaLabel}</title>
  {/if}
  <!-- background track -->
  <circle
    {cx}
    {cy}
    r={r}
    fill="none"
    stroke={trackColor}
    stroke-width={STROKE_WIDTH}
  />

  <!-- progress arc, starting at 12 o'clock, clockwise -->
  {#if raw > 0}
    <circle
      {cx}
      {cy}
      r={r}
      fill="none"
      stroke={strokeColor}
      stroke-width={STROKE_WIDTH}
      stroke-dasharray="{circumference} {circumference}"
      stroke-dashoffset={dashOffset}
      stroke-linecap="round"
      transform="rotate(-90 {cx} {cy})"
    />
  {/if}

  <!-- label (day number for calendar view) -->
  {#if label}
    <text
      x={cx}
      y={cy}
      text-anchor="middle"
      dominant-baseline="central"
      font-size="11"
      font-weight="600"
      fill={labelFill}
    >{label}</text>
  {/if}
</svg>
