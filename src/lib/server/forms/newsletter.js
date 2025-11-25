import { getDirectusWriteInstance } from "$lib/directus";
import { createItem } from "@directus/sdk";
import { fail } from '@sveltejs/kit';

export async function handleNewsletterSignup(formData, fetch, form, formId) {
  try {
    const email = formData.get("email");
    const firstName = formData.get("first-name");
    const source = "website-newsletter-form";

    if (!email || !email.includes("@")) {
      return fail(400, {
        error: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        formId
      });
    }

/*     // check if already subscribed
    const existing = await directus.request(
      readItems("newsletter_subscribers", {
        filter: { email: { _eq: email } }
      })
    );

    if (existing.length > 0 ) {
      return {
        success: true,
        message: "Du bist bereits für unseren Newsletter angemeldet.",
        formId
      };
    } */

    // add to Brevo (list ID 9 = dev newsletter)
    const brevoResult = await BrevoService.addContact(
      email,
      {
        FIRSTNAME: firstName,
        SOURCE: source
      },
      [9] // DEV NEWSLETTER LIST
    );

    // save to directus
    const directus = getDirectusWriteInstance(fetch);
    await directus.request(
      createItem("newsletter_subscribers", {
        email: email,
        "first-name": firstName,
        source: source,
        brevo_contact_id: brevoResult?.id || null,
      })
    );

    return {
      success: true,
      message: "Vielen Dank!",
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