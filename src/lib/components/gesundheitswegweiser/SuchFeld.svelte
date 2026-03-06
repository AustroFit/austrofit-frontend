<script>
  /** @type {{ onSearch: (term: string) => void }} */
  const { onSearch } = $props();

  let value = $state('');
  /** @type {ReturnType<typeof setTimeout>|undefined} */
  let timer;

  /** @param {Event & { currentTarget: HTMLInputElement }} e */
  function handleInput(e) {
    value = e.currentTarget.value;
    clearTimeout(timer);
    timer = setTimeout(() => onSearch(value.trim()), 300);
  }

  function clear() {
    value = '';
    clearTimeout(timer);
    onSearch('');
  }
</script>

<div class="relative">
  <!-- Search icon -->
  <svg
    class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
    fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>

  <input
    type="search"
    placeholder="Artikel suchen …"
    bind:value
    oninput={handleInput}
    class="w-full rounded-full border border-gray-200 bg-white py-2 pl-10 pr-9 text-sm
      focus:border-gray-400 focus:outline-none"
    aria-label="Artikel suchen"
  />

  {#if value}
    <button
      onclick={clear}
      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      aria-label="Suche löschen"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  {/if}
</div>
