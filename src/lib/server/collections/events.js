export const eventsCollection = {
  name: 'events',
  
  fields: [
    "id", "slug", "title", "image", "description", "content", 
    "event_date", "event_date_end", "location", "type", 
    "online_meeting", "featured", "location_state.states_id.name", "location_state.states_id"
  ],
  
  defaultSort: 'event_date',

  fetchRelated: true,


  // Individual filter builders (composable)
  filterBuilders: {
    time: {
      all: null,
      
      upcoming: {
        event_date: { _gte: '$NOW' }
      },
      
      past: {
        event_date: { _lt: '$NOW' }
      },
      
    },
  
    type: {
      all: null,
      
      general: {
        type: { _eq: 'general' }
      },
      
      info: {
        type: { _eq: 'info' }
      },
  
      workshop: {
        type: { _eq: 'workshop' }
      },
      
      aktion: {
        type: { _eq: 'aktion' }
      },

      austauschtreffen: {
        type: { _eq: 'austauschtreffen' }
      }
    },
    
    location: {
      all: null,
      
      /* by_state: (blockData) => ({
        location_state: {
          states_id: { _in: blockData.filter_state || [] }
        }
      }), */
      
      online_only: {
        online_meeting: { _eq: true }
      }
    },
    
    featured: (blockData) => 
      blockData.featured ? { featured: { _eq: true } } : null
  }
};