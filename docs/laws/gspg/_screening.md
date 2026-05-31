---
law: GSpG
title: Glücksspielgesetz
rechtsgrundlage: BGBl. Nr. 620/1989 idgF (BGBl. I Nr. 50/2025)
source_ref: "GSpG, Fassung vom 23.05.2026 (RIS)"
source_date: "2026-05-23"
source_file: "GSpG, Fassung vom 23.05.2026.pdf"
screened_by: "AI-assisted (Claude Sonnet), basierend auf PDF RIS-Fassung 23.05.2026 (39 Seiten); bestätigt durch: [Name + Datum]"
screened_date: "2026-05-24"
last_reviewed: "2026-05-24"
version: "1.0-pending-review"
---

# GSpG – Paragraph-Screening (AustroFit)

> **Screening-Strategie:** Die Anwendbarkeit des GSpG hängt vollständig an zwei Schwellenfragen:
> 1. Ist AustroFit ein **Glücksspiel** i.S.d. § 1? → **Nein** (kein Zufallselement)
> 2. Betreibt AustroFit eine **Ausspielung** i.S.d. § 2? → **Nein** (kein monetärer Einsatz)
>
> Sind beide Fragen **Nein** → ist das gesamte GSpG nicht anwendbar.
> Dieses Screening dokumentiert diese Beurteilung anhand des Gesetzestexts (Fassung 23.05.2026)
> und benennt die **einzigen zwei Trigger**, die zur Anwendbarkeit führen würden.

**Ergebnis vorab:** `applicability: false` — GSpG ist für AustroFit **nicht anwendbar**.
Einzige bedingte Ausnahme: § 58 Abs. 3 (Gewinnspiele/Preisausschreiben), deferred.

---

## Schlüsselprüfung: §§ 1 und 2 — Kerndefinitionen

### § 1 — Glücksspielbegriff

**Volltext (§ 1 Abs. 1 GSpG):**
> „Ein Glücksspiel im Sinne dieses Bundesgesetzes ist ein Spiel, bei dem die Entscheidung über das Spielergebnis ausschließlich oder vorwiegend vom Zufall abhängt."

**Prüfung AustroFit:**

| Aktivität | Zufallsabhängig? | Begründung |
|---|---|---|
| Schrittzählung | **Nein** | Deterministische Sensorauswertung; jeder Schritt = 1 Punkt nach definierten Formeln |
| Cardio-Tracking | **Nein** | Aktivitätsminuten × Intensitätsfaktor = fixe Punkte; Algorithmus in `cardioService.ts` ist deterministisch |
| Quiz | **Nein** | Wissensbeantwortung; bei richtiger Antwort: fixe Punkte; kein Zufalls-Outcome |
| Level-System | **Nein** | `earnedPoints ≥ Schwellenwert` → Level-Up; keine Zufallskomponente |
| Streaks | **Nein** | Konditional auf tägliche Aktivität; deterministisch |
| Rewards (Prämieneinlösung) | **Nein** | Nutzer wählt Belohnung aus; kein Zufallsmechanismus (keine Lootboxen, keine Random-Drops) |

**→ AustroFit ist kein Glücksspiel nach § 1 GSpG.** Kein einziger spielerischer Mechanismus hängt vom Zufall ab.

---

### § 2 — Ausspielungen

**Volltext (§ 2 Abs. 1 GSpG):**
> „Ausspielungen sind Glücksspiele,
> 1. die ein Unternehmer veranstaltet, organisiert, anbietet oder zugänglich macht **und**
> 2. bei denen Spieler oder andere eine **vermögenswerte Leistung** in Zusammenhang mit der Teilnahme am Glücksspiel erbringen (Einsatz) **und**
> 3. bei denen vom Unternehmer, von Spielern oder von anderen eine vermögenswerte Leistung in Aussicht gestellt wird (Gewinn)."

**Prüfung AustroFit — kumulatives Drei-Stufen-Schema:**

| Voraussetzung | Erfüllt? | Begründung |
|---|---|---|
| Z 1: Unternehmer veranstaltet | **(✓ ja)** | AustroFit GmbH (i.Gr.) betreibt die App gewerbsmäßig |
| **Z 2: Einsatz (vermögenswerte Leistung)** | **❌ NEIN** | Nutzer bezahlen **keinen Geldbetrag** für Spielteilnahme. Punkte werden nur durch körperliche Aktivität erworben — Punkte sind **nicht käuflich**. Nutzer erbringen keine vermögenswerte Leistung i.S.d. § 2 Abs. 1 Z 2. |
| Z 3: Gewinn in Aussicht gestellt | **(✓ ja)** | Partner-Rewards haben vermögenswerten Charakter |

**→ Das Drei-Stufen-Schema ist nicht kumulativ erfüllt — Z 2 fehlt.**
**AustroFit betreibt keine Ausspielung nach § 2 GSpG.**

**Verbotene Ausspielungen (§ 2 Abs. 4):** Nur Ausspielungen ohne Konzession. Gilt nicht, weil AustroFit keine Ausspielung ist.

---

## § 4 — Ausnahmen aus dem Glücksspielmonopol (nur informativ)

**Status:** ℹ️ informativ (§§ 1+2 nicht erfüllt → § 4 nicht relevant)

Selbst wenn hypothetisch ein Grenzfall entstünde, greifen die Ausnahmen des § 4:

- **§ 4 Abs. 1:** Spiele, die nicht Ausspielung i.S.d. § 2 Abs. 1 sind UND nur zum Zeitvertreib und um geringe Beträge gespielt werden → fallen aus dem Glücksspielmonopol heraus.
- **§ 4 Abs. 5:** Glückshäfen, Juxausspielungen, Tombolaspiele bis Spielkapital €4.000/Kalenderjahr ohne persönliche Interessen → ebenfalls ausgenommen.

AustroFit's Aktivitätspunkte-System ist weder eine Ausspielung noch ein Glücksspiel — § 4 wird deshalb gar nicht erst erreicht. Die Ausnahmen werden nur der Vollständigkeit halber dokumentiert.

---

## Artikel-Screening — Gesamtübersicht

### §§ 1–2 — Definitionen (Kerntarife)
**Status:** ❌ nicht anwendbar — siehe Schlüsselprüfung oben.

### § 3 — Glücksspielmonopol
**Status:** ❌ nicht anwendbar  
Das Glücksspielmonopol des Bundes gilt nur für Ausspielungen (§ 2). Da AustroFit keine Ausspielung betreibt, ist das Monopol irrelevant.

### §§ 4–5 — Ausnahmen aus dem Monopol / Landesausspielungen
**Status:** ❌ nicht anwendbar  
Gilt nur wenn § 2 erfüllt wäre. Nur informativ dokumentiert (→ § 4 oben).

### §§ 6–13 — Bestimmte Lotterien (Lotto, Toto, Zusatzspiel, Sofortlotterien, Klassenlotterie, Zahlenlotto, Nummernlotterien, Elektronische Lotterien, Bingo/Keno, Mehrstufige Ausspielungen)
**Status:** ❌ nicht anwendbar  
Alle spezifischen Lotterie-Typen setzen Ausspielung i.S.d. § 2 voraus. AustroFit führt keine dieser Lotterieformen durch.

### §§ 14–20 — Konzessionen für Lotterien (Übertragung, Spielbedingungen, Beteiligungen, Konzessionsabgabe, Aufsicht, Sportförderung)
**Status:** ❌ nicht anwendbar  
Konzessionspflichten gelten nur für Konzessionäre der in §§ 6–12b genannten Ausspielungen. AustroFit ist kein Konzessionär.

### §§ 21–29 — Spielbanken (Konzession, Betrieb, Spielbankbesucher, Spielordnung, Arbeitnehmer, Spielbankabgabe)
**Status:** ❌ nicht anwendbar  
AustroFit betreibt keine Spielbank.

### §§ 31–31c — Gemeinsame Vorschriften für Konzessionäre und Bewilligungsinhaber (Spenden, Geschäftsleiter, Geldwäsche/Terrorismusfinanzierung)
**Status:** ❌ nicht anwendbar  
Gilt nur für Konzessionäre und Bewilligungsinhaber nach §§ 5, 14 und 21. AustroFit ist keines davon.

### §§ 32–49 — Lotterien ohne Erwerbszweck (Nummernlotterien, Tombolaspiele, Glückshäfen, Juxausspielungen, Bewilligung, Durchführung, Überwachung)
**Status:** ⚠️ bedingt relevant (Deferred — nur wenn AustroFit eigene Verlosungen veranstaltet)

Lotterien ohne Erwerbszweck (Tombolaspiele, Nummernlotterien, Glückshäfen etc.) sind ausgenommen vom Glücksspielmonopol, benötigen aber unter bestimmten Voraussetzungen eine **Bewilligung** nach § 36 beim Finanzamt Österreich.

**Aktuelle AustroFit-Situation:** Nicht anwendbar — AustroFit veranstaltet keine Verlosungen.
**Trigger:** Wenn AustroFit eine Zufalls-Verlosung unter Nutzern organisiert (z.B. "alle Nutzer mit 30-Tage-Streak nehmen an Verlosung teil") → § 36-Bewilligung prüfen.

### §§ 50–56 — Straf- und Verfahrensbestimmungen, Beschlagnahme, Einziehung, Werbung, Betriebsschließung
**Status:** ❌ nicht anwendbar  
Strafbestimmungen (§ 52) setzen Verwaltungsübertretungen nach GSpG voraus — primär das unerlaubte Veranstalten verbotener Ausspielungen. Da AustroFit keine Ausspielung betreibt, sind Strafbestimmungen irrelevant.

**§ 56 — Zulässige Werbung:**
Werbung für Glücksspiele muss "verantwortungsvollen Maßstab" wahren. AustroFit bewirbt kein Glücksspiel → nicht anwendbar. Jedoch: Allgemeines Werberecht (UWG) und gesundheitsbezogene Claims bleiben über andere Normen relevant.

---

## § 57 — Glücksspielabgaben (Haupttatbestand)

**Status:** ❌ nicht anwendbar

**Volltext (§ 57 Abs. 1 GSpG, Kurzfassung):**
> „Ausspielungen, an denen die Teilnahme vom Inland aus erfolgt, unterliegen einer Glücksspielabgabe von 17,5 vH vom Einsatz."

**Prüfung:** § 57 setzt "Ausspielungen" i.S.d. § 2 voraus. Da AustroFit keine Ausspielung betreibt und es keinen "Einsatz" gibt, ist § 57 nicht anwendbar.

---

## § 58 Abs. 3 — Ermäßigte Glücksspielabgabe für Gewinnspiele/Preisausschreiben

**Status:** ⚠️ bedingt relevant — **Deferred (Phase 2 / Marketing-Aktionen)**

**Volltext (§ 58 Abs. 3 GSpG):**
> „Glücksspiele im Rahmen von Gewinnspielen (Preisausschreiben) **ohne vermögenswerte Leistung** gemäß § 2 Abs. 1 Z 2 (Einsatz) unterliegen einer **Glücksspielabgabe von 5 vH** der in Aussicht gestellten vermögenswerten Leistungen (Gewinn), wenn sich das Gewinnspiel (auch) an die inländische Öffentlichkeit richtet. Die Steuerpflicht entfällt, wenn die **Steuer den Betrag von 500 Euro** im Kalenderjahr nicht überschreitet."

**Anwendungsvoraussetzungen (kumulativ):**
1. Glücksspiel (Zufallskomponente vorhanden)
2. Kein monetärer Einsatz der Teilnehmer
3. Richtet sich an inländische Öffentlichkeit
4. Steuerlast > €500/Jahr (= Gewinnsumme × 5% > €500 → d.h. Gewinnsumme > €10.000)

**Aktuelle AustroFit-Situation:**
AustroFit's Reward-System ist **deterministisch** (Punkte → Prämie) → kein Zufallselement → § 58 Abs. 3 **nicht anwendbar**.

**Trigger:** Wenn AustroFit eine zufallsbasierte Promo-Aktion einführt:
- Beispiel: „Alle Nutzer mit ≥10.000 Punkten diesen Monat nehmen an Gewinnspiel teil — Hauptpreis: €500 Gutschein"
- → Glücksspiel i.S.d. § 1 (Zufallsauswahl des Gewinners)
- → Kein Einsatz (Teilnahme kostenlos für Nutzer)
- → **§ 58 Abs. 3 anwendbar**
- → 5% Glücksspielabgabe auf Gesamtpreiswert (entfällt wenn < €500 Steuer = Preiswert < €10.000)

**Praxisregel für Marketing-Aktionen:**
Solange Preiswert pro Kalenderjahrsaktion **unter €10.000** bleibt → keine Steuerpflicht (Freigrenze §58 Abs. 3 letzter Satz).
Bewilligungspflicht nach §§ 32–49 separat prüfen wenn zufallsbasierte Verlosung geplant.

---

## Ergebnis

**Das GSpG ist für AustroFit nicht anwendbar** (`applicability: false`).

**Rechtsgrundlage (aus PDF):**
- **§ 1 GSpG:** Kein Zufallselement in keinem AustroFit-Mechanismus — weder Schrittzählung, Cardio, Quiz, noch Rewards.
- **§ 2 GSpG:** Keine vermögenswerte Leistung (Einsatz) der Nutzer — Punkte sind nicht käuflich, Teilnahme ist kostenlos.
- Das kumulative Drei-Stufen-Schema des § 2 Abs. 1 ist an Z 2 (Einsatz) gescheitert.

**Keine weiteren Schutzmaßnahmen erforderlich**, solange:
1. Punkte nicht gegen Geld kaufbar sind
2. Kein Zufalls-Mechanismus (Lootbox, Random-Drop, Verlosung) eingeführt wird

---

## Trigger — GSpG-Pflichten entstehen wenn:

| Trigger | Beispiel | Konsequenz |
|---|---|---|
| **Kaufmöglichkeit für Punkte** | „Kaufe 1.000 Punkte um €9,99" | § 2 Abs. 1 Z 2 erfüllt → Ausspielung möglich → Konzessionspflicht oder Verbot |
| **Lootboxen / Random-Drops** | „Öffne eine Loot-Box und erhalte zufällig Bronze/Silber/Gold-Reward" | § 1 erfüllt (Zufall) + ggf. § 2 (Einsatz) → Glücksspiel; kein Einsatz → § 58 Abs. 3 prüfen |
| **Zufallsbasierte Verlosungen** | „Alle Nutzer mit 30-Tage-Streak nehmen an Verlosung teil (kostenlos)" | § 1 ja, § 2 Z 2 nein → § 58 Abs. 3 (5% Abgabe wenn Preiswert > €10.000); ggf. § 36-Bewilligung |
| **Token / virtuelle Währung gegen Geld** | Verkauf von In-App-Currency für Geld | ZaDiG 2018 / GSpG prüfen je nach Ausgestaltung |
| **Cashback / Bargeld-Auszahlung** | Punkte gegen Barmittel einlösbar | ZaDiG + GSpG gemeinsam prüfen |

**Kritische Designregel (unveränderlich):**
Punkte dürfen **nie käuflich** sein und Rewards dürfen **nie zufallsbasiert** vergeben werden, solange AustroFit kein GSpG-Konzessionär sein will. Diese Designentscheidungen sind in `docs/compliance.yaml` unter `gspg-gewinnspiele-design` dokumentiert.

---

## Volltext-Dateien

Keine Detail-Artikel-Dateien erforderlich. Die Nicht-Anwendbarkeit ist vollständig durch §§ 1 + 2 begründet.
§ 58 Abs. 3 ist als "deferred watchlist" hier dokumentiert.

| Datei | Status |
|---|---|
| `_screening.md` (diese Datei) | ✅ vollständig (v1.0-pending-review) |
