import { getDirectusWriteInstance } from "$lib/directus";
import { createItem } from "@directus/sdk";

export async function handleRegularForm(formData, fetch, form, formId) {

  const values = [];
  for (const field of form.fields) {
    const raw = formData.get(field.name);
    if (raw != null) {
      values.push({
        field: field.id,
        value: String(raw),
        sort: field.sort
      });
    }
  }

  if (values.length === 0) {
    console.error("No valid fields submitted for form:", formId);
    return fail(400, { 
      error: "Bitte füllen Sie das Formular aus.", 
      formId 
    });
  }
  const directus = getDirectusWriteInstance(fetch);
  await directus.request(
    createItem("form_submissions", {
      form: formId,
      values
    })
  );

  return { success: true, formId };
}


