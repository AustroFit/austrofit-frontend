---
law: DSA
title: Digital Services Act
rechtsgrundlage: Verordnung (EU) 2022/2065; gilt seit 17.02.2024
source_ref: "CELEX:32022R2065; OJ L 277, 27.10.2022"
source_date: "2022-10-19"
source_url: https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32022R2065
screened_by: "Claude Sonnet 4.6 / Johannes"
screened_date: "2026-05-24"
last_reviewed: "2026-05-24"
version: "1.0"
---

# DSA – Vollständiges Artikel-Screening (AustroFit)

> **Status:** Vollständig (v1.0, 2026-05-24). Alle 95 Artikel aus CELEX_32022R2065_DE_TXT.pdf gesichtet.

## AustroFit-Klassifikation

| Kategorie | Ergebnis | Begründung |
|---|---|---|
| Dienst der Informationsgesellschaft | ✅ Ja | Elektronischer Dienst auf Anfrage, unentgeltlich aber im wirtschaftlichen Zusammenhang |
| Hostingdiensteanbieter (Art. 3 g iii) | ✅ Ja | Speichert nutzergenerierte Daten: Profil, Schritte, Workouts, Quiz-Antworten, Punkte-Ledger |
| Online-Plattform (Art. 3 i) | ❌ Aktuell Nein | Keine **öffentliche Verbreitung** nutzergenerierter Inhalte an unbegrenzte Dritte |
| Kleinstunternehmen (< 10 MA / < 2 Mio EUR) | ✅ Ja | Gründungsphase; Ausnahme Art. 15 Abs. 2 und Art. 19 greifen |
| Very Large Online Platform (Art. 33) | ❌ Nein | Schwellenwert 45 Mio aktive Nutzer/Monat weit entfernt |

**Konsequenz:** Es gelten nur die Grundpflichten aus Kapitel II und III Abschnitte 1–2.
Abschnitt 3 (Online-Plattformen, Art. 19–28) greift nicht, da AustroFit aktuell keine UGC öffentlich verbreitet.

**Aufsichtsbehörde:** KommAustria / RTR-GmbH (Koordinator für digitale Dienste, Österreich, seit 17.02.2024)

---

## Screening-Legende

- `✅ anwendbar` – Direkte Pflicht für AustroFit
- `⚠️ bedingt` – Anwendbar nur unter bestimmten Bedingungen / Trigger
- `❌ nicht anwendbar` – Mit Begründung
- `📋 referenz` – Definitionsgrundlage, keine Pflicht

---

## Kapitel I – Allgemeine Bestimmungen

### Art. 1 – Gegenstand
**Status:** 📋 referenz
Harmonisierter Rechtsrahmen für Vermittlungsdienste.

### Art. 2 – Geltungsbereich
**Status:** ✅ anwendbar
Gilt für Vermittlungsdienste für Nutzer mit Niederlassungsort in der Union – AustroFit richtet sich an österreichische/EU-Nutzer.

### Art. 3 – Begriffsbestimmungen
**Status:** 📋 referenz
Schlüsseldefinitionen:
- **g iii** „Hosting-Dienst": Speicherung nutzerbereitgestellter Informationen → AustroFit qualifiziert.
- **i** „Online-Plattform": Hosting + **öffentliche Verbreitung** → AustroFit aktuell NICHT (kein UGC öffentlich sichtbar).
- **k** „Öffentliche Verbreitung": Bereitstellung für potenziell unbegrenzte Dritte → Leaderboard-Trigger: sobald Nutzerdaten öffentlich sichtbar sind, wird AustroFit zur Online-Plattform.

---

## Kapitel II – Haftung der Anbieter von Vermittlungsdiensten

### Art. 4 – Reine Durchleitung
**Status:** ❌ nicht anwendbar
AustroFit ist kein Netzbetreiber/ISP. Nicht anwendbar.

### Art. 5 – Caching
**Status:** ❌ nicht anwendbar
AustroFit betreibt kein CDN-Caching im DSA-Sinne.

### Art. 6 – Hosting (Haftungsprivileg)
**Status:** ✅ anwendbar – Schutzregel
**Inhalt:** AustroFit haftet nicht für gespeicherte nutzerbereitgestellte Inhalte, **sofern** es bei Kenntnis von Rechtswidrigkeit zügig handelt (entfernt / sperrt).
**AustroFit-Relevanz:** Beim Aktivieren von Community-Features (Leaderboard-Kommentare, Nutzernachrichten) ist dieser Artikel der Haftungsschutz. Gilt bereits jetzt für Nutzerprofil-Inhalte.
**Handlungsbedarf:** Internen Prozess definieren: Wer entscheidet bei gemeldeten rechtswidrigen Inhalten, in welchem Zeitrahmen? (→ verknüpft mit Art. 16)

### Art. 7 – Freiwillige Untersuchungen auf Eigeninitiative
**Status:** ✅ anwendbar – Schutzregel
Proaktive Maßnahmen (z. B. Spam-Filter, automatische Checks) entziehen AustroFit das Haftungsprivileg aus Art. 6 NICHT.
**Handlungsbedarf:** Keiner. Proaktives Moderieren ist erlaubt und schadet nicht.

### Art. 8 – Keine allgemeine Überwachungspflicht
**Status:** ✅ anwendbar – Schutzregel
AustroFit ist NICHT verpflichtet, Nutzerinhalte proaktiv zu scannen oder zu überwachen.
**Handlungsbedarf:** Keiner aktiv. Positiv: kein kostenintensives Content-Monitoring erforderlich.

### Art. 9 – Anordnungen zum Vorgehen gegen rechtswidrige Inhalte
**Status:** ✅ anwendbar
Wenn eine Behörde (z. B. Staatsanwaltschaft, BKA, KommAustria) eine Anordnung schickt: AustroFit muss die Anordnung unverzüglich umsetzen und der Behörde Ausführungsbestätigung schicken. Nutzer ist über Anordnung + Rechtsbehelfe zu informieren (außer wenn Behörde Stillschweigen anordnet).
**AustroFit-Relevanz:** Unwahrscheinlich in Startphase, aber Prozess muss vorhanden sein.
**Handlungsbedarf:** Internen Eskalationsweg definieren (wer empfängt Behördenanordnungen, wer entscheidet). Kontaktstelle = kontakt@austrofit.at ✅

### Art. 10 – Auskunftsanordnungen
**Status:** ✅ anwendbar
Behörden können Nutzerdaten anfordern. AustroFit muss: (1) Empfang bestätigen, (2) Ausführung bestätigen, (3) Nutzer informieren (außer bei behördlichem Verbot).
**Handlungsbedarf:** Gleicher interner Prozess wie Art. 9. Wichtig: Daten nur herausgeben, wenn Anordnung die formalen Anforderungen von Art. 10 Abs. 2 erfüllt (Rechtsgrundlage, Begründung, Verhältnismäßigkeit müssen angegeben sein).

---

## Kapitel III – Sorgfaltspflichten

### Abschnitt 1: Alle Anbieter von Vermittlungsdiensten

### Art. 11 – Kontaktstellen für Behörden
**Status:** ✅ anwendbar — **compliant**
**compliance_ref:** dsa-kontaktstelle
**Pflicht:** Zentrale Kontaktstelle für Behörden benennen und veröffentlichen. Sprache muss mindestens eine Amtssprache des Niederlassungsstaats umfassen (Deutsch) + weit verbreitete EU-Sprache (Englisch empfohlen).
**AustroFit-Umsetzung:** kontakt@austrofit.at im Impressum + KommAustria als Aufsichtsbehörde eingetragen ✅ (Mai 2026)

### Art. 12 – Kontaktstellen für Nutzer
**Status:** ✅ anwendbar — **compliant**
**Pflicht:** Nutzer müssen AustroFit direkt und schnell kontaktieren können; kein ausschließlich automatisiertes System (kein reiner Chatbot ohne menschliche Eskalation).
**AustroFit-Umsetzung:** kontakt@austrofit.at im Impressum ✅. E-Mail-Kontakt ist ausreichend.

### Art. 13 – Gesetzlicher Vertreter
**Status:** ❌ nicht anwendbar
Nur für Anbieter ohne EU-Niederlassung. AustroFit hat Niederlassung in Österreich.

### Art. 14 – Allgemeine Geschäftsbedingungen (AGB)
**Status:** ✅ anwendbar — **open (P1-Go-Live-Blocker)**
**Pflicht:** AGB müssen beschreiben:
- Welche Nutzerbeschränkungen gelten
- Welche Inhaltsmoderationsverfahren (inkl. algorithmischer Entscheidungsfindung) eingesetzt werden
- Verfahrensregeln für internes Beschwerdemanagement
- Klar, einfach, benutzerfreundlich und maschinenlesbar veröffentlichen
- Nutzer über wesentliche Änderungen informieren

**AustroFit-Relevanz:** AGB fehlen noch vollständig (bereits P1-Blocker in CLAUDE.md). DSA-spezifische Anforderungen müssen in AGB integriert werden:
1. Account-Suspendierungsregeln und -verfahren beschreiben
2. Meldeverfahren für rechtswidrige Inhalte verlinken (→ Art. 16)
3. Rechtsbehelfe gegen AustroFit-Entscheidungen erläutern

**Volltext-Datei:** — (kein eigenes Art.-File nötig, Inhalt in AGB-Dokument)

### Art. 15 – Transparenzberichtspflichten
**Status:** ❌ ausgenommen
**Begründung:** Art. 15 Abs. 2: Gilt NICHT für Kleinst- oder Kleinunternehmen gemäß Empfehlung 2003/361/EG.
AustroFit ist Kleinstunternehmen → kein jährlicher Transparenzbericht erforderlich.

---

### Abschnitt 2: Hostingdiensteanbieter (inkl. Online-Plattformen)

### Art. 16 – Melde- und Abhilfeverfahren
**Status:** ✅ anwendbar — **open**
**Pflicht:** AustroFit muss Verfahren einrichten, über die Personen rechtswidrige Inhalte melden können:
- Leicht zugänglich und benutzerfreundlich
- Ausschließlich elektronisch möglich
- Meldung muss enthalten: Begründung, URL/Speicherort, Kontaktdaten des Meldenden (außer bei CSAM), Gutglaubenserklärung
- Nach Meldung: Empfangsbestätigung + zeitnahe Entscheidung + Mitteilung der Entscheidung + Rechtsbehelfe

**AustroFit-Umsetzung:** Fehlt noch. Einfache Lösung für Kleinstunternehmen:
- Link „Rechtswidrige Inhalte melden" im Impressum/Datenschutzseite → E-Mail-Formular oder abuse@austrofit.at
- Interne Entscheidungsregel: Wer entscheidet (Johannes), in welchem Zeitraum (24–72h), wie wird geloggt
- Template für Empfangsbestätigung und Entscheidungsmitteilung erstellen

**Volltext-Datei:** —

### Art. 17 – Begründungspflicht
**Status:** ✅ anwendbar — **partial**
**Pflicht:** Bei Einschränkungen gegenüber Nutzern (Inhaltsentfernung, Konto-Sperrung, Dienst-Aussetzung) muss AustroFit eine Begründung mit folgenden Elementen mitteilen:
- Art und ggf. räumlicher Geltungsbereich der Maßnahme
- Tatsachen und Umstände der Entscheidung (ggf. ob auf Meldung oder Eigeninitiative)
- Ob automatisierte Mittel eingesetzt wurden
- Rechtsgrundlage (rechtswidrig) oder AGB-Verweis (AGB-Verstoß)
- Rechtsbehelfe (intern, außergerichtlich, gerichtlich)

**AustroFit-Umsetzung:**
- Derzeit kein formaler Account-Suspension-Mechanismus vorhanden → sobald implementiert: Begründungs-Template verpflichtend
- Bei Reward-Sperre (Dedup-Check, Rate-Limit → 429) wird kein Art. 17-Grund fällig, da es sich um technische Limits handelt, nicht um inhaltliche Beschränkungen im DSA-Sinne
- Relevant wird dies, wenn Nutzerkonten wegen Betrugs/Missbrauchs manuell gesperrt werden

**Volltext-Datei:** —

### Art. 18 – Meldung des Verdachts auf Straftaten
**Status:** ✅ anwendbar — **partial**
**Pflicht:** Wenn AustroFit Kenntnis von Informationen erlangt, die den Verdacht auf eine Straftat begründen, die eine **Gefahr für Leben oder Sicherheit** darstellt → unverzügliche Meldung an Strafverfolgungsbehörden (AT: Polizei/Staatsanwaltschaft) + Bereitstellung aller vorliegenden Informationen.

**AustroFit-Relevanz:** Für eine Gesundheits-App primär relevant bei:
- Suizidankündigungen in Nutzernachrichten/Community-Inhalten
- Ankündigungen schwerer Körperverletzung

**AustroFit-Umsetzung:** Kein dokumentierter Prozess vorhanden. Da keine Community-Features live sind, aktuell geringes Risiko. Vor Community-Launch: interner Eskalationspfad (Meldung an Polizei Notruf 133 / online Bundeskriminalamt) definieren.

---

### Abschnitt 3: Online-Plattformen (Art. 19–28)

### Art. 19 – Ausnahme für Kleinst- und Kleinunternehmen
**Status:** ⚠️ bedingt anwendbar — derzeit: Art. 19 Ausnahme gilt; zukünftig: Trigger bei Community-Features
**Inhalt:** Der gesamte Abschnitt 3 (Art. 19–28) gilt **nicht** für Kleinst-/Kleinunternehmen (außer Art. 24 Abs. 3).
**Aktueller Stand:** AustroFit ist kein Online-Plattform-Betreiber (keine öffentliche UGC-Verbreitung) → Abschnitt 3 ohnehin nicht anwendbar.
**Trigger:** Sobald Leaderboard (REQ-P-025), Community-Feed (REQ-P-046) oder ähnliche öffentliche UGC-Features live gehen → wird AustroFit zur Online-Plattform → Art. 19 Ausnahme greift als Kleinstunternehmen, ABER Art. 24 Abs. 3 wird aktiv.

### Art. 20 – Internes Beschwerdemanagementsystem
**Status:** ❌ nicht anwendbar (Art. 19 Ausnahme + aktuell keine Online-Plattform)
**Trigger für neue Features:** Gilt bei Community-Features, aber als Kleinstunternehmen durch Art. 19 ausgenommen.

### Art. 21 – Außergerichtliche Streitbeilegung
**Status:** ❌ nicht anwendbar (Art. 19 Ausnahme)

### Art. 22 – Vertrauenswürdige Hinweisgeber
**Status:** ❌ nicht anwendbar (Art. 19 Ausnahme)

### Art. 23 – Maßnahmen gegen missbräuchliche Verwendung
**Status:** ❌ nicht anwendbar (Art. 19 Ausnahme)
**Hinweis:** Das inhaltliche Prinzip (Nutzer bei wiederholtem schwerem Missbrauch sperren) ist trotzdem Best Practice und durch AGB absicherbar.

### Art. 24 – Transparenzberichtspflichten Online-Plattformen
**Status:** ⚠️ Art. 24 Abs. 3 — bedingt anwendbar
**Art. 24 Abs. 3:** Anbieter von Online-Plattformen müssen dem Koordinator für digitale Dienste oder der Kommission auf **Anfrage** die monatliche Durchschnitts-Nutzerzahl melden. Keine aktive Veröffentlichungspflicht solange Kleinstunternehmen.
**AustroFit-Umsetzung:** Reaktiv – erst bei behördlicher Anfrage. Daten liegen in Directus (`directus_users`-Tabelle, aktive Sessions) vor.

### Art. 25 – Gestaltung und Organisation der Online-Schnittstelle (Dark Patterns)
**Status:** ❌ formal nicht anwendbar (Art. 19 Ausnahme); inhaltlich trotzdem beachten
**Inhalt:** Online-Plattformen dürfen Nutzer nicht täuschen, manipulieren oder in freier Entscheidung beeinträchtigen (Dark Patterns verboten).
**AustroFit-Hinweis:** Auch wenn Art. 25 formal durch Art. 19 ausgenommen ist, gilt das inhaltliche Verbot über **UWG § 1** (unlautere Geschäftspraktiken) und **DSGVO Art. 7** (Einwilligung muss freiwillig sein). Consent-Dialog und Opt-Out-Flows müssen Dark-Pattern-frei sein ✅ (Consent-Banner bereits konform gestaltet).

### Art. 26 – Werbung auf Online-Plattformen
**Status:** ❌ nicht anwendbar (Art. 19 Ausnahme; zudem aktuell keine Online-Plattform)
**Hinweis:** Affiliate-Kennzeichnung trotzdem erforderlich per UWG/ECG (separate compliance_ref: uwg-affiliate-kennzeichnung).

### Art. 27 – Transparenz der Empfehlungssysteme
**Status:** ❌ nicht anwendbar (Art. 19 Ausnahme)
**Hinweis:** AustroFit hat kein algorithmisches Empfehlungssystem im DSA-Sinne. Gamification-Logik (Punkte, Levels) ist deterministisch und kein Empfehlungssystem.

### Art. 28 – Online-Schutz Minderjähriger
**Status:** ❌ nicht anwendbar (Art. 19 Ausnahme)
**Hinweis:** AustroFit schließt Minderjährige im Onboarding aus (Aktivitätsgruppe, Nutzungsbedingungen). Kein Profiling-basiertes Werbeausliefern an Minderjährige.

---

### Abschnitt 4: Online-Plattformen mit Fernabsatzverträgen (Art. 29–32)

### Art. 29–32
**Status:** ❌ nicht anwendbar
AustroFit ermöglicht keine Fernabsatzverträge zwischen Verbrauchern und Unternehmern (keine Marketplace-Funktion). Partner-Rewards sind keine Fernabsatzverträge im Rechtssinne.

---

### Abschnitt 5: Very Large Online Platforms / Search Engines (Art. 33–58)

### Art. 33–58
**Status:** ❌ nicht anwendbar
Schwellenwert: 45 Mio aktive Nutzer/Monat in der EU. Nicht relevant.

---

## Kapitel IV – Durchsetzung

### Art. 49 – Zuständige Behörde
**Status:** 📋 referenz
**Österreichische Behörde:** KommAustria / RTR-GmbH ist Koordinator für digitale Dienste in Österreich seit 17.02.2024.

### Art. 52 – Sanktionen
**Status:** 📋 referenz
Bußgelder bis **6 % des weltweiten Jahresumsatzes** bei Verstößen gegen DSA-Pflichten.
Für unrichtige Informationen/Verweigerung von Auskünften: bis 1 % Jahresumsatz.
Zwangsgeld: bis 5 % des durchschnittlichen Tagesumsatzes.

### Art. 53 – Beschwerderecht
**Status:** 📋 referenz
Nutzer können beim Koordinator für digitale Dienste (KommAustria/RTR) Beschwerde gegen AustroFit einlegen.

---

## Zusammenfassung: Offene Anforderungen

| Artikel | Anforderung | Status | Priorität |
|---|---|---|---|
| Art. 14 | AGB mit DSA-Inhaltsmoderationsregeln | ❌ open | P1 (bereits Go-Live-Blocker) |
| Art. 16 | Meldeverfahren für rechtswidrige Inhalte | ❌ open | P1 (vor Go-Live) |
| Art. 17 | Begründungspflicht bei Konto-Sperrung | ⚠️ partial | P2 (vor Account-Suspension-Feature) |
| Art. 18 | Straftaten-Meldeprozess dokumentieren | ⚠️ partial | P2 (vor Community-Launch) |
| Art. 24 Abs. 3 | Nutzerzahl auf Behördenanfrage | ✅ reaktiv | kein aktiver Aufwand |

**Bereits compliant:**
- Art. 11: Kontaktstelle Behörden (kontakt@austrofit.at + KommAustria im Impressum) ✅
- Art. 12: Kontaktstelle Nutzer (E-Mail) ✅
- Art. 8: Keine Überwachungspflicht (kein aktiver Aufwand) ✅
- Art. 15: Transparenzbericht ausgenommen (Kleinstunternehmen) ✅

---

## Trigger für Compliance-Updates

| Ereignis | DSA-Konsequenz |
|---|---|
| **Leaderboard live** (REQ-P-025) | AustroFit → Online-Plattform; Art. 19 Ausnahme gilt weiter; Art. 24 Abs. 3 aktiv |
| **Community-Feed** (REQ-P-046) | Wie Leaderboard + Art. 18 (Straftaten) relevanter |
| **Wachstum auf > 50 MA / > 10 Mio EUR** | Verlust Kleinstunternehmen-Status → Art. 15, 20–24 werden anwendbar (12 Monate Übergangsfrist) |
| **> 45 Mio aktive Nutzer/Monat** | VLOP-Status → Art. 33+ anwendbar (Risikobewertung, externe Audits) |
