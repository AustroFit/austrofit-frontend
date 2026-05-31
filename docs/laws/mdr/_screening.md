---
law: MDR
title: EU-Medizinprodukte-Verordnung (MDR)
rechtsgrundlage: Verordnung (EU) 2017/745
source_ref: "CELEX:32017R0745; ABl. L 117 vom 5.5.2017"
source_date: "2017-04-05"
source_file: "CELEX_32017R0745_DE_TXT.pdf"
screened_by: "AI-assisted (Claude Sonnet), basierend auf PDF CELEX_32017R0745_DE_TXT.pdf; bestätigt durch: [Name + Datum]"
screened_date: "2026-05-24"
last_reviewed: "2026-05-24"
version: "1.0-pending-review"
---

# MDR – Artikel-Screening (AustroFit)

> **Screening-Strategie:** Die Anwendbarkeit der MDR hängt vollständig an einer einzigen Frage:
> Ist AustroFit ein **Medizinprodukt** nach Art. 2 Nr. 1 MDR?
> Ist die Antwort **Nein** — ist die gesamte MDR nicht anwendbar.
> Dieses Screening dokumentiert diese Beurteilung anhand des Gesetzestexts.

---

## Schlüsselartikel: Art. 2 Nr. 1 — Definition „Medizinprodukt"

**Volltext aus PDF (Art. 2 Nr. 1 MDR):**

> „Medizinprodukt" bezeichnet ein Instrument, einen Apparat, ein Gerät, eine **Software**, ein Implantat, ein Reagenz, ein Material oder einen anderen Gegenstand, das dem Hersteller zufolge für Menschen bestimmt ist und allein oder in Kombination **einen oder mehrere der folgenden spezifischen medizinischen Zwecke erfüllen soll:**
>
> — Diagnose, Verhütung, Überwachung, Vorhersage, Prognose, **Behandlung oder Linderung von Krankheiten,**
>
> — Diagnose, Überwachung, Behandlung, Linderung von oder Kompensierung von **Verletzungen oder Behinderungen,**
>
> — Untersuchung, Ersatz oder Veränderung der **Anatomie oder eines physiologischen oder pathologischen Vorgangs oder Zustands,**
>
> — Gewinnung von Informationen durch die **In-vitro-Untersuchung von aus dem menschlichen Körper** — auch aus Organ-, Blut- und Gewebespenden — stammenden Proben
>
> und dessen bestimmungsgemäße Hauptwirkung im oder am menschlichen Körper weder durch pharmakologische oder immunologische Mittel noch metabolisch erreicht wird, dessen Wirkungsweise aber durch solche Mittel unterstützt werden kann.

**Volltext aus PDF (Erwägungsgrund 19 MDR):**

> „Es muss eindeutig festgelegt werden, dass Software als solche, wenn sie vom Hersteller speziell für einen oder mehrere der in der Definition von Medizinprodukten genannten medizinischen Zwecke bestimmt ist, als Medizinprodukt gilt, während **Software für allgemeine Zwecke**, auch wenn sie in Einrichtungen des Gesundheitswesens eingesetzt wird, sowie **Software, die für Zwecke in den Bereichen Lebensstil und Wohlbefinden eingesetzt wird, kein Medizinprodukt ist.**"

---

## Beurteilung AustroFit

### Checkliste: Medizinische Zweckbestimmungen nach Art. 2 Nr. 1

| Medizinische Zweckbestimmung | Trifft auf AustroFit zu? | Begründung |
|---|---|---|
| Diagnose, Verhütung, Überwachung, Vorhersage, Prognose, Behandlung oder Linderung von **Krankheiten** | **Nein** | AustroFit diagnostiziert und behandelt keine Krankheiten. Schritte und Workouts werden erfasst, nicht zur Krankheitsdiagnostik ausgewertet. |
| Diagnose, Überwachung, Behandlung, Linderung von **Verletzungen oder Behinderungen** | **Nein** | Kein Bezug zu Verletzungsbehandlung oder Rehabilitation. |
| Untersuchung, Ersatz oder Veränderung der **Anatomie oder physiologischer/pathologischer Vorgänge** | **Nein** | Keine anatomischen oder physiologischen Eingriffe oder Messungen. |
| In-vitro-Untersuchung von **Körperproben** | **Nein** | Keine Laboranalysen, keine Körperproben. |
| **Empfängnisverhütung oder -förderung** | **Nein** | Kein Bezug. |
| **Reinigung, Desinfektion oder Sterilisation** von Medizinprodukten | **Nein** | Kein Bezug. |

### Klassifikation nach Erwägungsgrund 19

AustroFit ist **Software für Zwecke in den Bereichen Lebensstil und Wohlbefinden** (EG 19):
- Bewegungsmotivation durch Gamification (Punkte, Level, Streaks, Badges)
- Erfassung von Schritten und Workouts als Aktivitätsnachweis — keine medizinische Auswertung
- Quiz-System zur Gesundheitsbildung — allgemeine Information, kein klinischer Entscheidungssupport
- Belohnungssystem (Partner-Rewards) — kommerziell, nicht medizinisch

**→ AustroFit ist nach Erwägungsgrund 19 MDR ausdrücklich kein Medizinprodukt.**

### Sonderprüfung: Aktivitätsgruppen (adult/senior/pregnant/chronic)

Die vier Aktivitätsgruppen personalisieren die **Gamification-Ziele** (Cardio-Zielminuten, Streak-Stufen):
- `adult`: Standard-Ziele
- `senior`: angepasste (niedrigere) Ziele
- `pregnant`: moderate Intensitätsbewertung, angepasste Ziele
- `chronic`: reduzierte Ziele (start=35, full=100 Min statt 50/150)

Dies ist eine **Anpassung des Belohnungssystems** an die individuelle Lebenssituation — keine Diagnose, keine Therapieempfehlung, keine klinische Entscheidung. Kein Nutzer wird aufgrund der Gruppe behandelt oder diagnostiziert.

**→ Aktivitätsgruppen begründen keine medizinische Zweckbestimmung i.S.d. Art. 2 Nr. 1 MDR.**

---

## Ergebnis

**AustroFit ist kein Medizinprodukt nach Art. 2 Nr. 1 MDR.**

Die MDR ist **nicht anwendbar** (`applicability: false`).

**Rechtsgrundlage (aus PDF):**
- Art. 2 Nr. 1 MDR: Keine der vier medizinischen Zweckbestimmungen ist im Produktkonzept enthalten.
- Erwägungsgrund 19 MDR: Software für "Lebensstil und Wohlbefinden" ist ausdrücklich kein Medizinprodukt.

**Umgesetzte Schutzmaßnahme:** MDR-Disclaimer im Onboarding (`src/routes/registrierung/+page.svelte`) stellt sicher, dass keine medizinischen Claims impliziert werden. Diese Maßnahme ist nicht nur empfohlen, sondern **zwingend notwendig** um die Nicht-Anwendbarkeit dauerhaft zu sichern.

---

## Trigger — MDR-Pflichten entstehen wenn:

Die MDR wird **sofort anwendbar**, sobald AustroFit oder seine Werbung einen der folgenden Punkte enthält:

| Trigger | Beispiel | Konsequenz |
|---|---|---|
| Krankheitsdiagnose | „AustroFit erkennt Anzeichen von Diabetes anhand deiner Aktivitätsdaten" | Sofort Medizinprodukt Klasse I–III → CE-Pflicht |
| Therapieempfehlung | „Bei deiner Schrittanzahl empfehlen wir diese Übungen zur Behandlung deines Knieschmerzens" | Sofort Medizinprodukt |
| Prognose/Risikoabschätzung | „Dein Aktivitätsprofil deutet auf erhöhtes Herzerkrankungsrisiko hin" | Sofort Medizinprodukt |
| Klinischer Entscheidungssupport | „Ihre Werte entsprechen nicht den WHO-Empfehlungen — bitte Arzt konsultieren" (als Produktfunktion, nicht Disclaimer) | Hohes MDR-Risiko |
| Kooperation mit Krankenkassen für klinische Outcomes | Daten werden zur Beurteilung von Therapieerfolgen verwendet | MDR-Prüfung erforderlich |
| B2B an Gesundheitseinrichtungen | Verkauf der App an Krankenhäuser als klinisches Instrument | Kontext-abhängig, MDR prüfen |

**Fazit zum Disclaimer:** Der bestehende Disclaimer ("keine medizinischen Empfehlungen") ist die einzige Linie zwischen Wellness-App und Medizinprodukt. Er muss in allen Marketingmaterialien, App-Beschreibungen (Play Store, App Store) und im UI konsequent eingehalten werden.

---

## Volltext-Dateien

Keine weiteren Detail-Dateien erforderlich. Die Nicht-Anwendbarkeit ist vollständig durch Art. 2 Nr. 1 + EG 19 begründet.

| Datei | Status |
|---|---|
| `_screening.md` (diese Datei) | ✅ vollständig (v1.0-pending-review) |
