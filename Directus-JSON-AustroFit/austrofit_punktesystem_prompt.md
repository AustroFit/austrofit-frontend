# AustroFit – Punktesystem & Level-System (Implementierungs-Kontext)

Verwende dieses Dokument als Kontext für alle Implementierungsaufgaben rund um
das AustroFit-Punktesystem. Der Stack ist: **Directus 11.7.2** (Backend/CMS) +
**SvelteKit** (Frontend, via GitHub) + **Capacitor** (native Hülle für iOS/Android).

---

## 1. Punkte-Kurs

```
100 Punkte = 1 €
```

Punkte sind eine fiktive Währung. Sie werden niemals direkt ausgezahlt,
sondern ausschließlich gegen Gutscheine bei Partnerunternehmen eingetauscht.

---

## 2. Punkteformel – Schritte (täglich)

| Tages-Schritte | Formel | Beispiel |
|---|---|---|
| 0 – 3.999 | 0 P | — |
| 4.000 | 10 P (Einstieg) | 4.000 = 10 P |
| 4.001 – 6.999 | 10 P + 5 P pro angef. 500 Schritte | 5.500 = 20 P |
| **7.000** | **40 P („volles Tagesziel")** | 7.000 = 40 P |
| ≥ 7.001 | 40 P + 5 P pro angef. 500 Schritte | 10.000 = 70 P |

Kein harter Deckel nach oben. Fraud-Checks sind serverseitig in Directus
Flow/Hook zu implementieren (Plausibilitätsprüfung: max. ~60.000 Schritte/Tag).

---

## 3. Punkteformel – Bewegung (wöchentlich, Laufen & Radfahren)

| Wöchentliche Bewegung | Formel | Beispiel |
|---|---|---|
| 0 – 49 min | 0 P | — |
| 50 min | 50 P (Startwert) | 50 min = 50 P |
| 51 – 150 min | 50 P + 15 P je angef. 10 min | 120 min = 155 P |
| **150 min** | **200 P („volle Wochenpunkte")** | 150 min = 200 P |
| > 150 min | 200 P + 15 P je angef. 10 min | 200 min = 275 P |

---

## 4. Punkteformel – Bildung (Quiz)

| Ereignis | Bedingung | Punkte |
|---|---|---|
| Quiz abschließen | 100 % richtige Antworten | 40 P |
| Refresh-Quiz | 90 Tage nach letztem Abschluss, erneut 100 % | 40 P |

---

## 5. Streak-Logik – Schritte

### 5a. Streak-Tag
- Bedingung: ≥ 7.000 Schritte an aufeinanderfolgenden Tagen
- Bonus: **+20 P pro Streak-Tag** (zusätzlich zu den 40 P Tagesziel)

### 5b. Streak-Woche (Wochen-Bonus)
Bedingung erfüllt wenn **eines** der folgenden zutrifft:
- 7 aufeinanderfolgende Tage ≥ 7.000 Schritte, **oder**
- Mindestwochenschritte 49.000 (Schutz für 1–2 schwächere Tage)

Bonus: **+60 P am Tag 7** (bzw. bei Wochenabschluss)

> Wochenausgleich via 49.000-Schwelle ist der eingebaute Streak-Schutz (Ebene 1).
> Er schützt vor 1–2 schwachen Tagen ohne extra Feature.

### 5c. Berechnungsbeispiel (perfekte Woche)
```
7 × 40 P  = 280 P  (Tagesziele)
7 × 20 P  = 140 P  (Streak-Tag-Bonus)
1 × 60 P  =  60 P  (Wochen-Bonus Tag 7)
─────────────────
Summe     = 480 P / Woche
```

Perfekter Monat (28 Tage / 4 Wochen): **1.920 P**
Perfektes Quartal (91 Tage / 13 Wochen): **≈ 8.700 P**

---

## 6. Streak-Schutz – 3 Ebenen

### Ebene 1 – Wochenausgleich (bereits in Formel enthalten)
Siehe 5b. Kein extra Feature nötig.

### Ebene 2 – Streak-Freeze Token
Ein Token friert den Streak für eine Woche ein (keine Punkte, kein Verlust).

**Aktivierung:** Manuell durch User, bis Sonntag 23:59 der laufenden Woche.
Kein Auto-Freeze (bewusste Entscheidung = höherer Ownership-Effekt).

**Verfügbarkeit:**

| Quelle | Anzahl | Bedingung |
|---|---|---|
| Registrierung | 1 Token | Einmalig, sofort |
| Monatlich gratis | 1 Token | Ab Level 3 „Bergsteiger" |
| 30-Tage-Streak erreicht | +1 Token | Belohnung |
| Kaufbar mit Punkten | unbegrenzt | 200 P pro Token |
| Level-Vorteil | +1/Monat extra | Ab Level 6 „Alpenläufer" |

**Directus-Datenfeld:** `streak_freeze_tokens` (Integer) pro User-Datensatz.
Log jede Nutzung in separater Collection `streak_freeze_log`
(user_id, used_at, week_of).

### Ebene 3 – Streak-Comeback
- Bedingung: User hat Streak verloren, erreicht aber innerhalb von 3 Tagen
  wieder 3× täglich 7.000 Schritte
- Bonus: **+100 P Comeback-Bonus** (einmalig je Verlust-Ereignis)
- UI: kurze Feier-Animation bei Comeback-Unlock

---

## 7. Onboarding-Booster (Woche 1)

### Punkte-Multiplikator
- **1,5× auf alle Schritt-Punkte** während der ersten 7 Tage nach Registrierung
- Gilt **nicht** für Quiz-Punkte (Bildung bleibt normal)
- Directus-Feld: `onboarding_booster_until` (Datetime, nicht Boolean!)

### Milestone-Boni (einmalig, nur Woche 1)

| Meilenstein | Bonus | Zweck |
|---|---|---|
| Erstes Tagesziel erreicht (7.000 Schritte) | +50 P | Sofort-Dopamin |
| Erstes Quiz abgeschlossen | +50 P | Bildungs-Feature kennenlernen |
| Profil vervollständigt | +30 P | Datenqualität + Community |
| 3 Tage in Folge Tagesziel | +80 P | Erste Mini-Streak erleben |
| Ersten Freund eingeladen | +80 P | Viralität von Anfang an |

Eingeladener Freund bekommt ebenfalls Booster-Woche.

**Maximales Ergebnis Woche 1 (alles erreicht):**
```
480 P × 1,5 = 720 P  (Schritte mit Booster)
             +290 P  (Milestone-Boni)
─────────────────────
           ~1.010 P  → User erreicht Level 3 in Woche 1
```

---

## 8. Level-System

### Grundprinzip
- User sieht immer **nur das nächste Level** (mysteriös, Rest verborgen)
- Jedes Level-Up enthüllt das übernächste erstmals
- Level-Namen folgen einer vertikalen Reise durch die österreichische Landschaft

### Level-Tabelle

| # | Name | Punkte (kumuliert) | Erreichbar nach* | Freischaltungen |
|---|---|---|---|---|
| 1 | Hügelläufer | 0 P | Sofort | Basis-Features, Profil-Badge |
| 2 | Waldläufer | 500 P | ~4 Tage | Grüner Profilrahmen, Waldläufer-Badge |
| 3 | Bergsteiger | 1.500 P | ~11 Tage | Blauer Profilrahmen, 1 Freeze/Monat gratis, 5 % Gutschein |
| 4 | Almwanderer | 4.000 P | ~1,8 Monate | Exklusive Challenges, 1 Gewinnspiel-Los, 7 % Gutschein |
| 5 | Gipfelstürmer | 8.000 P | ~3,9 Monate | Goldener Profilrahmen, exklusive Partner-Angebote, 7 % Gutschein |
| 6 | Alpenläufer | 16.000 P | ~7,8 Monate | 2 Freeze/Monat gratis, 2 Gewinnspiel-Lose, 10 % Gutschein |
| 7 | Adlerblick | 32.000 P | ~15,6 Monate | Violetter Profilrahmen, Early Access neue Features, 10 % Gutschein |
| 8 | AustroFit Legend | 65.000 P | ~31 Monate | Roter Legend-Rahmen, 3 Gewinnspiel-Lose, Ambassador-Status, 15 % Gutschein, Co-Creation-Zugang |

*Bei exakt 7.000 Schritten/Tag + vollständigen Streaks (~1.920 P/Monat rein durch Schritte).
Mit Quizzen, Bewegung und Onboarding-Booster deutlich schneller erreichbar.

### Level-Vorteile im Detail

**Gutschein-Stufen (Level-Bonus, Träger noch offen – MVP via Affiliate):**

| Level | Gutschein-Bonus |
|---|---|
| 1–3 | 5 % |
| 4–5 | 7 % |
| 6–7 | 10 % |
| 8 | 15 % |

**Gewinnspiel-Lose:**
- Level 4: 1 Los pro Gewinnspiel
- Level 6: 2 Lose pro Gewinnspiel
- Level 8: 3 Lose pro Gewinnspiel

**Profilrahmen-Farben:** Grün (L2) → Blau (L3) → Gold (L5) → Violett (L7) → Rot (L8)

---

## 9. Wichtige Implementierungshinweise für Directus

- `onboarding_booster_until` als **Datetime-Feld** speichern (nicht Boolean),
  damit die Dauer später ohne Datenmigration angepasst werden kann
- `streak_freeze_tokens` als Integer pro User
- Jeden Streak-Freeze in `streak_freeze_log` loggen (user_id, used_at, week_of)
- Jeden Punktevorgang in `points_log` loggen (user_id, amount, source, created_at)
  — bereits im Businessplan als „Punkte-Audit-Log" vorgesehen
- Level wird **berechnet** aus `total_points` (nicht als separates Feld gespeichert),
  um spätere Formel-Anpassungen ohne Datenmigration zu ermöglichen
- Fraud-Check: Plausibilitätsprüfung via Directus Flow/Hook,
  max. ~60.000 Schritte/Tag akzeptieren

---

## 10. Offene Entscheidungen (noch nicht final)

- [ ] Wer trägt den Level-Bonus (AustroFit-Marge vs. Partnerkonditionen)?
      → Für MVP/Affiliate-Phase noch nicht relevant
- [ ] Streak-Logik für Bewegung (Laufen/Radfahren) analog zu Schritten ausbauen?
- [ ] Soziale Punkte für Freunde-Einladungen (geplant, noch nicht spezifiziert)
- [ ] Vorsorge/Impfung als Punktequelle (geplant, Implementierung offen)
