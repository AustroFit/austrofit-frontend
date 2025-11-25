export const testimonialCollection = {
  name: 'testimonials',
  
  fields: [
    "id", "name", "quote", "role", "company", "image", "featured", "importance",
  ],
  
  defaultSort: 'name',
  
  // Individual filter builders (composable)
  filterBuilders: {     
    featured: (blockData) => 
      blockData.featured ? { featured: { _eq: true } } : null  
  },
}
