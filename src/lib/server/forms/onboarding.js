// onboarding.js
import { getDirectusWriteInstance } from "$lib/directus";
import { createItem } from "@directus/sdk";
import { fail, redirect } from '@sveltejs/kit';

export async function handleOnboardingSignup(formData, fetch, form, formId) {
  let token;
  
  try {
    const directus = getDirectusWriteInstance(fetch);
    
    token = crypto.randomUUID();
    
    const volunteerData = {
      email: formData.get("email"),
      first_name: formData.get("first-name"),
      last_name: formData.get("last-name"),
      token: token,
      status: "pending"
    };

    const volunteer = await directus.request(
      createItem("volunteers", volunteerData)
    );

    console.log("Volunteer created successfully:", volunteer.id);

  } catch (error) {
    console.error("Onboarding signup error:", error);
    return fail(500, {
      error: "Ein Fehler ist aufgetreten. Bitte versuche es später erneut.",
      formId
    });
  }

  // Return instead of throw
  throw redirect(303, `/onboard/events/${token}?registered=true`)
}