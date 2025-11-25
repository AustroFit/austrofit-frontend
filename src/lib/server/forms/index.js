import { readItems } from '@directus/sdk';
import getDirectusReadInstance, { getDirectusWriteInstance } from '$lib/directus';
import { fail } from '@sveltejs/kit';

// Import all form handlers
import { handleRegularForm } from './regular-form';
//import { handleNewsletterSignup } from './newsletter';

export async function handleFormSubmit(request, fetch) {
  let formId;
  
  try {
    const directusRead = getDirectusReadInstance(fetch);
    const formData = await request.formData();
    formId = formData.get("formId");
    
    if (!formId || typeof formId !== "string") {
      console.error("Invalid or missing form ID:", formId);
      return fail(400, { 
        error: "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.", 
        formId: formId || null 
      });
    }

    const [form] = await directusRead.request(
      readItems("forms", {
        filter: { id: { _eq: formId }},
        fields: ["id", "form_type", "fields.id", "fields.name", "fields.sort", "fields.required"]
      })
    );

    if (!form) {
      console.error("Form not found:", formId);
      return fail(400, { 
        error: "Formular ist nicht verfügbar. Bitte versuche es später erneut.", 
        formId 
      });
    }

    const requiredFields = form.fields.filter(field => field.required);
    const missingRequired = requiredFields.filter(field => 
      !formData.get(field.name)
    );

    if (missingRequired.length > 0) {
      return fail(400, {
        error: "Bitte füllen Sie alle Pflichtfelder aus.",
        missingFields: missingRequired.map(f => f.name),
        formId
      });
    }

    switch (form.form_type) {
      case "newsletter":
        return await handleNewsletterSignup(formData, fetch, form, formId);
      case "onboarding":
        return await handleOnboardingSignup(formData, fetch, form, formId);
      case "default":
      default:
        return await handleRegularForm(formData, fetch, form, formId);
    }
  } catch (error) {
    // Let redirects pass through, only catch actual errors
    if (error?.status >= 300 && error?.status < 400) {
      throw error; // Re-throw redirects
    }
    
    console.error("Form submission error:", error);
    return fail(500, {
      error: "Ein technischer Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
      formId: formId || null
    });
  }
}