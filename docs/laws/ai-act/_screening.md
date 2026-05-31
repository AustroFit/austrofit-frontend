---
law: AI-Act
title: EU AI Act (KI-Verordnung)
rechtsgrundlage: Verordnung (EU) 2024/1689
source_ref: "OJ L 2024/1689; CELEX:32024R1689; ABl. L vom 12.7.2024"
source_date: "2024-06-13"
screened_by: "AI-assisted (Claude Sonnet), basierend auf PDF OJ_L_202401689_DE_TXT.pdf; bestätigt durch: [Name + Datum]"
screened_date: "2026-05-23"
last_reviewed: "2026-05-23"
version: "1.0-pending-review"
---

# EU AI Act – Artikel-Screening (AustroFit)

> **Methodik:** Dieses Screening basiert ausschließlich auf dem offiziellen PDF (ABl. L 2024/1689, 12.7.2024).
> Kein Knowledge-Cutoff-Risiko — stets aus dem Dokument ableiten, nicht aus Trainingsdaten.
> **Gültig bis:** Vor Implementierung jedes neuen ML/KI-Features neu prüfen (insb. Anomalie-Scoring).

---

## Geltungsdaten (Art. 113 aus PDF)

| Datum | Was gilt |
|---|---|
| **02.02.2025** | Kapitel I (Allgemeine Bestimmungen) + Kapitel II (Art. 5, Verbotene Praktiken) |
| **02.08.2026** | Allgemeine Geltung — alle verbleibenden Kapitel |
| **02.08.2027** | Art. 6 Abs. 1 (Safety components nach Anhang I) |

**→ Ab 02.08.2026 muss AustroFit sicherstellen, dass alle implementierten KI-Systeme compliant sind.**

---

## Screening-Legende
- `✅ anwendbar` – Direkte Pflichten für AustroFit, auch heute
- `⚠️ bedingt` – Anwendbar nur unter bestimmten Bedingungen / bei zukünftigen Features
- `❌ nicht anwendbar` – Mit Begründung
- `📋 referenz` – Definitionsgrundlage / für Interpretation

---

## Schritt 1 — Anwendbarkeit (Art. 2 + Art. 3)

### Ist AustroFit Anbieter oder Betreiber?

**Art. 3 Nr. 3 — Anbieter:** Natürliche oder juristische Person, die ein KI-System entwickelt oder entwickeln lässt und dieses unter ihrem eigenen Namen oder Markenzeichen in Verkehr bringt oder in Betrieb nimmt.

**Art. 3 Nr. 4 — Betreiber:** Natürliche oder juristische Person, die ein KI-System in eigener Verantwortung für nicht persönliche, nicht-professionsfremde Zwecke nutzt.

→ AustroFit ist **Anbieter**, wenn sie ein KI-System entwickelt und in der App einsetzt.
→ AustroFit ist **Betreiber**, wenn sie ein KI-System Dritter integriert (z.B. OpenAI API, ML-Bibliotheken).

**Art. 2 Abs. 10:** Gilt NICHT für den rein persönlichen, nicht-professionellen Gebrauch. → Nicht einschlägig für AustroFit (B2C-Plattform mit kommerziellem Zweck).

---

### Ist das aktuelle AustroFit-System ein KI-System?

**Art. 3 Nr. 1 — KI-System (Volltext aus PDF):**
> "maschinengestütztes System, das für einen in unterschiedlichem Grade autonomen Betrieb ausgelegt ist und das nach seiner Betriebsaufnahme anpassungsfähig sein kann und das aus den erhaltenen Eingaben für explizite oder implizite Ziele ableitet, wie Ausgaben wie etwa Vorhersagen, Inhalte, Empfehlungen oder Entscheidungen erstellt werden, die physische oder virtuelle Umgebungen beeinflussen können"

**Bewertung aktueller AustroFit-Features:**

| Feature | KI-System? | Begründung |
|---|---|---|
| Punkte-Berechnung (Schritte, Cardio, Quiz) | **Nein** | Deterministische Formeln (`if steps >= 7000 → 40P + …`); kein Lernen, kein Ableiten |
| Level-Berechnung (earnedPoints → getLevelInfo) | **Nein** | Statische Lookup-Table; kein maschinelles Lernen |
| Streak-Tracking | **Nein** | Regelbasiert (Tag+1 wenn Aktivität vorhanden) |
| Quiz-System | **Nein** | Statische Content-Auslieferung, keine adaptive Auswahl |
| Gamification-Badges | **Nein** | Regelbasierte Schwellenwerte (total_steps >= X) |
| Belohnungs-Marketplace | **Nein** | Einfache Datenbankabfrage, keine Empfehlungslogik |
| **Geplant:** ML-Anomalie-Scoring (Isolation Forest) | **Ja** | Ableiten von Anomalien aus Nutzungsmuster → KI-System nach Art. 3 Nr. 1 |

**Ergebnis Stand 05/2026:**
→ **Kein KI-System aktiv implementiert.** AI Act aktuell nicht anwendbar.
→ **Sobald ML-Anomalie-Scoring implementiert wird:** AI Act anwendbar — Screening vor Implementierung wiederholen.

---

## Schritt 2 — Verbotene Praktiken (Art. 5, gilt ab 02.02.2025)

**Relevanzcheck für AustroFit:**

### Art. 5 Abs. 1 lit. a — Unterschwellige / manipulative Beeinflussung
> Verboten: KI-System, das "Techniken der unterschwelligen Beeinflussung außerhalb des Bewusstseins einer Person oder absichtlich manipulative oder täuschende Techniken" einsetzt, um Entscheidung zu verändern die "erheblichen Schaden" zufügt.

**AustroFit:** Gamification (Punkte, Badges, Streaks) ist explizit und transparent — Nutzer sehen Punkte und Regeln. Kein "außerhalb des Bewusstseins". **→ ❌ nicht anwendbar.** Voraussetzung: Gamification-Regeln bleiben in den Datenschutzeinstellungen und AGB transparent dokumentiert.

### Art. 5 Abs. 1 lit. b — Ausnutzung von Vulnerabilität
> Verboten: Ausnutzung von Behinderung, Alter, sozialer/wirtschaftlicher Notlage um Verhalten zu verändern.

**AustroFit:** Keine Targeting-Logik auf vulnerable Gruppen. Aktivitätsgruppen (senior, pregnant, chronic) erhalten angepasste Ziele zugunsten der Gruppe. **→ ❌ nicht anwendbar.**

### Art. 5 Abs. 1 lit. c — Social Scoring
> Verboten: KI-System zur Bewertung natürlicher Personen aufgrund ihres **sozialen Verhaltens** das zu Benachteiligung in sozialen Zusammenhängen führt.

**AustroFit:** Das Punkte-System bewertet **Fitness-Aktivitäten** (Schritte, Workouts, Quiz). Kein Einfluss auf sozialen Zugang. Kein Vergleich mit anderen Nutzern in benachteiligender Weise. **→ ❌ nicht anwendbar.**

### Art. 5 Abs. 1 lit. d — Kriminelle Risikobewertung
**→ ❌ nicht anwendbar.** (Strafverfolgung)

### Art. 5 Abs. 1 lit. e-h — Biometrie, Emotionserkennung, Fernidentifizierung
**→ ❌ alle nicht anwendbar.** AustroFit verwendet keine biometrischen Daten in diesem Sinne.

**Gesamtbewertung Art. 5:** ❌ Keine verbotenen Praktiken anwendbar.

---

## Schritt 3 — Hochrisiko-Einstufung (Art. 6 + Anhang I + Anhang III)

### Art. 6 Abs. 1 — Safety component in Anhang-I-Produkt
Anhang I listet: Maschinen, Spielzeug, Sportboote, Aufzüge, Medizinprodukte (MDR, IVDR), Fahrzeuge, Luftfahrt etc.

**AustroFit:** Mobile Fitness-App ist kein Sicherheitsbauteil in einem Anhang-I-Produkt. **→ ❌ nicht anwendbar.**

### Art. 6 Abs. 2 — Anhang III (Hochrisiko-KI-Systeme)

Vollständige Anhang-III-Liste (8 Bereiche):

| Bereich | Anhang III | AustroFit-Relevanz |
|---|---|---|
| 1. Biometrie | Fernidentifizierung, Kategorisierung, Emotionserkennung | ❌ keine biometrischen Systeme |
| 2. Kritische Infrastruktur | Sicherheitsbauteile in Strom/Wasser/Verkehr | ❌ |
| 3. Allgemeine/berufliche Bildung | Zugangsentscheid zu Bildungseinrichtungen, Bewertung von Lernergebnissen, Prüfungsüberwachung | ❌ Quiz-System ist Gesundheitsbildung ohne institutionellen Zugang/Beurteilung |
| 4. Beschäftigung/Personalmanagement | Einstellung, Kündigung, Leistungsbewertung | ❌ |
| 5a. Behördliche Sozialleistungen | Anspruchsbeurteilung durch Behörden | ❌ AustroFit ist privat |
| 5b. Kreditwürdigkeitsprüfung | Bonitätsbewertung | ❌ |
| **5c. Lebens-/Krankenversicherungen** | **Risikobewertung und Preisbildung** | **⚠️ ACHTUNG: Aktuell ❌. Würde AustroFit Gesundheitsdaten je für Versicherungsrisikobewertungen bereitstellen, wäre dies Hochrisiko!** |
| 5d. Notrufe/Rettungsdienste | Klassifizierung von Notrufen | ❌ |
| 6. Strafverfolgung | Risikobewertung, Lügendetektoren | ❌ |
| 7. Migration/Asyl/Grenze | Risikobeurteilung von Einreisenden | ❌ |
| 8. Rechtspflege/Demokratie | Rechtliche Entscheidungsunterstützung, Wahlbeeinflussung | ❌ |

**Bewertung geplantes ML-Anomalie-Scoring:**
- Zweck: Erkennung ungewöhnlicher Punkt-Claims (Fraud Detection)
- Anhang III: Keiner der 8 Bereiche einschlägig
- Art. 6 Abs. 3 Ausnahme: "detect patterns" → falls nur Mustererkennung ohne automatisches Sperren → kein Hochrisiko
- **→ Kein Hochrisiko-KI-System** (sofern human-in-the-loop, kein automatisches Nutzersperren)
- Design-Prinzip zwingend: Kein automatisches Sperren ohne menschliche Prüfung

**Gesamtbewertung Art. 6:** ❌ Kein Hochrisiko-KI-System (aktuell und geplant, sofern Design-Prinzip eingehalten).

---

## Schritt 4 — Transparenzpflichten (Art. 50, Limited/Minimal Risk)

### Art. 50 Abs. 1 — Direkte Interaktion mit KI-System
> Anbieter stellen sicher, dass Nutzer informiert werden, dass sie mit einem KI-System interagieren — es sei denn, dies ist offensichtlich.

**AustroFit aktuell:** Kein KI-System in direkter Nutzerinteraktion. **→ ❌ nicht anwendbar.**
**Bei zukünftigem KI-Chat-Assistenten / KI-Empfehlungssystem:** Transparenzpflicht aktiv → UI-Hinweis erforderlich.

### Art. 50 Abs. 2 — Synthetische Inhalte (Deepfakes, Generated Content)
> Maschinell erzeugte Audio/Bild/Video/Texte müssen als solche gekennzeichnet werden.

**AustroFit:** Keine synthetischen Inhalte werden erzeugt. **→ ❌ nicht anwendbar.**

### Art. 50 Abs. 3 — Emotionserkennung / biometrische Kategorisierung
**→ ❌ nicht anwendbar.**

### Art. 50 Abs. 4 — Deepfakes
**→ ❌ nicht anwendbar.**

**Gesamtbewertung Art. 50:**
- Aktuell: ❌ keine Pflichten
- Bei Anomalie-Scoring mit Nutzerauswirkungen: ⚠️ Information an betroffene Nutzer erforderlich (wenn Konsequenzen aus KI-Ausgabe folgen)
- Bei KI-Chat oder personalisierten KI-Empfehlungen: ⚠️ Art. 50 Abs. 1 Transparenzpflicht aktiv

---

## Gesamtergebnis

| Artikel | Status | Begründung |
|---|---|---|
| Art. 2 — Anwendungsbereich | ⚠️ bedingt | Aktuell kein KI-System → nicht anwendbar. Sobald ML-Feature: anwendbar |
| Art. 3 — KI-System-Definition | 📋 referenz | Aktuell kein KI-System nach Art. 3 Nr. 1 implementiert |
| Art. 5 — Verbotene Praktiken | ❌ nicht anwendbar | Gamification: transparent + kein Social Scoring |
| Art. 6 + Anhang III — Hochrisiko | ❌ nicht anwendbar | Keiner der 8 Hochrisiko-Bereiche einschlägig |
| Art. 50 — Transparenzpflichten | ⚠️ bedingt | Aktiv bei KI-Direktinteraktion oder Konsequenzen aus KI-Ausgabe |
| Art. 113 — Inkrafttreten | 📋 referenz | 02.02.2025 (Art. 5); 02.08.2026 (allgemein) |

**Compliance-Status (Stand 05/2026): deferred**
Kein Handlungsbedarf vor Implementierung von ML-Features. AI Act gilt allgemein ab 02.08.2026.

---

## Trigger — Neu prüfen wenn:

1. **ML-Anomalie-Scoring (Isolation Forest) implementiert wird** → Prüfung: KI-System nach Art. 3 Nr. 1? Risikoklasse? Art. 50?
2. **KI-Chat-Assistent oder KI-Empfehlungen** → Art. 50 Abs. 1 Transparenzpflicht
3. **Kooperation mit Kranken-/Lebensversicherern** → Anhang III Nr. 5c Hochrisiko-Check
4. **Biometrische Features** (z.B. Gesichtserkennung für Check-ins) → Art. 5 + Anhang III Nr. 1

---

## Volltext-Dateien

| Datei | Inhalt | Status |
|---|---|---|
| `_screening.md` (diese Datei) | Vollständiges Artikel-Screening | ✅ erstellt (v1.0-pending-review) |
| `art-05.md` | Verbotene Praktiken (Volltext + Detailanalyse) | zu erstellen (bei Bedarf, aktuell nicht anwendbar) |
| `art-06.md` | Hochrisiko-Einstufung + Anhang III | zu erstellen (bei Bedarf, bei ML-Feature-Implementierung) |
| `art-50.md` | Transparenzpflichten | zu erstellen (bei KI-Implementierung) |

*Volltext-Dateien werden erstellt sobald die entsprechenden Artikel anwendbar werden.*
