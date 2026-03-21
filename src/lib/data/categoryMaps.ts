// src/lib/data/categoryMaps.ts
// Zentrale Kategorie-Labels und -Styles für Partner-Karten (AngebotKarte + AwinAngebotKarte)

/** Lokale Partner-Kategorien (Directus-Slug → Anzeigename) */
export const KATEGORIE_LABELS: Record<string, string> = {
  fitnessstudio:      'Fitnessstudio',
  sportgeraete:       'Sportgeräte',
  sportbekleidung:    'Sportbekleidung',
  'privat-sport':     'Private Sportangebote',
  wellness:           'Wellness & Therme',
  apotheke:           'Apotheken',
  nahrungsergaenzung: 'Nahrungsergänzungsmittel',
  'bio-lebensmittel': 'BIO-Lebensmittel',
  pflegeprodukte:     'Pflegeprodukte'
};

/** Tailwind-Klassen für lokale Kategorie-Badges */
export const KATEGORIE_BADGE_STYLE: Record<string, string> = {
  fitnessstudio:      'bg-blue-100 text-blue-700',
  sportgeraete:       'bg-sky-100 text-sky-700',
  sportbekleidung:    'bg-indigo-100 text-indigo-700',
  'privat-sport':     'bg-violet-100 text-violet-700',
  wellness:           'bg-purple-100 text-purple-600',
  apotheke:           'bg-amber-100 text-amber-700',
  nahrungsergaenzung: 'bg-primary-light text-primary',
  'bio-lebensmittel': 'bg-primary-light text-primary',
  pflegeprodukte:     'bg-pink-100 text-pink-700'
};

/** AWIN-Programm-Kategorien (API-String → Anzeigename) */
export const AWIN_KATEGORIE_LABELS: Record<string, string> = {
  'Health/Beauty':    'Gesundheit & Beauty',
  'Sport/Fitness':    'Sport & Fitness',
  'Food/Drink':       'Ernährung',
  Pharmacy:           'Apotheke',
  Wellness:           'Wellness',
  FMCG:              'Lebensmittel',
  Sportswear:         'Sport & Mode',
  'Sports Equipment': 'Sportgeräte'
};
