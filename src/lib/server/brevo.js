// src/lib/server/brevo.js
import { BREVO_API_KEY } from '$env/static/private';

export class BrevoService {
  static async addContact(email, attributes = {}, listIds = []) {
    try {
      const response = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': BREVO_API_KEY
        },
        body: JSON.stringify({
          email,
          attributes,
          listIds,
          updateEnabled: true
        })
      });

      // Get response text first, then try to parse as JSON
      const responseText = await response.text();
      
      console.log('Brevo response status:', response.status);
      console.log('Brevo response body:', responseText);

      if (!response.ok) {
        let errorData = {};
        
        // Only try to parse JSON if there's content
        if (responseText.trim()) {
          try {
            errorData = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse error response as JSON:', parseError);
            errorData = { message: responseText };
          }
        }
        
        // Handle specific error cases
        if (response.status === 400 && errorData.code === 'duplicate_parameter') {
          return { success: true, id: null, message: 'Contact already exists' };
        }
        
        if (response.status === 401) {
          throw new Error('Invalid API key or unauthorized');
        }
        
        if (response.status === 403) {
          throw new Error('IP address not authorized - check Brevo security settings');
        }
        
        throw new Error(errorData.message || `HTTP ${response.status}: ${responseText || 'No response body'}`);
      }

      // Parse successful response
      let result = {};
      if (responseText.trim()) {
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse success response as JSON:', parseError);
          result = { id: null };
        }
      }

      return { success: true, id: result.id || null };
    } catch (error) {
      console.error('Brevo add contact error:', error);
      throw new Error(`Failed to add contact: ${error.message}`);
    }
  }

  static async removeFromList(email, listIds) {
    try {
      const response = await fetch(`https://api.brevo.com/v3/contacts/lists/${listIds[0]}/contacts/remove`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': BREVO_API_KEY
        },
        body: JSON.stringify({
          emails: [email]
        })
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        let errorData = {};
        if (responseText.trim()) {
          try {
            errorData = JSON.parse(responseText);
          } catch (parseError) {
            errorData = { message: responseText };
          }
        }
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Brevo remove contact error:', error);
      throw error;
    }
  }

  static async getLists() {
    try {
      const response = await fetch('https://api.brevo.com/v3/contacts/lists', {
        headers: {
          'Accept': 'application/json',
          'api-key': BREVO_API_KEY
        }
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        let errorData = {};
        if (responseText.trim()) {
          try {
            errorData = JSON.parse(responseText);
          } catch (parseError) {
            errorData = { message: responseText };
          }
        }
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      let result = {};
      if (responseText.trim()) {
        result = JSON.parse(responseText);
      }
      
      return result.lists || [];
    } catch (error) {
      console.error('Brevo get lists error:', error);
      throw error;
    }
  }
}