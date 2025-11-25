import { BrevoService } from "../brevo";
import { fail } from '@sveltejs/kit';

export async function handleNewsletterSignup(formData, fetch, form, formId) {
  try {
    const email = formData.get("email");
    const firstName = formData.get("first-name");
    const lastName = formData.get("last-name");
    const source = "website-newsletter-form";

    if (!email || !email.includes("@")) {
      return fail(400, {
        error: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        formId
      });
    }

    // Add to Brevo newsletter list only
    await BrevoService.addToNewsletter(email, {
      VORNAME: firstName,
      NACHNAME: lastName,
      SOURCE: source
    });

    return {
      success: true,
      message: "Vielen Dank für deine Anmeldung!",
      formId
    }
  } catch (error) {
    console.error("Newsletter signup error:", error);
    return fail(500, {
      error: "Ein Fehler ist aufgetreten. Bitte versuche es später erneut.",
      formId
    });
  }
}