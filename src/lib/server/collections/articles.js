export const articlesCollection = {
  name: 'articles',
  
  fields: [
    "id", "slug", "title", "description", "content", "image", "status", "release_date", "featured"
  ],
  
  defaultSort: 'release_date',
  
  filterBuilders: {
    time: {
      all: null,
      
      upcoming: {
        release_date: { _gte: '$NOW' }
      },
      
      past: {
        release_date: { _lt: '$NOW' }
      },
      
    },

    featured: (blockData) => 
      blockData.featured ? { featured: { _eq: true } } : null
  },

  


};
