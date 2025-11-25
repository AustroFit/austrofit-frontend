import { getDirectusWriteInstance } from "$lib/directus";
import { createItem } from "@directus/sdk";
import { BrevoService } from "../brevo";
import { fail, redirect } from '@sveltejs/kit';

export async function handleOnboardingSignup(formData, fetch, form, formId) {
  let token;
  
  try {
    const directus = getDirectusWriteInstance(fetch);
    
    const email = formData.get("email");
    const firstName = formData.get("first-name");
    const lastName = formData.get("last-name");
    const newsletterOptIn = formData.get("newsletter-signup") === "on";
    
    token = crypto.randomUUID();
    
    const volunteerData = {
      email,
      first_name: firstName,
      last_name: lastName,
      token: token,
      status: "pending",
      newsletter_opt_in: newsletterOptIn
    };

    const volunteer = await directus.request(
      createItem("volunteers", volunteerData)
    );

    console.log("Volunteer created successfully:", volunteer.id);

    // Add to Brevo onboarding list
    await BrevoService.addToOnboarding(email, {
      VORNAME: firstName,
      NACHNAME: lastName,
      VOLUNTEER_ID: volunteer.id,
      SOURCE: "website-onboarding-form"
    });

    // If newsletter opt-in checked, also add to newsletter list in Brevo
    if (newsletterOptIn) {
      try {
        await BrevoService.addToNewsletter(email, {
          VORNAME: firstName,
          NACHNAME: lastName,
          SOURCE: "onboarding-form-optin"
        });
      } catch (newsletterError) {
        // Log but don't fail the whole process if newsletter signup fails
        console.error("Newsletter opt-in during onboarding failed:", newsletterError);
      }
    }

  } catch (error) {
    console.error("Onboarding signup error:", error);
    return fail(500, {
      error: "Ein Fehler ist aufgetreten. Bitte versuche es später erneut.",
      formId
    });
  }

  throw redirect(303, `/onboarding/events/${token}?registered=true`);
}