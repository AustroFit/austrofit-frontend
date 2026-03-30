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
| Refresh-Quiz | 30 Tage nach letztem Abschluss, erneut 100 % | 40 P |

### 4a. Quiz-Streak-Bonus (täglich, ab Tag 2)

| Tier | Streak-Tage | Bonus/Quiz | Wöchentlicher Meilenstein |
|---|---|---|---|
| Tier 1 | 2–6 | +5 P | +30 P (Tag 8) |
| Tier 2 | 7–13 | +10 P | +50 P (Tag 15) |
| Tier 3 | 14–29 | +15 P | +75 P (Tage 22, 29) |
| Tier 4 | 30+ | +20 P | +100 P (alle 7 Tage) |

`source_type = 'streak_quiz'` (täglich), `source_type = 'streak'` (Wochen-Meilenstein).
Cooldown pro Quiz: **30 Tage** (in Directus `cooldown_days` konfiguriert).

---

## 5. Streak-Logik – Schritte

### 5a. Streak-Tag-Bonus (tiered, ab Tag 2)

| Tier | Streak-Tage | Bonus/Tag |
|---|---|---|
| Tier 1 | 2–13 | +20 P |
| Tier 2 | 14–27 | +30 P |
| Tier 3 | 28–55 | +45 P |
| Tier 4 | 56+ | +60 P |

`source_type = 'streak_tag'`, `source_ref = YYYY-MM-DD`

### 5b. Streak-Wochen-Bonus (tiered, nach je 7 Streak-Tagen)

| Tier | Meilenstein | Bonus |
|---|---|---|
| Tier 1 | Tag 8 | +60 P |
| Tier 2 | Tage 15, 22 | +90 P |
| Tier 3 | Tage 29–50 | +120 P |
| Tier 4 | Tage 57+ | +150 P |

`source_type = 'streak'`, `source_ref = streak-{N}d-{datum}`

### 5c. Berechnungsbeispiel (perfekte Woche, Tier 1 / frischer User)
```
7 × 40 P  = 280 P  (Tagesziele)
7 × 20 P  = 140 P  (Streak-Tag-Bonus Tier 1)
1 × 60 P  =  60 P  (Wochen-Bonus Tag 8)
─────────────────
Summe     = 480 P / Woche
```

Perfekte Woche ab Tier 4 (Tag 56+):
```
7 × 40 P  = 280 P  (Tagesziele)
7 × 60 P  = 420 P  (Streak-Tag-Bonus Tier 4)
1 × 150 P = 150 P  (Wochen-Bonus Tier 4)
─────────────────
Summe     = 850 P / Woche
```

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
| Monatlich gratis | 1 Token | Ab Level 3 „Bergfreund" |
| 30-Tage-Streak erreicht | +1 Token | Belohnung |
| Kaufbar mit Punkten | unbegrenzt | 200 P pro Token |
| Level-Vorteil | +1/Monat extra | Ab Level 7 „Alpinist" |

**Directus-Datenfeld:** `streak_freeze_tokens` (Integer) pro User-Datensatz.
Log jede Nutzung in separater Collection `streak_freeze_log`
(user_id, used_at, week_of).

### Ebene 3 – Streak-Comeback
- Bedingung: User hat Streak verloren, erreicht aber innerhalb von 3 Tagen
  wieder 3× täglich 7.000 Schritte
- Bonus: **+100 P Comeback-Bonus** (einmalig je Verlust-Ereignis)
- UI: kurze Feier-Animation bei Comeback-Unlock

---

## 7. Onboarding & Engagement – Milestone-Boni

Einmalige Boni für erste Achievements. Punkte = regulärer Bonus beim ersten Erreichen des Ziels (kein separater Multiplikator).
`source_type = 'milestone'`, `source_ref = 'milestone-{slug}'` — Dedup in `points_ledger`.

Implementiert in `$lib/utils/milestones.ts` (Konstanten) + `$lib/server/milestoneService.ts` (Helper).

### Step-Milestones

| Slug | Trigger | Bonus |
|---|---|---|
| `first_step` | Erstes Tagesziel (≥7.000 Schritte) | +40 P |
| `first_step_streak_day` | Erster Streak-Tag-Bonus (Tag 2) | +20 P |
| `first_streak_4` | Erste 4-Tage-Streak | +80 P |
| `first_step_streak_week` | Erste Streak-Woche (Tag 8) | +60 P |
| `second_step_streak_week` | 2. Streak-Woche (Tag 15) | +90 P |
| `third_step_streak_week` | 3. Streak-Woche (Tag 22) | +90 P |
| `fourth_step_streak_week` | 4. Streak-Woche / 1 Monat (Tag 29) | +120 P |

### Cardio-Milestones

| Slug | Trigger | Bonus |
|---|---|---|
| `first_cardio` | Erste gewertete Cardio-Woche (≥ Start-Schwelle) | +50 P |
| `first_cardio_streak_week` | Erste volle Cardio-Streak-Woche (W2) | +100 P |
| `second_cardio_streak_week` | W3 | +100 P |
| `third_cardio_streak_week` | W4 / 1 Monat | +200 P |

### Quiz-Milestones

| Slug | Trigger | Bonus |
|---|---|---|
| `first_quiz` | Erstes erfolgreich geclaimtes Quiz | +40 P |
| `first_quiz_streak_day` | Erster Quiz-Streak-Tag-Bonus (Tag 2) | +5 P |
| `first_quiz_streak_4` | Erste 4-Tage-Quiz-Streak | +80 P |
| `first_quiz_streak_week` | Erste Quiz-Streak-Woche (Tag 8) | +30 P |
| `second_quiz_streak_week` | Tag 15 | +50 P |
| `third_quiz_streak_week` | Tag 22 | +75 P |
| `fourth_quiz_streak_week` | Tag 29 / 1 Monat | +75 P |

### Geplant (noch nicht implementiert)

| Slug | Trigger | Bonus |
|---|---|---|
| `profile_completed` | Profil-Felder vollständig | +30 P |
| `first_friend` | Ersten Freund eingeladen | +80 P |
| `second_friend` | Zweiten Freund eingeladen | +40 P |

> `first_friend` / `second_friend` erst mit Referral-System. `profile_completed` erst wenn definiert welche Felder zählen.

---

## 8. Level-System

### Grundprinzip
- 20 Levels, offen – kalibriert für einen 5-Jahres-Horizont
- User sieht immer **nur das nächste Level** (mysteriös, Rest verborgen)
- Jedes Level-Up enthüllt das übernächste erstmals
- AustroFit-Branding alle 5 Level: L5, L10, L15, L20
- Österreichisch-thematische Namen (Natur, Geographie, Kultur)

### Level-Tabelle

| # | Name | Punkte (kumuliert) | Erreichbar nach* |
|---|---|---|---|
| 1 | Einsteiger | 0 P | Sofort |
| 2 | Entdecker | 400 P | ~3–4 Tage |
| 3 | Bergfreund | 1.200 P | ~1 Woche |
| 4 | Almgänger | 3.000 P | ~3 Wochen |
| **5** | **AustroFit Aktiv** | **6.000 P** | **~2 Monate** |
| 6 | Gipfelstürmer | 11.000 P | ~4 Monate |
| 7 | Alpinist | 18.000 P | ~6 Monate |
| 8 | Steinbock | 27.000 P | ~9 Monate |
| 9 | Adlerblick | 39.000 P | ~13 Monate |
| **10** | **AustroFit Champion** | **55.000 P** | **~18 Monate** |
| 11 | Edelweiß | 75.000 P | ~2 Jahre |
| 12 | Bergkristall | 100.000 P | ~3 Jahre |
| 13 | Großglockner | 130.000 P | ~3,5 Jahre |
| 14 | Alpengeist | 165.000 P | ~4,5 Jahre |
| **15** | **AustroFit Legende** | **205.000 P** | **~5,5 Jahre** |
| 16 | Eisriese | 250.000 P | ~7 Jahre |
| 17 | Kaiserkrone | 300.000 P | ~8 Jahre |
| 18 | Donnervogel | 355.000 P | ~9,5 Jahre |
| 19 | Unsterblicher | 415.000 P | ~11 Jahre |
| **20** | **AustroFit Olympier** | **480.000 P** | **~13 Jahre** |

*Basis: solider User ~2.500–3.000 P/Monat (Schritte + Cardio + Quiz mit Tier-Boni ab Monat 3–4).

---

## 9. Wichtige Implementierungshinweise für Directus

- `onboarding_booster_until` als **Datetime-Feld** speichern (nicht Boolean),
  damit die Dauer später ohne Datenmigration angepasst werden kann
- `streak_freeze_tokens` als Integer pro User
- Jeden Streak-Freeze in `streak_freeze_log` loggen (user_id, used_at, week_of)
- Jeden Punktevorgang in `points_ledger` loggen (append-only, nie löschen)
  — `source_type` + `source_ref` ermöglichen vollständiges Audit
- Level wird **berechnet** aus `earnedPoints` (nur positive Einträge summiert, `positive_only=true`),
  nicht als separates Feld gespeichert → Formelanpassungen ohne Datenmigration möglich
- Einlösungen (negative `points_delta`) reduzieren **nicht** das Level
- Fraud-Check: Plausibilitätsprüfung via `STEPS_FRAUD_CAP = 20.000` in stepsService.ts;
  erweiterte Checks via Directus Flow geplant

---

## 10. Offene Entscheidungen (noch nicht final)

- [ ] Wer trägt den Level-Bonus (AustroFit-Marge vs. Partnerkonditionen)?
      → Für MVP/Affiliate-Phase noch nicht relevant
- [ ] Soziale Punkte für Freunde-Einladungen (geplant, noch nicht spezifiziert)
- [ ] Vorsorge/Impfung als Punktequelle (geplant, Implementierung offen)
- [ ] Level-Vorteile (Profilrahmen-Farben, Freeze-Token-Gratis, Gewinnspiel-Lose) für 20-Level-System neu zuordnen
- [ ] Badge „Move-Champion" für Cardio-Streak-Tier UI noch offen
