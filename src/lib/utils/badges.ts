// Einheitliche Badge-Definitionen für Dashboard und Punkte-Seite
export type BadgeKategorie = 'schritte' | 'bewegung' | 'quiz' | 'austrofit';

export interface BadgeDef {
  id: string;
  kategorie: BadgeKategorie;
  icon: string;
  name: string;
  beschreibung: string;
  earned: boolean;
  hint: string;
}

export interface BadgeParams {
  hasSchritte: boolean;
  schrittDays: number;     // Anzahl Tage mit Schritt-Tracking
  quizPassCount: number;
  longestStreak: number;
  earnedPoints: number;
  hasEinloesung: boolean;
}

export const BADGE_CATEGORY_DEFS: {
  key: BadgeKategorie;
  label: string;
  emoji: string;
  subtitle: string;
}[] = [
  { key: 'schritte',  label: 'Schritte',   emoji: '👟', subtitle: 'Österreich-Touren' },
  { key: 'bewegung',  label: 'Bewegung',   emoji: '🏃', subtitle: 'Streak-Meilensteine' },
  { key: 'quiz',      label: 'Wissen',     emoji: '📚', subtitle: 'Quiz-Erfolge' },
  { key: 'austrofit', label: 'AustroFit',  emoji: '🇦🇹', subtitle: 'Community-Badges' },
];

export function getBadgeDefs(p: BadgeParams): BadgeDef[] {
  const d = p.schrittDays;
  const s = p.longestStreak;
  const q = p.quizPassCount;
  const e = p.earnedPoints;

  return [
    // ── Schritte: Österreich-Touren ─────────────────────────────────────────
    {
      id: 'prater-spaziergang',
      kategorie: 'schritte',
      icon: '🌿',
      name: 'Prater-Spaziergang',
      beschreibung: 'Erster Schritt im Wiener Prater',
      earned: d >= 1,
      hint: 'Verbinde deine Gesundheits-App und tracke deinen ersten Tag'
    },
    {
      id: 'ringstrasse',
      kategorie: 'schritte',
      icon: '🏛️',
      name: 'Ringstraße',
      beschreibung: '7 Schritt-Tage – einmal rund um die Wiener Ringstraße',
      earned: d >= 7,
      hint: `Noch ${Math.max(0, 7 - d)} Schritt-Tag${7 - d === 1 ? '' : 'e'} bis zu diesem Badge`
    },
    {
      id: 'donaukanal',
      kategorie: 'schritte',
      icon: '🛶',
      name: 'Donaukanal-Runde',
      beschreibung: '14 Schritt-Tage – den Donaukanal auf und ab',
      earned: d >= 14,
      hint: `Noch ${Math.max(0, 14 - d)} Schritt-Tage`
    },
    {
      id: 'klosterneuburg',
      kategorie: 'schritte',
      icon: '🏘️',
      name: 'Wien → Klosterneuburg',
      beschreibung: '20 Schritt-Tage – Ausflug ins Stift Klosterneuburg',
      earned: d >= 20,
      hint: `Noch ${Math.max(0, 20 - d)} Schritt-Tage`
    },
    {
      id: 'wachauer-wanderer',
      kategorie: 'schritte',
      icon: '⛵',
      name: 'Wachauer Wanderer',
      beschreibung: '30 Schritt-Tage – durch die UNESCO-Wachau gewandert',
      earned: d >= 30,
      hint: `Noch ${Math.max(0, 30 - d)} Schritt-Tage`
    },
    {
      id: 'stift-melk',
      kategorie: 'schritte',
      icon: '🏰',
      name: 'Stift Melk erreicht',
      beschreibung: '50 Schritt-Tage – das barocke Stift Melk erklommen',
      earned: d >= 50,
      hint: `Noch ${Math.max(0, 50 - d)} Schritt-Tage`
    },
    {
      id: 'wien-linz',
      kategorie: 'schritte',
      icon: '🦅',
      name: 'Wien → Linz',
      beschreibung: '100 Schritt-Tage – 180 km die Donau entlang gemeistert!',
      earned: d >= 100,
      hint: `Noch ${Math.max(0, 100 - d)} Schritt-Tage bis Wien → Linz`
    },
    {
      id: 'arlberg',
      kategorie: 'schritte',
      icon: '⛷️',
      name: 'Arlberg-Überquerung',
      beschreibung: '150 Schritt-Tage – den Arlbergpass überquert',
      earned: d >= 150,
      hint: `Noch ${Math.max(0, 150 - d)} Schritt-Tage`
    },
    {
      id: 'grossglockner',
      kategorie: 'schritte',
      icon: '🏔️',
      name: 'Großglockner',
      beschreibung: '200 Schritt-Tage – Österreichs höchsten Gipfel bezwungen!',
      earned: d >= 200,
      hint: `Noch ${Math.max(0, 200 - d)} Schritt-Tage bis zum Gipfel`
    },
    {
      id: 'donau-geschwommen',
      kategorie: 'schritte',
      icon: '🌊',
      name: 'Donau geschwommen',
      beschreibung: '365 Schritt-Tage – ein ganzes Jahr aktiv geblieben!',
      earned: d >= 365,
      hint: `Noch ${Math.max(0, 365 - d)} Schritt-Tage – ein ganzes Jahr!`
    },

    // ── Bewegung: Streak-Meilensteine ───────────────────────────────────────
    {
      id: 'wochenheld',
      kategorie: 'bewegung',
      icon: '🔥',
      name: 'Wochenheld',
      beschreibung: '7-Tage-Streak – eine ganze Woche am Ball geblieben',
      earned: s >= 7,
      hint: `Noch ${Math.max(0, 7 - s)} Streak-Tag${7 - s === 1 ? '' : 'e'} bis zu diesem Badge`
    },
    {
      id: 'zweiwochenkampfer',
      kategorie: 'bewegung',
      icon: '💪',
      name: 'Zweiwochenkämpfer',
      beschreibung: '14-Tage-Streak – zwei Wochen Durchhaltevermögen',
      earned: s >= 14,
      hint: `Noch ${Math.max(0, 14 - s)} Streak-Tage`
    },
    {
      id: 'monatskrieger',
      kategorie: 'bewegung',
      icon: '⚡',
      name: 'Monatskrieger',
      beschreibung: '30-Tage-Streak – ein ganzer Monat voller Energie',
      earned: s >= 30,
      hint: `Noch ${Math.max(0, 30 - s)} Streak-Tage`
    },
    {
      id: 'saisonchampion',
      kategorie: 'bewegung',
      icon: '🌟',
      name: 'Saisonchampion',
      beschreibung: '60-Tage-Streak – eine ganze Saison unaufhaltsam',
      earned: s >= 60,
      hint: `Noch ${Math.max(0, 60 - s)} Streak-Tage`
    },
    {
      id: 'austrofit-elite',
      kategorie: 'bewegung',
      icon: '🏆',
      name: 'AustroFit Elite',
      beschreibung: '90-Tage-Streak – österreichische Ausdauer auf höchstem Niveau!',
      earned: s >= 90,
      hint: `Noch ${Math.max(0, 90 - s)} Streak-Tage bis zur Elite`
    },

    // ── Quiz: Wissens-Erfolge ───────────────────────────────────────────────
    {
      id: 'erstes-quiz',
      kategorie: 'quiz',
      icon: '📚',
      name: 'Erstes Quiz',
      beschreibung: 'Erstes Quiz erfolgreich abgeschlossen',
      earned: q >= 1,
      hint: 'Schließe dein erstes Quiz im Gesundheitswegweiser ab'
    },
    {
      id: 'gesundheitsinteressiert',
      kategorie: 'quiz',
      icon: '🩺',
      name: 'Gesundheitsinteressiert',
      beschreibung: '3 Quizze abgeschlossen – du willst es wissen!',
      earned: q >= 3,
      hint: `Noch ${Math.max(0, 3 - q)} Quiz${3 - q === 1 ? '' : 'ze'}`
    },
    {
      id: 'quiz-meister',
      kategorie: 'quiz',
      icon: '🧠',
      name: 'Quiz-Meister',
      beschreibung: '5 Quizze abgeschlossen',
      earned: q >= 5,
      hint: `Noch ${Math.max(0, 5 - q)} Quiz${5 - q === 1 ? '' : 'ze'}`
    },
    {
      id: 'gesundheitsexperte',
      kategorie: 'quiz',
      icon: '🎓',
      name: 'Gesundheitsexperte',
      beschreibung: '10 Quizze abgeschlossen – echtes Gesundheitswissen!',
      earned: q >= 10,
      hint: `Noch ${Math.max(0, 10 - q)} Quiz${10 - q === 1 ? '' : 'ze'}`
    },
    {
      id: 'austrofit-professor',
      kategorie: 'quiz',
      icon: '👨‍🏫',
      name: 'AustroFit Professor',
      beschreibung: '20 Quizze abgeschlossen – Lehrmeister der Gesundheit!',
      earned: q >= 20,
      hint: `Noch ${Math.max(0, 20 - q)} Quiz${20 - q === 1 ? '' : 'ze'}`
    },

    // ── AustroFit: Community-Badges ─────────────────────────────────────────
    {
      id: 'gutschein',
      kategorie: 'austrofit',
      icon: '🎫',
      name: 'Gutschein-Einlöser',
      beschreibung: 'Ersten Gutschein erfolgreich eingelöst',
      earned: p.hasEinloesung,
      hint: 'Löse deinen ersten Gutschein bei einem Partner ein'
    },
    {
      id: 'bergsteiger',
      kategorie: 'austrofit',
      icon: '⛰️',
      name: 'Bergsteiger',
      beschreibung: 'Level 3 Bergsteiger erreicht',
      earned: e >= 1500,
      hint: `Noch ${Math.max(0, 1500 - e).toLocaleString('de-AT')} Punkte bis Level 3`
    },
    {
      id: 'almwanderer',
      kategorie: 'austrofit',
      icon: '🌄',
      name: 'Almwanderer',
      beschreibung: 'Level 4 Almwanderer erreicht',
      earned: e >= 4000,
      hint: `Noch ${Math.max(0, 4000 - e).toLocaleString('de-AT')} Punkte bis Level 4`
    },
    {
      id: 'gipfelstuermer',
      kategorie: 'austrofit',
      icon: '⭐',
      name: 'Gipfelstürmer',
      beschreibung: 'Level 5 Gipfelstürmer erreicht',
      earned: e >= 8000,
      hint: `Noch ${Math.max(0, 8000 - e).toLocaleString('de-AT')} Punkte bis Level 5`
    },
    {
      id: 'austrofit-legend',
      kategorie: 'austrofit',
      icon: '👑',
      name: 'AustroFit Legend',
      beschreibung: 'Level 8 AustroFit Legend – das absolute Maximum!',
      earned: e >= 65000,
      hint: `Noch ${Math.max(0, 65000 - e).toLocaleString('de-AT')} Punkte bis zur Legende`
    },
  ];
}
