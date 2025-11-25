export const pressReleasesCollection = {
  name: 'press_releases',
  
  fields: [
    "id", "title", "slug", "release_date", "description", "content"
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

  
  },

};