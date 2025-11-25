// src/lib/config/singlePageConfigs.js

export const singlePageConfigs = {
  events: {
    showBreadcrumbs: true,
    breadcrumbLabel: 'Events',
    breadcrumbPath: '/events',
    
    showMeta: true,
    metaFields: [
      { key: 'event_date', label: 'Datum', icon: '📅', format: 'date' },
      { key: 'location', label: 'Ort', icon: '📍' },
      { key: 'type', label: 'Typ', icon: '🏷️', format: 'typeLabel' }
    ],
    
    showRelated: true,
    relatedTitle: 'Weitere Veranstaltungen',
    
    showRegistration: true // Event-specific
  },
  
  articles: {
    showBreadcrumbs: true,
    breadcrumbLabel: 'Artikel',
    breadcrumbPath: '/artikel',
    
    showMeta: false,
    metaFields: [
      { key: 'date_created', label: 'Veröffentlicht', icon: '📅', format: 'date' },
      { key: 'author', label: 'Autor', icon: '✍️' }
    ],
    
    showRelated: true,
    relatedTitle: 'Weitere Artikel'
  },
  
  testimonials: {
    showBreadcrumbs: false,
    breadcrumbLabel: 'Testimonials',
    breadcrumbPath: '/testimonials',
    
    showMeta: false, // No meta for testimonials
    showRelated: false
  },
  
  team: {
    showBreadcrumbs: false,
    breadcrumbLabel: 'Team',
    breadcrumbPath: '/team',
    
    showMeta: false,
    metaFields: [
      { key: 'role', label: 'Position', icon: '💼' },
      { key: 'email', label: 'E-Mail', icon: '✉️', format: 'email' }
    ],
    
    showRelated: false
  },

  press_releases: {
    showBreadcrumbs: true,
    breadcrumbLabel: 'Pressemitteilungen',
    breadcrumbPath: '/pressemitteilungen',
    
    showMeta: false,
    metaFields: [
      { key: 'date_created', label: 'Veröffentlicht', icon: '📅', format: 'date' }
    ],
    
    showRelated: true,
    relatedTitle: 'Weitere Pressemitteilungen'
  }

};

export function getSinglePageConfig(collection) {
  return singlePageConfigs[collection] || {
    showBreadcrumbs: true,
    breadcrumbLabel: collection,
    showMeta: false,
    showRelated: false
  };
}