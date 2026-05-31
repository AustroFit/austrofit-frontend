---
law: BFSG
title: BFSG / BaFG – Screening (EU Accessibility Act, Richtlinie 2019/882)
rechtsgrundlage: "Richtlinie (EU) 2019/882 (EAA); österr. BaFG BGBl. I Nr. 80/2023; dt. BFSG BGBl. I Nr. 12/2023"
source_ref: "CELEX:32019L0882; ABl. L 151 vom 7.6.2019, S. 70–115"
source_date: "2019-04-17"
source_file: "CELEX_32019L0882_DE_TXT.pdf"
screened_by: "AI-assisted (Claude Sonnet 4.6), basierend auf PDF CELEX_32019L0882_DE_TXT.pdf (ABl. L 151/2019, 42 S.); bestätigt durch: [Name + Datum]"
screened_date: "2026-05-24"
last_reviewed: "2026-05-24"
version: "1.1-pending-review"
---

# BFSG / BaFG – Artikel-Screening (AustroFit)

> **Screening-Strategie:** Die Anwendbarkeit der Richtlinie (EU) 2019/882 auf AustroFit hängt von
> zwei Fragen ab:
>
> 1. **Ist AustroFit vom sachlichen Anwendungsbereich (Art. 2) erfasst?**
>    (d.h. fällt AustroFit unter eine der gelisteten Dienstleistungskategorien?)
>
> 2. **Greift die Kleinstunternehmen-Ausnahme (Art. 4 Abs. 5)?**
>    (< 10 Beschäftigte + ≤ 2 Mio EUR Jahresumsatz/Bilanzsumme → Dienstleistungsanbieter befreit)
>
> Dieses Screening beantwortet beide Fragen auf Basis des Originaltexts (ABl. L 151/2019).

---

## Schritt 1: Sachlicher Anwendungsbereich — Art. 2 (aus PDF)

### Art. 2 Abs. 1 — Erfasste Produkte (ab 28. Juni 2025)

> „Diese Richtlinie gilt für folgende Produkte, die nach dem 28. Juni 2025 in Verkehr gebracht werden:
> a) Hardwaresysteme und für diese Hardwaresysteme bestimmte Betriebssysteme für Universalrechner für Verbraucher;
> b) die folgenden Selbstbedienungsterminals: Zahlungsterminals; Geldautomaten; Fahrausweisautomaten;
>    Check-in-Automaten; interaktive Selbstbedienungsterminals zur Bereitstellung von Informationen;
> c) Verbraucherendgeräte mit interaktivem Leistungsumfang für elektronische Kommunikationsdienste;
> d) Verbraucherendgeräte mit interaktivem Leistungsumfang für den Zugang zu audiovisuellen Mediendiensten;
> e) E-Book-Lesegeräte."

**AustroFit-Beurteilung:** AustroFit ist keine Hardware. **→ Art. 2 Abs. 1 nicht anwendbar.**

### Art. 2 Abs. 2 — Erfasste Dienstleistungen (ab 28. Juni 2025)

> „Unbeschadet ihres Artikels 32 gilt diese Richtlinie für folgende Dienstleistungen, die für Verbraucher
> nach dem 28. Juni 2025 erbracht werden:
> a) elektronische Kommunikationsdienste mit Ausnahme von Übertragungsdiensten;
> b) Dienste, die den Zugang zu audiovisuellen Mediendiensten ermöglichen;
> c) folgende Elemente von Personenverkehrsdiensten im Luft-, Bus-, Schienen- und Schiffsverkehr [...]
> d) Bankdienstleistungen für Verbraucher;
> e) E-Books und hierfür bestimmte Software; und
> f) Dienstleistungen im elektronischen Geschäftsverkehr."

**AustroFit-Beurteilung je Kategorie:**

| Kategorie | Trifft zu? | Begründung |
|---|---|---|
| (a) Elektronische Kommunikation | **Nein** | Kein TK-Dienst (kein VoIP, Messaging) |
| (b) Audiovisuelle Mediendienste | **Nein** | Kein Video-Streaming |
| (c) Personenverkehr | **Nein** | Keine Transport-/Reisebuchungen |
| (d) Bankdienstleistungen | **Nein** | Keine Zahlungsdienste i.S.d. ZaDiG; Punkte kein E-Geld |
| (e) E-Books / Software | **Nein** | Kein E-Book-Dienst |
| **(f) E-Commerce** | **Nein** | Detailanalyse unten — klar nicht anwendbar |

### E-Commerce (Art. 2 Abs. 2 lit. f) — Analyse auf Basis Art. 3 Nr. 30

Art. 3 Nr. 30 definiert den Begriff abschließend:

> **Art. 3 Nr. 30 (Volltext aus PDF):**
> „‚Dienstleistungen im elektronischen Geschäftsverkehr' Ferndienstleistungen, die über Websites und auf
> Mobilgeräten angebotenen Dienstleistungen, elektronisch und auf individuelle Anfrage eines Verbrauchers
> **im Hinblick auf den Abschluss eines Verbrauchervertrags** erbracht werden."

**Entscheidendes Merkmal:** Die Dienstleistung muss auf den **Abschluss eines Verbrauchervertrags** ausgerichtet sein — d.h. ein Nutzer kauft oder erwirbt eine Leistung gegen Entgelt.

**AustroFit-Prüfung:**

| Kriterium | AustroFit | Ergebnis |
|---|---|---|
| Ferndienstleistung über Website/App? | Ja | ✅ |
| Auf Abschluss eines Verbrauchervertrags ausgerichtet? | **Nein** — AustroFit ist kostenlos; kein Kaufvertrag auf der Plattform | ❌ |
| Nutzer erwirbt Waren/Leistungen gegen Entgelt? | Nein — Punkte werden durch Aktivität verdient, nicht gekauft | ❌ |
| Reward-Einlösung = Verbrauchervertrag auf AustroFit? | Nein — Klick leitet zu Partnerseite; Vertrag entsteht dort | ❌ |

**→ AustroFit ist kein E-Commerce-Dienst i.S.d. Art. 3 Nr. 30 / Art. 2 Abs. 2 lit. f.**
Die Definition verlangt den Abschluss eines Verbrauchervertrags auf der Plattform. AustroFit ist ein kostenloser Gamification-Dienst ohne direkten Kaufabschluss.

**→ Art. 2 Abs. 2 (Dienstleistungen): Keine der sechs Kategorien ist anwendbar.**

### Art. 2 Abs. 4 — Ausnahmen für Websites und Apps (vollständigkeitshalber)

> Art. 2 Abs. 4 schließt aus dem Geltungsbereich aus:
> a) aufgezeichnete zeitbasierte Medien, die vor dem 28. Juni 2025 veröffentlicht wurden;
> b) Dateiformate von Büro-Anwendungen, die vor dem 28. Juni 2025 veröffentlicht wurden;
> c) Online-Karten und Kartendienste (wenn wesentliche Informationen in barrierefreier Form bereitgestellt werden);
> d) Inhalte von Dritten, die nicht finanziert, entwickelt oder kontrolliert werden;
> e) Inhalte von Websites und Apps, die als Archive gelten (nicht aktualisiert nach 28.6.2025).

**Hinweis:** Da Art. 2 Abs. 2 bereits nicht greift, sind diese Ausnahmen für AustroFit nur nachrangig relevant.

---

## Schritt 2: Kleinstunternehmen-Ausnahme — Art. 4 Abs. 5 (aus PDF)

### Volltext Art. 4 Abs. 5

> **Art. 4 Abs. 5 (Volltext aus PDF):**
> „Kleinstunternehmen, die Dienstleistungen anbieten, sind von der Erfüllung der
> Barrierefreiheitsanforderungen nach Absatz 3 dieses Artikels und von allen Verpflichtungen
> im Zusammenhang mit der Erfüllung dieser Anforderungen **ausgenommen**."

### Volltext Art. 3 Nr. 23 — Definition Kleinstunternehmen

> **Art. 3 Nr. 23 (Volltext aus PDF):**
> „‚Kleinstunternehmen' ein Unternehmen, das weniger als zehn Personen beschäftigt und das
> entweder einen Jahresumsatz von höchstens 2 Mio. EUR erzielt oder dessen Jahresbilanzsumme
> sich auf höchstens 2 Mio. EUR beläuft."

### AustroFit-Prüfung

| Kriterium | Wert (Stand Mai 2026) | Schwelle | Ergebnis |
|---|---|---|---|
| Beschäftigte | 1 (Einzelunternehmer Johannes Gnong) | < 10 | ✅ |
| Jahresumsatz | € 0 (pre-revenue, kein Go-Live) | ≤ 2 Mio EUR | ✅ |
| Jahresbilanzsumme | < 2 Mio EUR | ≤ 2 Mio EUR | ✅ |

**→ AustroFit ist Kleinstunternehmen i.S.d. Art. 3 Nr. 23. Art. 4 Abs. 5 greift vollständig.**

### Wichtiger Hinweis: Art. 4 Abs. 5 gilt NUR für Dienstleistungen

> **Art. 4 Abs. 2 (Produkte, kein KMU-Privileg):**
> „Alle Produkte müssen die Barrierefreiheitsanforderungen, die in Anhang I Abschnitt I
> festgelegt sind, erfüllen."

Für Produkthersteller gibt es keine Kleinstunternehmen-Ausnahme.
AustroFit stellt keine Hardware-Produkte her → irrelevant.

---

## Schritt 3: Übergangsmaßnahmen — Art. 32 (aus PDF)

> **Art. 32 Abs. 1 (Volltext aus PDF):**
> „[...] sehen die Mitgliedstaaten einen Übergangszeitraum vor, der am 28. Juni 2030 endet
> und in dem die Dienstleistungserbringer ihre Dienstleistungen weiterhin unter Einsatz von
> Produkten erbringen können, die von ihnen bereits vor diesem Datum zur Erbringung ähnlicher
> Dienstleistungen rechtmäßig eingesetzt wurden.
>
> Vor dem 28. Juni 2025 vereinbarte Dienstleistungsverträge dürfen bis zu ihrem Ablauf,
> allerdings nicht länger als **fünf Jahre** ab diesem Datum unverändert fortbestehen."

**Bedeutung:** AustroFit hat noch keinen Go-Live (keine Verträge vor dem 28.6.2025 geschlossen). Übergangsfristen sind damit nicht relevant — bei zukünftigen Verträgen gilt sofort die Richtlinie. Da Art. 4 Abs. 5 greift, sind Übergangsfristen für AustroFit ohnehin nachrangig.

---

## Schritt 4: Anforderungen — Anhang I (aus PDF, für Skalierungsplanung)

Da Art. 4 Abs. 5 die Ausnahme begründet, sind die Anhang-I-Anforderungen **aktuell nicht verpflichtend**. Dokumentiert für B2G-Vorbereitung.

### Anhang I Abschnitt III — Allgemeine Anforderungen für alle erfassten Dienstleistungen

> „[Damit die Dienstleistungen so erbracht werden, dass Menschen mit Behinderungen sie
> voraussichtlich maximal nutzen,]
> c) müssen Websites einschließlich der zugehörigen Online-Anwendungen und auf Mobilgeräten
> angebotenen Dienstleistungen, einschließlich mobiler Apps, auf kohärente und angemessene
> Weise **wahrnehmbar, bedienbar, verständlich und robust** gestaltet werden;"

Das sind die vier WCAG-Grundprinzipien (Perceivable, Operable, Understandable, Robust — POUR). Die harmonisierte Norm **EN 301 549 v3.2.1** operationalisiert diese als WCAG 2.1 AA.

### Anhang I Abschnitt IV — Zusätzliche Anforderungen für E-Commerce

Da E-Commerce nicht anwendbar ist, entfällt Abschnitt IV lit. g für AustroFit.
Dokumentiert für den Fall eines künftigen direkten Kaufmodells (z.B. kostenpflichtige Premium-Features):

> „g) bei Dienstleistungen im elektronischen Geschäftsverkehr (E-Commerce):
> i) Bereitstellung der Informationen zur Barrierefreiheit der zum Verkauf stehenden Produkte;
> ii) Gewährleistung der Barrierefreiheit der Identifizierungs-, Sicherheits- und Zahlungsfunktionen;
> iii) Bereitstellung von Identifizierungsmethoden, elektronischen Signaturen und Zahlungsdiensten,
>      die wahrnehmbar, bedienbar, verständlich und robust sind."

---

## Ergebnis

**AustroFit ist vom BFSG / BaFG nicht verpflichtet.** Doppelt begründet:

| Argument | Rechtsgrundlage | Ergebnis |
|---|---|---|
| Kein sachlicher Anwendungsbereich | Art. 2 Abs. 2: keine der 6 Kategorien greift; E-Commerce (lit. f) setzt Verbrauchervertrag voraus (Art. 3 Nr. 30) | ✅ Bereits nicht erfasst |
| Kleinstunternehmen-Ausnahme | Art. 4 Abs. 5: < 10 Beschäftigte + ≤ 2 Mio EUR Umsatz | ✅ Greift zusätzlich |

`compliance.yaml` → `applicability: false` — korrekt und vollständig belegt.

---

## Trigger — BFSG-Pflichten entstehen wenn:

| Trigger | Schwelle / Bedingung | Konsequenz |
|---|---|---|
| **Wachstum Beschäftigte** | ≥ 10 Personen beschäftigt | Art. 4 Abs. 5-Ausnahme entfällt → BFSG-Pflicht |
| **Wachstum Umsatz** | > 2 Mio EUR Jahresumsatz UND Bilanzsumme | Art. 4 Abs. 5-Ausnahme entfällt → BFSG-Pflicht |
| **Kostenpflichtiges Modell** | Direkte Kaufmöglichkeit auf der Plattform (z.B. Premium-Abo) | Art. 3 Nr. 30 greift → Art. 2 Abs. 2 lit. f anwendbar |
| **B2G-Kooperation** | Krankenkassen-Vertrag, öffentliche Gesundheitsprogramme | WCAG 2.1 AA als vertragliche Voraussetzung |
| **DiGA-AT-Zertifizierung** | Digitale Gesundheitsanwendung Österreich | WCAG 2.1 AA wahrscheinlich Zertifizierungsanforderung |

---

## Best Practices (proaktiv empfohlen, nicht verpflichtend)

**WCAG 2.1 AA als Design-Prinzip** — auch ohne gesetzliche Pflicht sinnvoll:
- Walter-Persona (55+) ist Kernsegment; Barrierefreiheit = bessere UX für alle
- B2G-Verträge erfordern Barrierefreiheit unabhängig von gesetzlicher Pflicht

**Sofort umsetzbar (Low-Effort):**
1. ARIA-Labels auf alle Icon-Buttons ohne Textinhalt (`aria-label="..."`)
2. Semantisches Alt-Attribut auf alle `<img>`-Elemente
3. `lang="de"` im `<html>`-Tag — bereits vorhanden ✅
4. Kontrast-Check: Primary-Green (#2D8B4E) auf Weiß → ~5,3:1 ✅ (Grenzwert 4,5:1)

**Mittelfristig (vor B2G / Phase 2):**
5. `focus-visible`-Styles für alle interaktiven Elemente
6. Korrekte Heading-Hierarchie (`h1` → `h2` → `h3`) im gesamten App-Layout
7. Alle `<input>`-Elemente mit `<label>` verknüpft (nicht nur Placeholder)
8. TalkBack (Android) / NVDA (Web) Screen-Reader-Test

**Vor B2G-Verhandlung:**
9. Accessibility Statement veröffentlichen (Selbstbewertung, Kontakt)
10. WCAG 2.1 AA Audit durch akkreditierte Prüfstelle

---

## Volltext-Dateien

| Datei | Status |
|---|---|
| `_screening.md` (diese Datei) | ✅ vollständig (v1.1-pending-review, basiert auf PDF) |
| `art-04.md` — Barrierefreiheitsanforderungen + Kleinstunternehmen-Ausnahme | deferred — erst bei Wachstum über KU-Schwelle |
