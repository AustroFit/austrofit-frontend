<!-- src/lib/components/blocks/Newsletter.svelte -->
<script>
  import Form from "$lib/components/Form.svelte";
  import { designClasses, getBaseBlockClasses, getButtonClasses } from "$lib/design-system/classes";

  const { block, formResponse } = $props();
  const blockData = block.item;
  const formData = blockData?.form;

  const buttonStyle = getButtonClasses(blockData.button_style, 'md');

  // Design-System: zentriert, helles Theme
  const styles = $derived(getBaseBlockClasses('center', 'light'));
</script>

{#if formData && formData?.is_active}
  <!-- kein eigenes <section> – BlockWrapper liefert section/container -->
  <div class="mx-auto max-w-3xl w-full text-center">
    <div class="p-8 md:p-10 {designClasses.spacing.normal}">
      {#if blockData?.tagline}
        <p class={`${styles.tagline}`}>{blockData.tagline}</p>
      {/if}

      {#if blockData?.headline}
        <h2 class={`${styles.headline}`}>{blockData.headline}</h2>
      {/if}

      {#if blockData?.description}
        <p class={`${designClasses.typography.bodyLarge} ${designClasses.textColors.light.body}`}>
          {blockData.description}
        </p>
      {/if}

      <!-- Form stellt Feld, Button, Checkbox etc. -->
      <Form {formData} {formResponse} {buttonStyle}/>
    </div>
  </div>
{/if}