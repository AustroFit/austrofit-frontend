<!-- src/lib/components/CircleRing.svelte -->
<!-- Circular progress ring, fills clockwise from 12 o'clock. -->
<script lang="ts">
  interface Props {
    /** 0–100 fill percentage */
    percent: number;
    /** Ring color when filling */
    color?: 'primary' | 'secondary';
    /** Use brighter fill when goal is fully reached */
    complete?: boolean;
    /** Highlight today with a faint colored track */
    isToday?: boolean;
    /** Optional text label rendered inside the ring (e.g. day number) */
    label?: string;
    /** SVG size in px (default 36 = h-9 w-9) */
    size?: number;
  }

  const { percent = 0, color = 'primary', complete = false, isToday = false, label = '', size = 36 }: Props = $props();

  const STROKE_WIDTH = 4.5;
  const cx = size / 2;
  const cy = size / 2;
  const r = cx - STROKE_WIDTH / 2 - 1; // stays within bounds
  const circumference = 2 * Math.PI * r;

  const dashOffset = $derived(
    circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference
  );

  // Brighter green when goal completed, normal primary otherwise
  const strokeColor = $derived(
    color === 'secondary' ? '#F59E0B'
    : complete ? '#22c55e'
    : '#1B7A44'
  );
  // Track: faint primary for today, light gray otherwise
  const trackColor = $derived(isToday ? '#1B7A44' : '#C8E6C9');
  const trackOpacity = $derived(isToday ? 0.3 : 1);
  const labelFill = $derived(
    percent === 0
      ? (isToday ? '#1B7A44' : '#6B8F6C')
      : strokeColor
  );
</script>

<svg width={size} height={size} viewBox="0 0 {size} {size}" aria-hidden="true">
  <!-- background track -->
  <circle
    {cx}
    {cy}
    r={r}
    fill="none"
    stroke={trackColor}
    stroke-opacity={trackOpacity}
    stroke-width={STROKE_WIDTH}
  />

  <!-- progress arc, starting at 12 o'clock, clockwise -->
  {#if percent > 0}
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
