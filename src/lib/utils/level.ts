// src/lib/utils/level.ts
// Level-Berechnung – reine Clientlogik, keine DB-Spalte nötig

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
  { level: 1, min: 0,    max: 199,   name: 'Einsteiger' },
  { level: 2, min: 200,  max: 499,   name: 'Aktiver' },
  { level: 3, min: 500,  max: 999,   name: 'Gesundheitsprofi' },
  { level: 4, min: 1000, max: 2499,  name: 'Vitalexperte' },
  { level: 5, min: 2500, max: 99999, name: 'AustroFit Champion' },
];

export function getLevelInfo(punkte: number): LevelInfo {
  // Höchstes Level, dessen Min-Schwelle erreicht wurde
  let current = LEVEL_DEFS[0];
  for (const l of LEVEL_DEFS) {
    if (punkte >= l.min) current = l;
  }

  const next = LEVEL_DEFS.find((l) => l.level === current.level + 1) ?? null;
  const progress = punkte - current.min;
  const needed = next ? next.min - current.min : current.max - current.min + 1;
  const percent = next ? Math.min(100, Math.round((progress / needed) * 100)) : 100;

  return { current, next, progress, needed, percent };
}
