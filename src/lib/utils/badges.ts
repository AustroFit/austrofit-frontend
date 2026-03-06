// Einheitliche Badge-Definitionen für Dashboard und Punkte-Seite
export interface BadgeDef {
  id: string;
  icon: string;
  name: string;
  beschreibung: string;
  earned: boolean;
  hint: string;
}

export interface BadgeParams {
  hasSchritte: boolean;
  quizPassCount: number;
  longestStreak: number;
  earnedPoints: number;
  hasEinloesung: boolean;
}

export function getBadgeDefs(p: BadgeParams): BadgeDef[] {
  return [
    {
      id: 'erster-schritt',
      icon: '👟',
      name: 'Erster Schritt',
      beschreibung: 'Schritt-Tracking gestartet',
      earned: p.hasSchritte,
      hint: 'Verbinde deine Gesundheits-App'
    },
    {
      id: 'quiz-meister',
      icon: '🧠',
      name: 'Quiz-Meister',
      beschreibung: '5 Quizze abgeschlossen',
      earned: p.quizPassCount >= 5,
      hint: `Noch ${Math.max(0, 5 - p.quizPassCount)} Quiz(ze) bis zu diesem Badge`
    },
    {
      id: 'wochenheld',
      icon: '🔥',
      name: 'Wochenheld',
      beschreibung: '7-Tage-Streak erreicht',
      earned: p.longestStreak >= 7,
      hint: 'Erreiche einen 7-Tage-Streak'
    },
    {
      id: 'gesundheitsprofi',
      icon: '🏆',
      name: 'Gesundheitsprofi',
      beschreibung: 'Level 3 erreicht',
      earned: p.earnedPoints >= 500,
      hint: `Noch ${Math.max(0, 500 - p.earnedPoints)} Punkte bis Level 3`
    },
    {
      id: 'gutschein',
      icon: '🎫',
      name: 'Gutschein-Einlöser',
      beschreibung: 'Ersten Gutschein eingelöst',
      earned: p.hasEinloesung,
      hint: 'Löse deinen ersten Gutschein ein'
    }
  ];
}
