<!-- Badge-Freischalt-Overlay: zeigt neu verdiente Badges nacheinander -->
<script lang="ts">
  interface Badge {
    id: number;
    name: string;
    description: string;
    typ: string;
    image_url: string | null;
  }

  let { badges, onDismissAll }: { badges: Badge[]; onDismissAll: () => void } = $props();

  let currentIndex = $state(0);
  let animating = $state(false);

  const current = $derived(badges[currentIndex]);
  const isLast = $derived(currentIndex >= badges.length - 1);

  const TYP_EMOJI: Record<string, string> = {
    hauptstadt: '🏙️',
    bundesland: '🗺️',
    oesterreich: '🇦🇹',
    wanderweg: '🥾',
    see: '🏊',
    berg: '⛰️',
  };

  function dismiss() {
    if (animating) return;
    if (isLast) {
      onDismissAll();
    } else {
      animating = true;
      setTimeout(() => {
        currentIndex++;
        animating = false;
      }, 200);
    }
  }
</script>

<!-- Backdrop -->
<div
  class="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
  role="dialog"
  aria-modal="true"
  aria-label="Neue Auszeichnung"
>
  <!-- Sheet -->
  <div
    class="relative w-full max-w-sm rounded-t-3xl bg-white px-6 pb-10 pt-8 shadow-2xl sm:rounded-3xl
      {animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'} transition-all duration-200"
  >
    <!-- Konfetti-Punkte (dekorativ) -->
    <div class="pointer-events-none absolute inset-x-0 top-0 flex justify-center gap-3 -translate-y-1/2">
      {#each [0,1,2,3,4] as i}
        <div
          class="h-2.5 w-2.5 rounded-full"
          style="background: {['#22c55e','#86efac','#fbbf24','#34d399','#a3e635'][i]}; opacity: 0.85;"
        ></div>
      {/each}
    </div>

    <!-- Zähler wenn mehrere -->
    {#if badges.length > 1}
      <div class="mb-4 text-center text-xs font-medium text-gray-400">
        {currentIndex + 1} / {badges.length}
      </div>
    {/if}

    <!-- Badge-Bild / Emoji -->
    <div class="mb-5 flex justify-center">
      <div class="relative flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 shadow-inner ring-4 ring-primary/20">
        {#if current.image_url}
          <img src={current.image_url} alt={current.name} class="h-20 w-20 object-contain" />
        {:else}
          <span class="text-5xl">{TYP_EMOJI[current.typ] ?? '🏅'}</span>
        {/if}
        <!-- Stern-Badge -->
        <div class="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400 text-sm shadow">
          ⭐
        </div>
      </div>
    </div>

    <!-- Text -->
    <div class="text-center">
      <p class="text-xs font-semibold uppercase tracking-widest text-primary">Neue Auszeichnung</p>
      <h2 class="mt-1 text-xl font-bold text-heading">{current.name}</h2>
      <p class="mt-1.5 text-sm text-gray-500">{current.description}</p>
    </div>

    <!-- Button -->
    <button
      onclick={dismiss}
      class="mt-7 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white active:scale-95 transition-transform"
    >
      {isLast ? 'Super, weiter so! 🎉' : 'Nächste Auszeichnung →'}
    </button>
  </div>
</div>
