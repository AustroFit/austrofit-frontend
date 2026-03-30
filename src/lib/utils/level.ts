// src/lib/utils/level.ts
// Level-Berechnung – reine Clientlogik, keine DB-Spalte nötig.
// 20 Levels, kalibriert für einen 5-Jahres-Horizont.
// AustroFit-Branding alle 5 Level: L5, L10, L15, L20.

export interface LevelDef {
  level: number;
  min: number;
  max: number;
  name: string;
}

export interface LevelInfo {
  current: LevelDef;
  next: LevelDef | null;
  /** Punkte oberhalb der aktuellen Level-Schwelle */
  progress: number;
  /** Gesamte Punkte von aktuellem zu nächstem Level */
  needed: number;
  /** 0–100 Prozent Fortschritt innerhalb des aktuellen Levels */
  percent: number;
}

export const LEVEL_DEFS: LevelDef[] = [
  { level: 1,  min: 0,       max: 399,       name: 'Einsteiger' },
  { level: 2,  min: 400,     max: 1199,      name: 'Entdecker' },
  { level: 3,  min: 1200,    max: 2999,      name: 'Bergfreund' },
  { level: 4,  min: 3000,    max: 5999,      name: 'Almgänger' },
  { level: 5,  min: 6000,    max: 10999,     name: 'AustroFit Aktiv' },
  { level: 6,  min: 11000,   max: 17999,     name: 'Gipfelstürmer' },
  { level: 7,  min: 18000,   max: 26999,     name: 'Alpinist' },
  { level: 8,  min: 27000,   max: 38999,     name: 'Steinbock' },
  { level: 9,  min: 39000,   max: 54999,     name: 'Adlerblick' },
  { level: 10, min: 55000,   max: 74999,     name: 'AustroFit Champion' },
  { level: 11, min: 75000,   max: 99999,     name: 'Edelweiß' },
  { level: 12, min: 100000,  max: 129999,    name: 'Bergkristall' },
  { level: 13, min: 130000,  max: 164999,    name: 'Großglockner' },
  { level: 14, min: 165000,  max: 204999,    name: 'Alpengeist' },
  { level: 15, min: 205000,  max: 249999,    name: 'AustroFit Legende' },
  { level: 16, min: 250000,  max: 299999,    name: 'Eisriese' },
  { level: 17, min: 300000,  max: 354999,    name: 'Kaiserkrone' },
  { level: 18, min: 355000,  max: 414999,    name: 'Donnervogel' },
  { level: 19, min: 415000,  max: 479999,    name: 'Unsterblicher' },
  { level: 20, min: 480000,  max: 99999999,  name: 'AustroFit Olympier' },
];

export function getLevelInfo(punkte: number, defs: LevelDef[] = LEVEL_DEFS): LevelInfo {
  // Höchstes Level, dessen Min-Schwelle erreicht wurde
  let current = defs[0];
  for (const l of defs) {
    if (punkte >= l.min) current = l;
  }

  const next = defs.find((l) => l.level === current.level + 1) ?? null;
  const progress = punkte - current.min;
  const needed = next ? next.min - current.min : current.max - current.min + 1;
  const percent = next ? Math.min(100, Math.round((progress / needed) * 100)) : 100;

  return { current, next, progress, needed, percent };
}
