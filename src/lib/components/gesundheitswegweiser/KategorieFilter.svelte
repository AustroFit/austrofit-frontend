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

<div class="flex gap-2 overflow-x-auto pb-0.5" style="-ms-overflow-style:none; scrollbar-width:none;">
  <!-- "Alle" chip -->
  <button
    onclick={() => select(null)}
    class="shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap
      {!activeBlock
        ? 'border-transparent text-white'
        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900'}"
    style={!activeBlock ? 'background: #5EA500; border-color: #5EA500;' : ''}
  >
    Alle
  </button>

  {#each blocks as block (block.id)}
    <button
      onclick={() => select(block.id)}
      class="shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap
        {activeBlock === block.id
          ? 'border-transparent text-white'
          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900'}"
      style={activeBlock === block.id ? 'background: #5EA500; border-color: #5EA500;' : ''}
    >
      {block.label}
    </button>
  {/each}
</div>

<style>
  div::-webkit-scrollbar {
    display: none;
  }
</style>
