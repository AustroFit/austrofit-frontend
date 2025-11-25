export const supportersOrganizationCollection = {
  name: 'supporters_organizations',
  
  fields: [
    "id", "image", "name", "type", "importance",
  ],
  
  defaultSort: 'importance',
  
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
