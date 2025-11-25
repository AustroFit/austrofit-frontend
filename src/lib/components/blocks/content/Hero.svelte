<script>
  const { blockData } = $props();
  
  // Layout classes
  const layoutClasses = {
    'image_left': 'lg:flex-row-reverse',
    'image_center': 'lg:flex-col-reverse', 
    'image_right': 'lg:flex-row'
  };
  
  const layoutClass = $derived(layoutClasses[blockData.layout] || 'lg:flex-row');
  const isCentered = $derived(blockData.layout === 'image_center');
</script>

<section class="hero-block">
  <div class="container mx-auto px-4 py-16">
    <div class="flex flex-col {layoutClass} items-center gap-12">
      
      <!-- Content Section -->
      <div class="flex-1 {isCentered ? 'text-center' : ''}">
        {#if blockData.tagline}
          <div class="tagline text-sm font-medium uppercase tracking-wide opacity-75 mb-4">
            {blockData.tagline}
          </div>
        {/if}
        
        {#if blockData.headline}
          <h1 class="headline text-4xl lg:text-6xl font-bold leading-tight mb-6">
            {blockData.headline}
          </h1>
        {/if}
        
        {#if blockData.description}
          <div class="description text-lg lg:text-xl leading-relaxed mb-8 max-w-2xl {isCentered ? 'mx-auto' : ''}">
            {@html blockData.description}
          </div>
        {/if}
        
        <!-- Note: button_group is a UUID string, not an array -->
        <!-- {#if blockData.button_group}
          <div class="button-group flex flex-wrap gap-4 {isCentered ? 'justify-center' : ''}">
            <a 
              href="#" 
              class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors no-underline"
            >
              Button Text
            </a>
          </div>
        {/if} -->
      </div>
      
      <!-- Image Section -->
      {#if blockData.image}
        <div class="flex-1 w-full max-w-md lg:max-w-lg">
          <img 
            src="https://cms.austrofit.at/assets/{blockData.image}"
            alt={blockData.headline || 'Hero image'}
            class="w-full h-auto rounded-lg shadow-lg"
            loading="lazy"
          />
        </div>
      {/if}
      
    </div>
  </div>
</section>