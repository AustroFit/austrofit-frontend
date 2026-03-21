<script>
  import { goto } from '$app/navigation';

  /**
   * @typedef {{ id: string, label: string }} BlockItem
   * @type {{ blocks: BlockItem[], activeBlock: string|null }}
   */
  const { blocks, activeBlock } = $props();

  /** @param {string|null} blockId */
  function select(blockId) {
    const path = blockId
      ? `/gesundheitswegweiser?block=${blockId}`
      : '/gesundheitswegweiser';
    goto(path, { noScroll: true, keepFocus: true });
  }
</script>

<div class="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
  <!-- "Alle" chip -->
  <button
    onclick={() => select(null)}
    class="shrink-0 rounded-[var(--radius-pill)] border px-4 py-1.5 text-sm font-medium transition-colors
      {!activeBlock
        ? 'bg-primary border-primary text-white'
        : 'border-black/15 bg-white text-body hover:border-primary hover:text-primary'}"
  >
    Alle
  </button>

  {#each blocks as block (block.id)}
    <button
      onclick={() => select(block.id)}
      class="shrink-0 rounded-[var(--radius-pill)] border px-4 py-1.5 text-sm font-medium transition-colors
        {activeBlock === block.id
          ? 'bg-primary border-primary text-white'
          : 'border-black/15 bg-white text-body hover:border-primary hover:text-primary'}"
    >
      {block.label}
    </button>
  {/each}
</div>
