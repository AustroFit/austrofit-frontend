<script>
  const { field } = $props();
</script>

{#if field.type === "text" || field.type === "email"}
  <label>
    {field.label}
    <input
      type={field.type}
      name={field.name}
      placeholder={field.placeholder}
      required={field.required}
    />
  </label>
{:else if field.type === "textarea"}
  <label>
    {field.label}
    <textarea
      name={field.name}
      placeholder={field.placeholder}
      required={field.required}
    ></textarea>
  </label>
{:else if field.type === "checkbox"}
  <label>
    <input
      type="checkbox"
      name={field.name}
      required={field.required}
    />
    {field.label}
  </label>
{:else if field.type === "checkbox_group"}
  <fieldset>
    <legend>{field.label}</legend>
    {#each field.choices as choice}
      <label>
        <input
          type="checkbox"
          name={field.name}
          value={choice.value}
        />
        {choice.text}
      </label>
    {/each}
  </fieldset>
{:else if field.type === "radio"}
  <fieldset>
    <legend>{field.label}</legend>
    {#each field.choices as choice}
      <label>
        <input
          type="radio"
          name={field.name}
          value={choice.value}
          required={field.required}
        />
        {choice.text}
      </label>
    {/each}
  </fieldset>
{:else if field.type === "select"}
  <label>
    {field.label}
    <select name={field.name} required={field.required}>
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
  />
{/if}

