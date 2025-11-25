export const jobsCollection = {
  name: 'jobs',
  
  fields: [
    "id", "title", "job_description", "type",
  ],
  
  defaultSort: 'title',
  
  // Individual filter builders (composable)
  filterBuilders: {
     
    type: {
      all: null,
      
      paid: {
        type: { _eq: 'paid' }
      },
      
      unpaid: {
        type: { _eq: 'unpaid' }
      },
  
      ad_hoc: {
        type: { _eq: 'ad_hoc' }
      },
    },    
  },
}
