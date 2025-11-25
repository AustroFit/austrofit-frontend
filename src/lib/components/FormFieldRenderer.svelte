<script>
  const { field, styles } = $props();
</script>

{#if field.type === "text" || field.type === "email"}
  <label class={styles.label}>
    {field.label}
    {#if field.required}
      <span class="text-dark-blue-1">*</span>
    {/if}
    
    <input
      class={styles.textfield}
      type={field.type}
      name={field.name}
      placeholder={field.placeholder}
      required={field.required}
    />
  </label>

{:else if field.type === "textarea"}
  <label class={styles.label}>
    {field.label}
    {#if field.required}
      <span class="text-dark-blue-1">*</span>
    {/if}
    
    <textarea
      class={styles.textarea}
      name={field.name}
      placeholder={field.placeholder}
      required={field.required}
    ></textarea>
  </label>

{:else if field.type === "checkbox"}
  <label class={styles.checkboxLabel}>
    <input
      class={styles.checkbox}
      type="checkbox"
      name={field.name}
      required={field.required}
    />
    {field.label}
    {#if field.required}
    <span class="text-dark-blue-1">*</span>
    {/if}
  </label>

{:else if field.type === "checkbox_group"}
  <fieldset class={styles.fieldset}>
    <legend class={styles.legend}>
      {field.label}
      {#if field.required}
        <span class="text-dark-blue-1">*</span>
      {/if}
    </legend>
    
    <div class={styles.checkboxGroup}>
      {#each field.choices as choice}
        <label class={styles.checkboxLabel}>
          <input
            class={styles.checkbox}
            type="checkbox"
            name={field.name}
            value={choice.value}
          />
          {choice.text}
        </label>
      {/each}
    </div>
  </fieldset>

{:else if field.type === "radio"}
  <fieldset class={styles.fieldset}>
    <legend class={styles.legend}>
      {field.label}
      {#if field.required}
        <span class="text-dark-blue-1">*</span>
      {/if}
    </legend>
    
    <div class={styles.radioGroup}>
      {#each field.choices as choice}
        <label class={styles.radioLabel}>
          <input
            class={styles.radio}
            type="radio"
            name={field.name}
            value={choice.value}
            required={field.required}
          />
          {choice.text}
        </label>
      {/each}
    </div>
  </fieldset>

{:else if field.type === "select"}
  <label class={styles.label}>
    {field.label}
    {#if field.required}
      <span class="text-dark-blue-1">*</span>
    {/if}
    
    <select 
      class={styles.select}
      name={field.name} 
      required={field.required}
    >
      <option value="">Bitte auswählen</option>
      {#each field.choices as choice}
        <option value={choice.value}>{choice.text}</option>
      {/each}
    </select>
  </label>

{:else if field.type === "hidden"}
  <input
    type="hidden"
    name={field.name}
    value={field.value || ''}
  />
{/if}