import getDirectusReadInstance from '$lib/directus.js';
import { getDirectusWriteInstance } from '$lib/directus.js';
import { fail } from '@sveltejs/kit';
import { readItems, createItem, updateItem, deleteItems } from '@directus/sdk';

async function getVolunteerByToken(directus, token) {
  const volunteers = await directus.request(
    readItems("volunteers", {
      filter: { token: {_eq: token } }
    })
  );
  return volunteers[0];
}

export async function load({fetch, params}) {
  const directusRead = getDirectusReadInstance(fetch);
  const volunteer = await getVolunteerByToken(directusRead, params.token);

  const onboardingEvents = await directusRead.request(
    readItems("events", {
      filter: {
        "type": {_eq:"onboarding"},
        "event_date": {_gt: "$NOW"}
      },
      fields: [
        "id",
        "title",
        "event_date",
        "online_meeting",
        "city",
        "description",
        "content",
        "registrations.volunteer_id",
      ],
      sort: "event_date",
      limit: 3
    })
  );

  return {
    onboardingEvents,
    volunteer
  }
}

const userActions = new Map();

function checkRateLimit(userId) {
  const lastAction = userActions.get(userId);
  if (lastAction && (Date.now() - lastAction) < 3000) {
    return false;
  }
  userActions.set(userId, Date.now());
  return true;
}

export const actions = {
  register: async ({ request, params, fetch }) => {
    const formData = await request.formData();
    const eventId = formData.get("event_id");
    const directusWrite = getDirectusWriteInstance(fetch);
    const directusRead = getDirectusReadInstance(fetch);

    if (!checkRateLimit(params.token)) {
      return fail(429, { error: "Bitte warte einen Moment" });
    }

    const volunteer = await getVolunteerByToken(directusRead, params.token);
    const existing = await directusRead.request(
      readItems('registrations', {
        filter: {
          volunteer_id: { _eq: volunteer.id },
          event_id: { _eq: eventId }
        }
      })
    );
    
    if (existing.length > 0) {
      return fail(400, { error: "Du bist bereits für diesen Termin angemeldet" });
    }

    await directusWrite.request(
      createItem("registrations", {
        event_id: eventId,
        volunteer_id: volunteer.id
      })
    );

    await directusWrite.request(
      updateItem("volunteers", volunteer.id, {
        status: "registered"
      })
    );   
    
    return { success: true };
  },

  unregister: async ({ request, params, fetch }) => {
    const formData = await request.formData();
    const eventId = formData.get("event_id");
    const directusWrite = getDirectusWriteInstance(fetch);
    const directusRead = getDirectusReadInstance(fetch);

    if (!checkRateLimit(params.token)) {
      return fail(429, { error: "Bitte warte einen Moment" });
    }

    const volunteer = await getVolunteerByToken(directusRead, params.token);

    await directusWrite.request(
      deleteItems("registrations", {
        filter: {
          "volunteer_id": {_eq: volunteer.id},
          "event_id": {_eq: eventId}
        }
      })
    );

    return { success: true };
  }
}