<script>
  import { enhance } from '$app/forms';
  import FormFieldRenderer from "./FormFieldRenderer.svelte";
  
  const { formData, formResponse } = $props();

  const hasError = formResponse?.error && formResponse?.formId === formData.id;
  const hasSuccess = formResponse?.success && formResponse?.formId === formData.id;
</script>

<div class="form">
  <!-- Only show form if not successfully submitted -->
  {#if !hasSuccess}
    <form method="POST" action="?/submit" class="flex flex-col gap-4">
      <input type="hidden" name="formId" value={formData.id} />
      
      {#each formData.fields as field}
        <FormFieldRenderer {field} formResponse={formResponse} />
      {/each}
      
      <button type="submit" class="btn-primary rounded-2xl py-2 mt-4">
        {formData.submit_label ?? "Absenden"}
      </button>
    </form>
  {/if}

  <!-- Error/Success Messages - positioned below form -->
  {#if hasSuccess}
    <div class="success-message bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mt-4">
      {formData.success_message || "Formular erfolgreich gesendet."}
    </div>
  {:else if hasError}
    <div class="error-message bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4">
      {formResponse.error}
    </div>
  {/if}
</div>