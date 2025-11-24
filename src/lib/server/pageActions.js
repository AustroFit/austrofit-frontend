import { handleFormSubmit } from "./forms";

export const actions = {
  submit: async ({ request, fetch }) => {
    return await handleFormSubmit(request, fetch);
  }
};