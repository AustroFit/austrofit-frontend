<script>
  import { enhance } from '$app/forms';
  import FormFieldRenderer from "./FormFieldRenderer.svelte";
  import { getFormClasses } from '$lib/design-system/classes';

  const { formData, buttonStyle, formResponse } = $props();
  const theme = $derived(formData?.theme || 'light');
  const alignment = $derived(formData?.alignment || 'left');
  const styles = $derived(getFormClasses(alignment, theme));

  const hasError = $derived(formResponse?.error && formResponse?.formId === formData.id);
  const hasSuccess = $derived(formResponse?.success && formResponse?.formId === formData.id);
</script>

<div class={styles.wrapper}>
  <!-- Only show form if not successfully submitted -->
  {#if !hasSuccess}
    <form method="POST" action="?/submit" class={styles.form}>
      <input type="hidden" name="formId" value={formData.id} />
      
      {#each formData.fields as field}
        <FormFieldRenderer {field} {styles} formResponse={formResponse} />
      {/each}
      
      <button type="submit" class="{buttonStyle} {styles.button}">
        {formData.submit_label ?? "Absenden"}
      </button>
    </form>
  {/if}

  <!-- Error/Success Messages - positioned below form -->
  {#if hasSuccess}
    <div class="success-message bg-primary/5 border border-primary/20 text-primary px-4 py-3 rounded-lg mt-4">
      {formData.success_message || "Formular erfolgreich gesendet."}
    </div>
  {:else if hasError}
    <div class="error-message bg-error/5 border border-error/30 text-error px-4 py-3 rounded-lg mt-4">
      {formResponse.error}
    </div>
  {/if}
</div>