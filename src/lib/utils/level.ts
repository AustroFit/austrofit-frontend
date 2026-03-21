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
  { level: 1, min: 0,     max: 499,      name: 'Hügelläufer' },
  { level: 2, min: 500,   max: 1499,     name: 'Waldläufer' },
  { level: 3, min: 1500,  max: 3999,     name: 'Bergsteiger' },
  { level: 4, min: 4000,  max: 7999,     name: 'Almwanderer' },
  { level: 5, min: 8000,  max: 15999,    name: 'Gipfelstürmer' },
  { level: 6, min: 16000, max: 31999,    name: 'Alpenläufer' },
  { level: 7, min: 32000, max: 64999,    name: 'Adlerblick' },
  { level: 8, min: 65000, max: 99999999, name: 'AustroFit Legend' },
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
