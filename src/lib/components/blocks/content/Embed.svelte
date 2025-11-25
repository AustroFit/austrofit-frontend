<script>
  import { getBaseBlockClasses, getEmbedClasses } from "$lib/design-system/classes";
  
  const { block } = $props();
  const blockData = block.item;
  const theme = block.background || 'light';

  const {
    embed_code,
    min_height = 600,
  } = blockData;

  const styles = getBaseBlockClasses('left', theme);
  const embedClasses = getEmbedClasses('left', theme);

  const iframeContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 20px;
          font-family: system-ui, -apple-system, sans-serif;
        }
      </style>
    </head>
    <body>
      ${embed_code}
    </body>
    </html>
  `;
</script>

<div class={styles.container}>
  {#if blockData?.tagline}
    <div class={styles.tagline}>{blockData.tagline}</div>  
  {/if}
  
  {#if blockData?.headline}
    <h2 class={styles.headline}>{blockData.headline}</h2>  
  {/if}
  
  {#if blockData.description}
    <div class={styles.description}>
      {blockData.description}
    </div>
  {/if}

  <div class={embedClasses.wrapper}>
    <iframe 
      srcdoc={iframeContent}
      style="width: 100%; height: {min_height}px; border: none; display: block;"
      title="Spendenformular"
    ></iframe>
  </div>
</div>