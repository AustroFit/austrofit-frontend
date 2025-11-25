<!-- src/lib/components/singlepage/Meta.svelte -->
<script>
  const { item, collection, config } = $props();
  
  // Format helpers
  function formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
  
  const typeLabels = {
    'workshop': 'Workshop',
    'conference': 'Konferenz',
    'webinar': 'Webinar'
  };
  
  function formatValue(value, format) {
    if (!format) return value;
    
    switch(format) {
      case 'date':
        return formatDate(value);
      case 'typeLabel':
        return typeLabels[value] || value;
      case 'email':
        return value; // Could wrap in mailto: link
      default:
        return value;
    }
  }
</script>

<div class="max-w-[1140px] mx-auto px-4 lg:px-8 py-6">
  <!-- Breadcrumbs -->
  {#if config.showBreadcrumbs}
    <nav class="text-sm text-gray-600 mb-4">
      <a href="/" class="hover:text-dark-kvb-blue">Home</a>
      <span class="mx-2">/</span>
      <a href={config.breadcrumbPath} class="hover:text-dark-kvb-blue">
        {config.breadcrumbLabel}
      </a>
      <span class="mx-2">/</span>
      <span class="text-dark-kvb-blue font-medium">{item.title || item.name}</span>
    </nav>
  {/if}
  
  <!-- Meta Fields -->
  {#if config.showMeta && config.metaFields}
    <div class="flex flex-wrap gap-6 py-4 border-t border-b border-gray-200">
      {#each config.metaFields as field}
        {#if item[field.key]}
          <div class="flex items-center gap-2 text-sm text-gray-700">
            <span class="text-lg">{field.icon}</span>
            <span class="font-medium">{field.label}:</span>
            <span>{formatValue(item[field.key], field.format)}</span>
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>