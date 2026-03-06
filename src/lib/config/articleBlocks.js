/** @type {Array<{id: string, label: string, description: string, categories: Record<string, string>}>} */
export const BLOCKS = [
  {
    id: 'vk',
    label: 'Volkskrankheiten',
    description: 'Häufige chronische Erkrankungen verstehen',
    categories: {
      diabetes:   'Diabetes',
      herz:       'Herz-Kreislauf',
      adipositas: 'Adipositas & Übergewicht',
      ruecken:    'Rückenschmerzen',
      psyche:     'Depression & Angst',
      allergie:   'Allergien & Asthma',
      hypertonie: 'Bluthochdruck',
      atem:       'COPD & Atemwege',
      kopf:       'Kopfschmerzen & Migräne',
    },
  },
  {
    id: 'pv',
    label: 'Prävention & Vorsorge',
    description: 'Früherkennung, Impfungen und Gesundheitsvorsorge',
    categories: {
      vorsorge:    'Vorsorge & Checkups',
      impf:        'Impfungen',
      scr:         'Screening & Früherkennung',
      life:        'Lebensphasen',
      krebs:       'Krebsvorsorge',
      sti:         'Sexuelle Gesundheit & STI',
      haut:        'Haut & Sonnenschutz',
      zahn:        'Zahngesundheit',
      schlafapnoe: 'Schlafapnoe',
    },
  },
  {
    id: 'ls',
    label: 'Lebensstil',
    description: 'Ernährung, Bewegung, Schlaf und Alltagsgewohnheiten',
    categories: {
      ern:   'Ernährung',
      beweg: 'Bewegung',
      schlaf: 'Schlaf & Erholung',
      rauch: 'Rauchen & Nikotin',
      alk:   'Alkohol',
      stress: 'Stress & Entspannung',
      koff:  'Koffein & Energydrinks',
      supp:  'Supplements',
      beh:   'Verhalten & Gewohnheiten',
    },
  },
  {
    id: 'kw',
    label: 'Krankheitswissen',
    description: 'Diagnosen, Befunde, Medikamente und Untersuchungen verstehen',
    categories: {
      symp:   'Symptome & Warnzeichen',
      lab:    'Laborwerte & Befunde',
      unters: 'Untersuchungen & Bildgebung',
      med:    'Medikamente verstehen',
      schmerz: 'Schmerzen & Selbstmanagement',
      infekt: 'Infektionen & Antibiotika',
    },
  },
  {
    id: 'mh',
    label: 'Mental Health',
    description: 'Psychische Gesundheit, Wohlbefinden und Neurodiversität',
    categories: {
      angst:  'Angst & Panik',
      dep:    'Depression & Erschöpfung',
      schlaf: 'Schlafstörungen',
      trauma: 'Trauma & PTBS',
      sucht:  'Sucht & Abhängigkeit',
      neuro:  'Neurodiversität (ADHS, Autismus)',
    },
  },
  {
    id: 'sys',
    label: 'Gesundheitssystem',
    description: 'Orientierung im österreichischen Gesundheitssystem',
    categories: {
      _general: 'Allgemeine Orientierung',
      sdm:  'Shared Decision Making',
      pr:   'Patientenrechte',
      info: 'Informationskompetenz & Quellencheck',
      dig:  'Digitale Services & ELGA',
      kom:  'Kommunikation & Befunde',
      kh:   'Krankenhaus, Reha, Pflege',
      igel: 'IGeL & Selbstzahler',
      bf:   'Beschwerden & Behandlungsfehler',
      chr:  'Chronisch Kranke & Koordination',
    },
  },
  {
    id: 'myth',
    label: 'Mythen & Faktencheck',
    description: 'Verbreitete Gesundheitsmythen auf dem Prüfstand',
    categories: {
      food: 'Ernährungs-Mythen',
      vax:  'Impf-Mythen',
      inf:  'Infektions-Mythen',
      sup:  'Supplement-Mythen',
      pain: 'Schmerz- & Bewegungs-Mythen',
      ca:   'Krebs-Screening-Mythen',
      mh:   'Psyche- & Neuro-Mythen',
      cv:   'Herz-Kreislauf-Mythen',
      dm:   'Diabetes- & Metabolik-Mythen',
      skin: 'Haut- & UV-Mythen',
      horm: 'Hormone & Schilddrüse-Mythen',
      gut:  'Darm- & Mikrobiom-Mythen',
      lc:   'Long-Covid & ME/CFS-Mythen',
    },
  },
];

/**
 * Parse a learning_module_id into { block, cat }.
 * E.g. "vk_diabetes_01_basis" → { block: "vk", cat: "diabetes" }
 *      "sys_01_wohin_wann"    → { block: "sys", cat: "_general" }
 */
export function parseModuleId(learningModuleId) {
  if (!learningModuleId) return { block: null, cat: null };
  const parts = learningModuleId.split('_');
  if (parts.length < 2) return { block: parts[0] ?? null, cat: null };
  const block = parts[0];
  let cat = parts[1];
  // sys_01, sys_02, sys_03 have no keyword — map to _general
  if (block === 'sys' && /^\d/.test(cat)) cat = '_general';
  return { block, cat };
}

/** Returns block config by id, or undefined */
export function getBlock(id) {
  return BLOCKS.find((b) => b.id === id);
}
