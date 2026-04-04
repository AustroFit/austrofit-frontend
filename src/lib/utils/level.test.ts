import { describe, it, expect } from 'vitest';
import { getLevelInfo, LEVEL_DEFS } from './level';

describe('getLevelInfo', () => {
  it('0 Punkte → Level 1 Einsteiger', () => {
    const info = getLevelInfo(0);
    expect(info.current.level).toBe(1);
    expect(info.current.name).toBe('Einsteiger');
    expect(info.progress).toBe(0);
    expect(info.percent).toBe(0);
  });

  it('399 Punkte → noch Level 1', () => {
    const info = getLevelInfo(399);
    expect(info.current.level).toBe(1);
    expect(info.progress).toBe(399);
  });

  it('400 Punkte → Level 2 Entdecker', () => {
    const info = getLevelInfo(400);
    expect(info.current.level).toBe(2);
    expect(info.current.name).toBe('Entdecker');
    expect(info.progress).toBe(0);
    expect(info.percent).toBe(0);
  });

  it('800 Punkte → 50% innerhalb Level 2', () => {
    const info = getLevelInfo(800);
    expect(info.current.level).toBe(2);
    expect(info.progress).toBe(400);     // 800 - 400
    expect(info.needed).toBe(800);       // 1200 - 400
    expect(info.percent).toBe(50);
  });

  it('genau an jeder Level-Schwelle → richtiges Level', () => {
    for (const def of LEVEL_DEFS) {
      const info = getLevelInfo(def.min);
      expect(info.current.level).toBe(def.level);
    }
  });

  it('1 Punkt unterhalb einer Schwelle → vorheriges Level', () => {
    for (let i = 1; i < LEVEL_DEFS.length; i++) {
      const info = getLevelInfo(LEVEL_DEFS[i].min - 1);
      expect(info.current.level).toBe(LEVEL_DEFS[i].level - 1);
    }
  });

  it('480000 Punkte → Level 20 AustroFit Olympier (Maxlevel)', () => {
    const info = getLevelInfo(480000);
    expect(info.current.level).toBe(20);
    expect(info.current.name).toBe('AustroFit Olympier');
    expect(info.next).toBeNull();
    expect(info.percent).toBe(100);
  });

  it('nächstes Level stimmt überein', () => {
    const info = getLevelInfo(6000);
    expect(info.current.level).toBe(5);
    expect(info.next?.level).toBe(6);
    expect(info.next?.name).toBe('Gipfelstürmer');
  });
});
