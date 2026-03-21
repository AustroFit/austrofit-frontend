<!-- src/lib/components/QRCodeCanvas.svelte -->
<!-- Rendert einen QR-Code auf einem <canvas>-Element via dynamischem Import. -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  interface Props {
    value: string;
    size?: number;
    margin?: number;
  }

  const { value, size = 120, margin = 1 }: Props = $props();

  let canvasEl = $state<HTMLCanvasElement | null>(null);

  onMount(async () => {
    if (!browser || !canvasEl || !value) return;
    try {
      const QRCode = await import('qrcode');
      await QRCode.toCanvas(canvasEl, value, {
        width: size,
        margin,
        color: { dark: '#000000', light: '#ffffff' }
      });
    } catch {
      // QR rendering failed – code text remains visible
    }
  });
</script>

<canvas bind:this={canvasEl} width={size} height={size} class="rounded-lg bg-white"></canvas>
