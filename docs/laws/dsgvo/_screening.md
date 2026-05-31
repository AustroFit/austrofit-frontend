---
law: DSGVO
title: Datenschutz-Grundverordnung
rechtsgrundlage: Verordnung (EU) 2016/679
source_ref: "OJ L 119, 4.5.2016; CELEX:32016R0679"
source_date: 2016-04-27
source_url: https://eur-lex.europa.eu/eli/reg/2016/679/oj?locale=de
screened_by: "AI-assisted (Claude Sonnet), bestätigt durch: [Name + Datum]"
screened_date: 2026-05-22
last_reviewed: 2026-05-22
version: "1.0-pending-review"
---

# DSGVO – Artikel-Screening (AustroFit)

## Screening-Legende
- `✅ anwendbar` – Direkte Pflichten für AustroFit als Verantwortlicher
- `⚠️ bedingt` – Nur unter bestimmten Bedingungen / Trigger-Events
- `❌ nicht anwendbar` – Mit Begründung; Trigger für künftige Relevanz dokumentiert
- `📋 referenz` – Kein eigenständiger Pflichtenartikel, Definitionen/Verfahren

---

## Kapitel I – Allgemeine Bestimmungen (Art. 1–4)

### Art. 1 – Gegenstand und Ziele
**Status:** 📋 referenz  
**compliance_ref:** —  
**Kurzinhalt:** Definiert Schutzzweck (Grundrechte natürlicher Personen) und Anwendungsziel (freier Datenverkehr).  
**AustroFit-Relevanz:** Zweckartikel. Bestätigt: AustroFit als App, die personenbezogene Daten verarbeitet, fällt vollständig unter die DSGVO.  
**Trigger für neue Features:** —  
**Volltext-Datei:** —

### Art. 2 – Sachlicher Anwendungsbereich
**Status:** 📋 referenz  
**compliance_ref:** —  
**Kurzinhalt:** DSGVO gilt für ganz oder teilweise automatisierte Verarbeitung personenbezogener Daten. Ausnahmen: nationale Sicherheit, persönliche/familiäre Tätigkeiten, Strafverfolgungsbehörden.  
**AustroFit-Relevanz:** Vollständig anwendbar. AustroFit verarbeitet automatisiert (Schritte, Quizze, Profile). Keine der Ausnahmen greift.  
**Trigger für neue Features:** —  
**Volltext-Datei:** —

### Art. 3 – Räumlicher Anwendungsbereich
**Status:** 📋 referenz  
**compliance_ref:** —  
**Kurzinhalt:** Gilt für Verantwortliche mit Niederlassung in der EU sowie für Nicht-EU-Anbieter, die EU-Nutzern Dienste anbieten oder deren Verhalten beobachten.  
**AustroFit-Relevanz:** Anwendbar (Wien als Niederlassung geplant). Zusätzlich: Alle eingesetzten Drittanbieter ohne EU-Niederlassung (z.B. US-Server) müssen DSGVO einhalten.  
**Trigger für neue Features:** —  
**Volltext-Datei:** —

### Art. 4 – Begriffsbestimmungen
**Status:** 📋 referenz  
**compliance_ref:** —  
**Kurzinhalt:** Definiert 26 Begriffe: personenbezogene Daten, Verarbeitung, Pseudonymisierung, Verantwortlicher, Auftragsverarbeiter, Einwilligung, Datenpanne, Gesundheitsdaten (Nr. 15), biometrische Daten, u.a.  
**AustroFit-Relevanz:** Gesundheitsdaten (Nr. 15): Schritte, Workouts, Aktivitätsgruppe fallen darunter → Art. 9-Pflichten. Profiling (Nr. 4): Fraud-Detection-Score ist Profiling → Art. 22 prüfen.  
**Trigger für neue Features:** Bei jedem neuen Datentyp prüfen ob er unter eine der 26 Definitionen fällt.  
**Volltext-Datei:** —

---

## Kapitel II – Grundsätze (Art. 5–11)

### Art. 5 – Grundsätze für die Verarbeitung
**Status:** ✅ anwendbar  
**compliance_ref:** dsgvo-art25-privacy-by-design (teilweise)  
**Kurzinhalt:** 7 Grundsätze: Rechtmäßigkeit/Transparenz, Zweckbindung, Datenminimierung, Richtigkeit, Speicherbegrenzung, Integrität/Vertraulichkeit, Rechenschaftspflicht. Art. 5 Abs. 2: Nachweis liegt beim Verantwortlichen.  
**AustroFit-Relevanz:** Alle 7 Grundsätze direkt anwendbar. Speziell: Datenminimierung (keine Standortdaten ✅), Speicherbegrenzung (Löschkonzept teilweise ✅), Rechenschaftspflicht (diese Dokumentation!).  
**Trigger für neue Features:** Jedes neue Feature auf alle 7 Grundsätze prüfen, bevor Implementation.  
**Volltext-Datei:** art-05.md

### Art. 6 – Rechtmäßigkeit der Verarbeitung
**Status:** ✅ anwendbar  
**compliance_ref:** dsgvo-art13-dse  
**Kurzinhalt:** Abschließende Liste der Rechtsgrundlagen: Einwilligung (a), Vertrag (b), rechtliche Verpflichtung (c), lebenswichtige Interessen (d), öffentliches Interesse (e), berechtigte Interessen (f).  
**AustroFit-Relevanz:** AustroFit nutzt: (a) Einwilligung für Analytics/Health-Daten, (b) Vertrag für Account-Verwaltung, (f) berechtigte Interessen für Affiliate-Tracking-Hinweis. Alle Rechtsgrundlagen müssen in DSE dokumentiert sein (✅ Stand Mai 2026).  
**Trigger für neue Features:** Jedes neue Verarbeitungsziel braucht vor Implementation eine dokumentierte Rechtsgrundlage.  
**Volltext-Datei:** art-06.md

### Art. 7 – Bedingungen für die Einwilligung
**Status:** ✅ anwendbar  
**compliance_ref:** dsgvo-art9-consent  
**Kurzinhalt:** Einwilligung muss nachweisbar, klar abgegrenzt, verständlich und frei widerrufbar sein. Kopplungsverbot: Einwilligung darf nicht Bedingung für Vertragserfüllung sein, wenn nicht erforderlich.  
**AustroFit-Relevanz:** Betrifft Analytics-Consent (✅ implementiert), Health-Daten-Consent (⚠️ partial – separater Art. 9-Consent fehlt), zukünftige Marketing-Einwilligungen.  
**Trigger für neue Features:** Jede neue Einwilligungsabfrage gegen Art. 7 prüfen (nachweisbar, granular, widerrufbar).  
**Volltext-Datei:** art-07.md

### Art. 8 – Einwilligung von Kindern (Informationsgesellschaft)
**Status:** ⚠️ bedingt  
**compliance_ref:** —  
**Kurzinhalt:** Bei Diensten der Informationsgesellschaft, die Kindern direkt angeboten werden: Einwilligung erst ab 16 Jahren selbständig; darunter nur mit Zustimmung der Erziehungsberechtigten (Mitgliedstaaten können bis 13 Jahre absenken).  
**AustroFit-Relevanz:** AustroFit schließt Kinder aktuell nicht explizit aus. Wenn Kinder unter 14 sich registrieren könnten, wäre elterliche Einwilligung nötig. Österreich: Mindestalter 14 Jahre (§ 4 Abs. 4 DSG).  
**Trigger für neue Features:** Altersverifikation / Jugendschutz sobald Zielgruppe explizit Kinder einschließt oder School-/Family-Features geplant.  
**Volltext-Datei:** —

### Art. 9 – Verarbeitung besonderer Kategorien (Gesundheitsdaten)
**Status:** ✅ anwendbar  
**compliance_ref:** dsgvo-art9-consent  
**Kurzinhalt:** Verarbeitung von Gesundheitsdaten grundsätzlich verboten außer bei expliziter Einwilligung (lit. a), Gesundheitsversorgung (lit. h), öffentlichem Gesundheitsinteresse (lit. i), u.a.  
**AustroFit-Relevanz:** KRITISCH. Schritte + Workouts via Health Connect + Aktivitätsgruppe (chronic/pregnant) = Gesundheitsdaten. Einzige tragbare Rechtsgrundlage: Art. 9 Abs. 2 lit. a (explizite Einwilligung). Status: partial – separater Consent-Schritt fehlt.  
**Trigger für neue Features:** Jeder neue Datentyp der körperliche/geistige Gesundheit betrifft löst Art. 9 aus.  
**Volltext-Datei:** art-09.md

### Art. 10 – Strafrechtliche Verurteilungen
**Status:** ❌ nicht anwendbar  
**compliance_ref:** —  
**Kurzinhalt:** Verarbeitung personenbezogener Daten über strafrechtliche Verurteilungen nur unter behördlicher Aufsicht oder gesetzlicher Grundlage.  
**AustroFit-Relevanz:** AustroFit verarbeitet keine strafrechtlichen Daten.  
**Trigger für neue Features:** Background-Checks für Partner-Onboarding (KYC) – dann prüfen ob relevante Daten verarbeitet werden.  
**Volltext-Datei:** —

### Art. 11 – Keine Identifizierung erforderlich
**Status:** ⚠️ bedingt  
**compliance_ref:** dsgvo-art25-privacy-by-design  
**Kurzinhalt:** Wenn der Zweck keine Identifizierung erfordert, ist der Verantwortliche nicht verpflichtet, zusätzliche Identifikationsdaten zu erheben. Betroffenenrechte (Art. 15–20) können eingeschränkt werden.  
**AustroFit-Relevanz:** Relevant für anonymous_id im Quiz-Flow (datenschutzfreundliches Design ✅). Wenn Nutzer anonym Quiz absolviert, keine Pflicht zur Identifizierung.  
**Trigger für neue Features:** Anonymisierte Nutzungsstatistiken, anonyme Community-Features.  
**Volltext-Datei:** —

---

## Kapitel III – Rechte der betroffenen Person (Art. 12–23)

### Art. 12 – Transparente Information und Modalitäten
**Status:** ✅ anwendbar  
**compliance_ref:** dsgvo-art13-dse  
**Kurzinhalt:** Informationen müssen präzise, verständlich, leicht zugänglich, in klarer Sprache bereitgestellt werden. Frist zur Beantwortung von Anfragen: 1 Monat (verlängerbar auf 3). Unentgeltlich.  
**AustroFit-Relevanz:** Betrifft Format und Erreichbarkeit der DSE sowie Reaktionszeiten auf Nutzeranfragen. Kontakt: kontakt@austrofit.at muss auf Datenschutzanfragen reagieren.  
**Trigger für neue Features:** Neue Verarbeitungszwecke → DSE update + Nutzer informieren.  
**Volltext-Datei:** —

### Art. 13 – Informationspflicht bei direkter Erhebung
**Status:** ✅ anwendbar  
**compliance_ref:** dsgvo-art13-dse  
**Kurzinhalt:** Bei Datenerhebung direkt vom Nutzer: Verantwortlicher, Zwecke, Rechtsgrundlage, Empfänger, Speicherdauer, Betroffenenrechte, Beschwerderecht, automatisierte Entscheidungen müssen zum Zeitpunkt der Erhebung mitgeteilt werden.  
**AustroFit-Relevanz:** Registrierung, Onboarding, Health Connect Permission = Erhebungszeitpunkte → vollständige Art. 13-Informationen erforderlich. Status: compliant (DSE Mai 2026 ✅).  
**Trigger für neue Features:** Jeder neue Schritt der Daten erhebt (z.B. neue Felder im Profil, neue Integrationen).  
**Volltext-Datei:** —

### Art. 14 – Informationspflicht bei indirekter Erhebung
**Status:** ✅ anwendbar  
**compliance_ref:** dsgvo-art13-dse  
**Kurzinhalt:** Werden Daten nicht direkt beim Nutzer erhoben (z.B. von Dritten oder aus anderen Quellen), Informationspflicht innerhalb 1 Monat oder bei erster Kommunikation.  
**AustroFit-Relevanz:** Health Connect überträgt Daten die von anderen Apps erzeugt wurden → Art. 14 anwendbar. Information erfolgt über DSE und Health Connect Permission Screen.  
**Trigger für neue Features:** Neue Datenquellen aus dem Phone-Ökosystem (z.B. Schlaf, GPS, Herzfrequenz von Wearables).  
**Volltext-Datei:** —

### Art. 15 – Auskunftsrecht
**Status:** ✅ anwendbar  
**compliance_ref:** dsgvo-art13-dse  
**Kurzinhalt:** Nutzer hat Recht auf Bestätigung ob Daten verarbeitet werden, Auskunft über alle Verarbeitungsdetails und eine Datenkopie. Beantwortung: 1 Monat.  
**AustroFit-Relevanz:** Muss implementiert werden. Aktuell kein Self-Service-Auskunftsportal → Anfragen per E-Mail (kontakt@austrofit.at). Datenkopie: Phase 2 (Datenexport-Funktion).  
**Trigger für neue Features:** Nutzerzahl wächst → Self-Service-Portal für Auskunft empfohlen.  
**Volltext-Datei:** —

### Art. 16 – Recht auf Berichtigung
**Status:** ✅ anwendbar  
**compliance_ref:** —  
**Kurzinhalt:** Nutzer kann unrichtige Daten berichtigen lassen und unvollständige Daten vervollständigen.  
**AustroFit-Relevanz:** Profil-Editing im Dashboard deckt dies ab für Name, E-Mail, Aktivitätsgruppe. Status: zu verifizieren ob alle Felder editierbar sind.  
**Trigger für neue Features:** Neue Profilfelder die nicht editierbar sind.  
**Volltext-Datei:** —

### Art. 17 – Recht auf Löschung (Recht auf Vergessenwerden)
**Status:** ✅ anwendbar  
**compliance_ref:** dsgvo-art17-loeschung  
**Kurzinhalt:** Nutzer kann Löschung verlangen wenn Daten nicht mehr nötig, Einwilligung widerrufen, Widerspruch eingelegt oder Verarbeitung unrechtmäßig. Ausnahmen: rechtliche Verpflichtung, öffentliches Interesse.  
**AustroFit-Relevanz:** Account-Löschung mit Kaskaden-Löschung implementiert ✅ (src/routes/api/profile/delete/+server.ts). Datenexport (Art. 20) als Phase-2-Arbeit dokumentiert.  
**Trigger für neue Features:** Neue Datentypen müssen in Löschlogik eingebunden werden.  
**Volltext-Datei:** art-17.md

### Art. 18 – Recht auf Einschränkung der Verarbeitung
**Status:** ✅ anwendbar  
**compliance_ref:** —  
**Kurzinhalt:** Nutzer kann Einschränkung verlangen bei Richtigkeitsbestreitung, unrechtmäßiger Verarbeitung, wenn er Daten für Rechtsansprüche braucht, oder während Widerspruchsprüfung.  
**AustroFit-Relevanz:** Noch nicht implementiert. In MVP-Phase manuell über kontakt@austrofit.at handhabbar.  
**Trigger für neue Features:** Skalierung → Self-Service-Portal.  
**Volltext-Datei:** —

### Art. 19 – Mitteilungspflicht nach Berichtigung/Löschung
**Status:** ✅ anwendbar  
**compliance_ref:** —  
**Kurzinhalt:** Bei Berichtigung, Löschung oder Einschränkung muss der Verantwortliche alle Empfänger informieren, denen die Daten offengelegt wurden.  
**AustroFit-Relevanz:** Relevant wenn Nutzerdaten an Dritte weitergegeben wurden (aktuell: PostHog → Opt-out stoppt neue Daten; Löschung in PostHog manuell zu koordinieren).  
**Trigger für neue Features:** Datenweitergabe an neue Partner.  
**Volltext-Datei:** —

### Art. 20 – Recht auf Datenübertragbarkeit
**Status:** ✅ anwendbar  
**compliance_ref:** dsgvo-art17-loeschung  
**Kurzinhalt:** Nutzer hat Recht, seine Daten in einem strukturierten, gängigen, maschinenlesbaren Format zu erhalten und an anderen Anbieter zu übertragen. Gilt nur für einwilligungsbasierte oder vertragsbasierte Verarbeitung.  
**AustroFit-Relevanz:** Noch nicht implementiert. Als Phase-2-Arbeit dokumentiert. Exportformat: JSON oder CSV der eigenen Aktivitätsdaten, Punkte, Profildata.  
**Trigger für neue Features:** Nutzerzahl > 100 oder erste Nutzerbeschwerden.  
**Volltext-Datei:** —

### Art. 21 – Widerspruchsrecht
**Status:** ✅ anwendbar  
**compliance_ref:** —  
**Kurzinhalt:** Nutzer kann Verarbeitung widersprechen wenn auf Art. 6 Abs. 1 lit. e oder f gestützt (berechtigte Interessen / öffentliches Interesse). Bei Direktwerbung: absolutes Widerspruchsrecht.  
**AustroFit-Relevanz:** Betrifft AWIN/Affiliate-Tracking (Art. 6 Abs. 1 lit. f). Nutzer können Affiliate-Tracking widersprechen → in DSE dokumentiert ✅. Analytics: Consent-basiert → Art. 21 nicht primär relevant, aber Consent-Widerruf hat gleiche Wirkung.  
**Trigger für neue Features:** Jede neue berechtigte-Interessen-basierte Verarbeitung.  
**Volltext-Datei:** —

### Art. 22 – Automatisierte Entscheidungen / Profiling
**Status:** ⚠️ bedingt  
**compliance_ref:** ai-act-risikoklassifikation  
**Kurzinhalt:** Nutzer hat Recht, keiner ausschließlich automatisierten Entscheidung unterworfen zu werden, die rechtliche oder erhebliche Auswirkungen hat. Ausnahmen: Einwilligung, Vertragsnecessität, gesetzliche Erlaubnis.  
**AustroFit-Relevanz:** Aktuell nicht anwendbar (kein automatisiertes Sperren). TRIGGER: Isolation-Forest Fraud-Detection (Phase 2) der automatisch Nutzer sperrt → dann Art. 22 anwendbar. Lösung: Mensch-in-der-Schleife vor Sperre.  
**Trigger für neue Features:** Jede automatisierte Entscheidung die Nutzerzugang, Punkte oder Services beeinflusst ohne menschliche Prüfung.  
**Volltext-Datei:** art-22.md (zu erstellen, bei Phase-2-Implementation)

### Art. 23 – Beschränkungen
**Status:** ❌ nicht anwendbar  
**compliance_ref:** —  
**Kurzinhalt:** Mitgliedstaaten können Betroffenenrechte einschränken für nationale Sicherheit, Strafverfolgung, Steuern, öffentliche Gesundheit, etc.  
**AustroFit-Relevanz:** AustroFit ist kein staatlicher Akteur. Dieser Artikel regelt staatliche Einschränkungen der Betroffenenrechte.  
**Trigger für neue Features:** —  
**Volltext-Datei:** —

---

## Kapitel IV – Verantwortlicher und Auftragsverarbeiter (Art. 24–43)

### Art. 24 – Verantwortung des Verantwortlichen
**Status:** ✅ anwendbar  
**compliance_ref:** dsgvo-art32-tom  
**Kurzinhalt:** Verantwortlicher muss geeignete TOM umsetzen, deren Wirksamkeit regelmäßig prüfen und Nachweis der DSGVO-Konformität erbringen können (Accountability-Prinzip).  
**AustroFit-Relevanz:** Diese gesamte Dokumentationsstruktur (compliance.yaml, _screening.md, art-XX.md) ist der Nachweis nach Art. 24. TOM-Dokument: docs/tom.yaml.  
**Trigger für neue Features:** Bei jeder größeren Plattformänderung TOM-Review.  
**Volltext-Datei:** —

### Art. 25 – Privacy by Design / Privacy by Default
**Status:** ✅ anwendbar  
**compliance_ref:** dsgvo-art25-privacy-by-design  
**Kurzinhalt:** Datenschutz muss bereits bei Systemgestaltung (by design) und durch datenschutzfreundliche Voreinstellungen (by default) berücksichtigt werden. Datenminimierung als technisches Gestaltungsziel.  
**AustroFit-Relevanz:** Status: partial. Positiv: kein Standort-Tracking, anonymous_id für Quiz, Analytics opt-out by default. Offen: JWT in localStorage muss in DPIA begründet sein.  
**Trigger für neue Features:** Jedes neue Feature vor Design/Coding-Phase auf Art. 25 prüfen (kein Nachbessern nach Implementation).  
**Volltext-Datei:** art-25.md

### Art. 26 – Gemeinsam Verantwortliche
**Status:** ❌ nicht anwendbar  
**compliance_ref:** —  
**Kurzinhalt:** Legen zwei oder mehr Stellen gemeinsam Zwecke und Mittel fest, sind sie gemeinsam Verantwortliche und müssen ihre Pflichten in einer Vereinbarung regeln.  
**AustroFit-Relevanz:** AustroFit ist alleiniger Verantwortlicher. Auftragsverarbeiter sind keine gemeinsam Verantwortlichen.  
**Trigger für neue Features:** Joint Venture mit Krankenkassen oder Gesundheitsportalen (Phase 3) → dann prüfen.  
**Volltext-Datei:** —

### Art. 27 – Vertreter in der EU
**Status:** ❌ nicht anwendbar  
**compliance_ref:** —  
**Kurzinhalt:** Nicht-EU-Verantwortliche die EU-Personen Dienste anbieten müssen einen schriftlichen EU-Vertreter benennen.  
**AustroFit-Relevanz:** AustroFit hat Niederlassung in Wien (EU) → kein EU-Vertreter erforderlich.  
**Trigger für neue Features:** Wenn AustroFit seinen Sitz außerhalb der EU verlagert.  
**Volltext-Datei:** —

### Art. 28 – Auftragsverarbeiter (AVV)
**Status:** ✅ anwendbar  
**compliance_ref:** dsgvo-avv  
**Kurzinhalt:** Auftragsverarbeiter nur mit hinreichenden Garantien. Vertragliche Bindung (AVV) zwingend mit 10 Mindestklauseln: Weisungsgebundenheit, Vertraulichkeit, TOM, Unterauftragsverarbeiter, Unterstützung bei Rechten, Löschung/Rückgabe, Nachweis.  
**AustroFit-Relevanz:** BLOCKEND VOR GO-LIVE: Hetzner-AVV (offen), Vercel Pro/DPA (offen). Erledigt: PostHog EU, AWIN/TradeDoubler. Directus self-hosted: kein AVV nötig.  
**Trigger für neue Features:** Jeder neue Dienstleister der Nutzerdaten verarbeitet → AVV vor Go-Live.  
**Volltext-Datei:** art-28.md

### Art. 29 – Verarbeitung unter Aufsicht
**Status:** ✅ anwendbar  
**compliance_ref:** dsgvo-art32-tom  
**Kurzinhalt:** Auftragsverarbeiter und Beschäftigte dürfen Daten nur auf Weisung des Verantwortlichen verarbeiten.  
**AustroFit-Relevanz:** Relevant für Least-Privilege-Prinzip bei API-Tokens und Zugriffsrechten. Implementiert ✅.  
**Trigger für neue Features:** Neue Mitarbeiter / Freelancer die Datenzugang erhalten.  
**Volltext-Datei:** —

### Art. 30 – Verarbeitungsverzeichnis (VVT)
**Status:** ⚠️ bedingt  
**compliance_ref:** dsgvo-art32-tom  
**Kurzinhalt:** Verantwortliche müssen Verzeichnis aller Verarbeitungstätigkeiten führen. Ausnahme: Unternehmen mit < 250 MA wenn Verarbeitung kein hohes Risiko birgt und nicht Gesundheitsdaten betrifft.  
**AustroFit-Relevanz:** WICHTIG: Die Ausnahme für < 250 MA gilt NICHT wenn besondere Kategorien (Art. 9) verarbeitet werden. AustroFit verarbeitet Gesundheitsdaten → VVT ist PFLICHT. Noch nicht erstellt → vor Go-Live.  
**Trigger für neue Features:** Jede neue Verarbeitungstätigkeit muss ins VVT.  
**Volltext-Datei:** art-30.md

### Art. 31 – Zusammenarbeit mit Aufsichtsbehörden
**Status:** ✅ anwendbar  
**compliance_ref:** dsg-dsb  
**Kurzinhalt:** Verantwortliche müssen mit der Aufsichtsbehörde auf Anfrage zusammenarbeiten.  
**AustroFit-Relevanz:** Zuständige Behörde: Datenschutzbehörde Wien (DSB). Keine aktive Pflicht, aber Reaktionspflicht bei Anfragen.  
**Trigger für neue Features:** —  
**Volltext-Datei:** —

### Art. 32 – Sicherheit der Verarbeitung (TOM)
**Status:** ✅ anwendbar  
**compliance_ref:** dsgvo-art32-tom  
**Kurzinhalt:** Risikoangemessene TOM einschließlich Pseudonymisierung, Verschlüsselung, Vertraulichkeit/Integrität/Verfügbarkeit, Belastbarkeit, Wiederherstellbarkeit, regelmäßige Überprüfung.  
**AustroFit-Relevanz:** TOM-Dokument (docs/tom.yaml) erstellt Mai 2026. Status: partial (Backup-Konzept schriftlich und AVV-Ablage offen). Rate-Limiting, CSP-Headers, HTTPS, CORS, Input-Validierung ✅.  
**Trigger für neue Features:** Jede neue Systemkomponente → TOM-Update.  
**Volltext-Datei:** art-32.md

### Art. 33 – Meldung Datenpanne an Aufsichtsbehörde
**Status:** ✅ anwendbar  
**compliance_ref:** —  
**Kurzinhalt:** Bei Datenschutzverletzung: Meldung an DSB binnen 72 Stunden, außer wenn kein Risiko für Betroffene. Inhalt: Art der Verletzung, Kategorien/Anzahl Betroffene, Kontaktstelle, Folgen, Abhilfemaßnahmen.  
**AustroFit-Relevanz:** Incident-Response-Prozess fehlt noch. Vor Go-Live: einfache SOP (Standard Operating Procedure) erstellen: Erkennung → Bewertung → 72h-Entscheidung → Meldung/Dokumentation.  
**Trigger für neue Features:** —  
**Volltext-Datei:** art-33.md

### Art. 34 – Benachrichtigung betroffener Personen
**Status:** ✅ anwendbar  
**compliance_ref:** —  
**Kurzinhalt:** Bei voraussichtlich hohem Risiko für Betroffene: unverzügliche Benachrichtigung der Nutzer (nicht nur DSB). Ausnahme: Daten waren verschlüsselt oder Risiko wurde beseitigt.  
**AustroFit-Relevanz:** Folgt aus Art. 33-Prozess. Bei Datenpannen mit hohem Risiko: In-App-Benachrichtigung oder E-Mail an betroffene Nutzer.  
**Trigger für neue Features:** —  
**Volltext-Datei:** —

### Art. 35 – Datenschutz-Folgenabschätzung (DPIA)
**Status:** ✅ anwendbar  
**compliance_ref:** dsgvo-art35-dpia  
**Kurzinhalt:** DPIA verpflichtend bei umfangreicher Verarbeitung besonderer Kategorien (Art. 9), systematischer Überwachung, oder wenn DSB-Blacklist zutreffend. Inhalt: Beschreibung, Notwendigkeit, Risiken, Abhilfemaßnahmen.  
**AustroFit-Relevanz:** KRITISCH – OFFEN. Gesundheitsdaten + Fitness-Tracking = klarer DPIA-Pflichtfall. Österreichische DSB-Blacklist (§ 4 DSFA-AV) prüfen. Vor Go-Live oder erstem echten Nutzer zu erstellen.  
**Trigger für neue Features:** Neue umfangreiche Verarbeitung besonderer Datenkategorien, neues Profiling, neue Überwachungsfunktionen.  
**Volltext-Datei:** art-35.md

### Art. 36 – Vorherige Konsultation der Aufsichtsbehörde
**Status:** ⚠️ bedingt  
**compliance_ref:** dsgvo-art35-dpia  
**Kurzinhalt:** Wenn DPIA hohes Risiko ergibt das nicht eingedämmt werden kann: Pflicht zur Konsultation der DSB vor Verarbeitungsbeginn. DSB antwortet innerhalb von 8 Wochen.  
**AustroFit-Relevanz:** Wird relevant falls DPIA (Art. 35) ein unbeherrschbares hohes Risiko ergibt. Erwartet: DPIA-Ergebnis ist handhabbar, Konsultation nicht nötig.  
**Trigger für neue Features:** Wenn DPIA-Ergebnis "hohes Restrisiko ohne Abhilfe".  
**Volltext-Datei:** —

### Art. 37 – Benennung Datenschutzbeauftragter (DSB)
**Status:** ⚠️ bedingt  
**compliance_ref:** dsg-dsb  
**Kurzinhalt:** Pflichtbenennung wenn: Behörde, oder Kerntätigkeit = umfangreiche systematische Überwachung, oder Kerntätigkeit = umfangreiche Verarbeitung besonderer Kategorien.  
**AustroFit-Relevanz:** Aktuell: Gesundheitsdaten werden verarbeitet, aber AustroFit ist kein Gesundheitsunternehmen per se (Wellness-App). Kerntätigkeit = Prävention/Motivation, nicht Gesundheitsdatenverarbeitung. → DSB aktuell nicht zwingend, aber empfohlen (externer DSB-Dienstleister). Bei > 1.000 Nutzern Lage neu bewerten.  
**Trigger für neue Features:** Expansion der Gesundheitsdatenverarbeitung (Diagnostik, medizinische Messungen), Schwellenwert-Überschreitung.  
**Volltext-Datei:** —

### Art. 38–39 – Stellung und Aufgaben des DSB
**Status:** ⚠️ bedingt  
**compliance_ref:** dsg-dsb  
**Kurzinhalt:** DSB muss unabhängig sein, frühzeitig eingebunden werden, Beratung bei DPIA leisten, mit DSB-Behörde zusammenarbeiten. Aufgaben: Überwachung, Schulung, Beratung, Anlaufstelle.  
**AustroFit-Relevanz:** Falls DSB benannt wird (extern): Diese Artikel definieren die Aufgaben. Relevant für Dienstleistungsvertrag mit externem DSB.  
**Trigger für neue Features:** Siehe Art. 37.  
**Volltext-Datei:** —

### Art. 40–41 – Verhaltensregeln
**Status:** ❌ nicht anwendbar (aktuell)  
**compliance_ref:** —  
**Kurzinhalt:** Branchenverbände können Verhaltensregeln ausarbeiten, die von der DSB genehmigt werden. Überwachung durch akkreditierte Stellen.  
**AustroFit-Relevanz:** Noch keine branchenspezifischen Verhaltensregeln für Health-Apps in Österreich. Wenn verfügbar: Einhaltung als Art. 24 Nachweis nutzbar.  
**Trigger für neue Features:** Verfügbarkeit von Digital-Health-App Verhaltensregeln in AT/EU.  
**Volltext-Datei:** —

### Art. 42–43 – Zertifizierung
**Status:** ❌ nicht anwendbar (aktuell)  
**compliance_ref:** iec82304-2-konformitaet  
**Kurzinhalt:** Freiwillige Datenschutz-Zertifizierungsverfahren (EU-Datenschutzsiegel). Max. 3 Jahre Gültigkeit. Mindert nicht Verantwortlichkeit des Verantwortlichen.  
**AustroFit-Relevanz:** Deferred. Relevant für B2G-Kooperationen und DiGA-AT-Bewerbung. Kombination mit IEC 82304-2 Quality Label strategisch sinnvoll.  
**Trigger für neue Features:** B2G-Kooperations-Angebote, DiGA-AT-Pilotprogramm.  
**Volltext-Datei:** —

---

## Kapitel V – Drittlandübermittlungen (Art. 44–50)

### Art. 44 – Allgemeine Grundsätze
**Status:** ✅ anwendbar  
**compliance_ref:** dsgvo-avv  
**Kurzinhalt:** Übermittlung an Drittländer nur wenn Bedingungen der Art. 45–49 eingehalten. Gilt auch für Weiterübermittlung.  
**AustroFit-Relevanz:** Vercel (US): Serverless Functions verarbeiten Anfragen aus der EU auf US-Infrastruktur. Google OAuth (US). Beide benötigen Rechtsgrundlage für Drittlandübermittlung.  
**Trigger für neue Features:** Jeder neue US/Nicht-EU-Dienstleister.  
**Volltext-Datei:** —

### Art. 45 – Angemessenheitsbeschluss
**Status:** ✅ anwendbar  
**compliance_ref:** dsgvo-avv  
**Kurzinhalt:** Übermittlung ohne besondere Genehmigung wenn Kommission angemessenes Schutzniveau festgestellt hat (z.B. EU-US Data Privacy Framework für US-Unternehmen).  
**AustroFit-Relevanz:** Vercel und Google sind unter EU-US Data Privacy Framework (DPF) zertifiziert → Drittlandübermittlung auf dieser Basis möglich. Status DPF prüfen (Vercel: ja; Google: ja). In DSE dokumentieren.  
**Trigger für neue Features:** Änderungen am DPF (wie bei Privacy Shield 2020).  
**Volltext-Datei:** —

### Art. 46 – Geeignete Garantien (SCC)
**Status:** ⚠️ bedingt  
**compliance_ref:** dsgvo-avv  
**Kurzinhalt:** Ohne Angemessenheitsbeschluss: geeignete Garantien erforderlich, z.B. Standardvertragsklauseln (SCC), verbindliche interne Vorschriften, genehmigte Verhaltensregeln.  
**AustroFit-Relevanz:** Fallback wenn DPF nicht greift. Vercel und Google referenzieren SCC in ihren DPAs als zusätzliche Garantie.  
**Trigger für neue Features:** DPF-Invalidierung (politisches Risiko), neue US-Dienstleister ohne DPF.  
**Volltext-Datei:** —

### Art. 47–50 – BCR, unzulässige Übermittlungen, Ausnahmen, Zusammenarbeit
**Status:** ❌ nicht anwendbar  
**compliance_ref:** —  
**Kurzinhalt:** Verbindliche Unternehmensregeln (BCR) für Unternehmensgruppen; Verbot unionsrechtswidriger Übermittlungen; Ausnahmen für Einzelfälle; internationale Behördenzusammenarbeit.  
**AustroFit-Relevanz:** Keine Unternehmensgruppe, keine besonderen Ausnahmefälle.  
**Trigger für neue Features:** Unternehmensgruppe, M&A.  
**Volltext-Datei:** —

---

## Kapitel VI – Aufsichtsbehörden (Art. 51–59)

### Art. 51–59 – Aufsichtsbehörde allgemein
**Status:** 📋 referenz  
**compliance_ref:** dsg-dsb  
**Kurzinhalt:** Regelungen zur Errichtung, Unabhängigkeit, Zuständigkeit, Aufgaben und Befugnissen der nationalen Aufsichtsbehörden.  
**AustroFit-Relevanz:** Zuständige Aufsichtsbehörde für AustroFit: Datenschutzbehörde Wien (Österreich). DSB-Kontaktstelle im Impressum ✅. Bußgelder bis 20 Mio EUR / 4% Jahresumsatz (Art. 83).  
**Trigger für neue Features:** —  
**Volltext-Datei:** —

---

## Kapitel VII – Zusammenarbeit und Kohärenz (Art. 60–76)

### Art. 60–76 – Kooperationsverfahren
**Status:** ❌ nicht anwendbar  
**compliance_ref:** —  
**Kurzinhalt:** Regeln für Zusammenarbeit zwischen Aufsichtsbehörden verschiedener Mitgliedstaaten (One-Stop-Shop), Kohärenzverfahren, Europäischer Datenschutzausschuss (EDSA).  
**AustroFit-Relevanz:** Nicht direkt anwendbar (kein grenzüberschreitender Betrieb im Sinne von Mehrstaaten-Niederlassungen). Wird relevant bei EU-Expansion mit Niederlassung in anderen Mitgliedstaaten.  
**Trigger für neue Features:** EU-Expansion, Niederlassung in anderem Mitgliedstaat.  
**Volltext-Datei:** —

---

## Kapitel VIII – Rechtsbehelfe, Haftung, Sanktionen (Art. 77–84)

### Art. 77 – Beschwerderecht bei Aufsichtsbehörde
**Status:** 📋 referenz  
**compliance_ref:** dsg-dsb  
**Kurzinhalt:** Jede betroffene Person kann bei der Aufsichtsbehörde des Mitgliedstaats ihres Aufenthalts Beschwerde einlegen.  
**AustroFit-Relevanz:** AustroFit muss Nutzer über Beschwerderecht informieren (in DSE ✅) und auf Beschwerden reagieren. Kontaktpunkt: DSB Wien.  
**Trigger für neue Features:** —  
**Volltext-Datei:** —

### Art. 82 – Haftung und Schadenersatz
**Status:** ✅ anwendbar  
**compliance_ref:** dsgvo-art32-tom  
**Kurzinhalt:** Verantwortlicher haftet für materiellen und immateriellen Schaden durch verordnungswidrige Verarbeitung. Befreiung nur wenn nachgewiesen, dass kein Verschulden vorliegt.  
**AustroFit-Relevanz:** Direkte Haftungsgrundlage. Befreiung durch: vollständige DSGVO-Konformität (TOM, AVV, DPIA, Consents). Diese Dokumentation dient als Haftungsschutz-Nachweis.  
**Trigger für neue Features:** —  
**Volltext-Datei:** —

### Art. 83 – Geldbußen
**Status:** 📋 referenz  
**compliance_ref:** —  
**Kurzinhalt:** Bußgeldrahmen: Bis 10 Mio EUR / 2% (Art. 83 Abs. 4) für TOM, AVV, DPIA, Zertifizierung. Bis 20 Mio EUR / 4% (Art. 83 Abs. 5) für Grundsätze, Betroffenenrechte, Drittlandübermittlung, Einwilligung.  
**AustroFit-Relevanz:** Kritische Risiken für AustroFit: Fehlende AVV (Hetzner, Vercel) = Art. 83 Abs. 4. Fehlendes Art. 9-Consent = Art. 83 Abs. 5. Fehlende DPIA = Art. 83 Abs. 4.  
**Trigger für neue Features:** —  
**Volltext-Datei:** —

### Art. 84 – Sonstige Sanktionen
**Status:** 📋 referenz  
**compliance_ref:** —  
**Kurzinhalt:** Mitgliedstaaten können weitere Sanktionen für Verstöße festlegen, die nicht unter Art. 83 fallen.  
**AustroFit-Relevanz:** Österreich: DSG ergänzt mit nationalen Strafbestimmungen.  
**Trigger für neue Features:** —  
**Volltext-Datei:** —

---

## Kapitel IX – Besondere Verarbeitungssituationen (Art. 85–91)

### Art. 85 – Meinungsfreiheit / Journalismus
**Status:** ❌ nicht anwendbar  
**compliance_ref:** —  
**Kurzinhalt:** Mitgliedstaaten können Ausnahmen für journalistische, wissenschaftliche, künstlerische Zwecke vorsehen.  
**AustroFit-Relevanz:** Nicht anwendbar. Gesundheitsartikel sind redaktioneller Content, kein Journalismus im DSGVO-Sinne.  
**Trigger für neue Features:** —  
**Volltext-Datei:** —

### Art. 86–87 – Amtliche Dokumente / Nationale Kennziffer
**Status:** ❌ nicht anwendbar  
**compliance_ref:** —  
**Kurzinhalt:** Zugang zu amtlichen Dokumenten; Verarbeitung nationaler Kennziffern (z.B. Sozialversicherungsnummer).  
**AustroFit-Relevanz:** AustroFit verarbeitet keine amtlichen Dokumente oder Sozialversicherungsnummern.  
**Trigger für neue Features:** Vorsorge-Integration mit SVS/ELGA (Phase 3).  
**Volltext-Datei:** —

### Art. 88 – Beschäftigungskontext
**Status:** ⚠️ bedingt  
**compliance_ref:** —  
**Kurzinhalt:** Mitgliedstaaten können spezifischere Vorschriften für Mitarbeiterdaten festlegen.  
**AustroFit-Relevanz:** Relevant sobald AustroFit Mitarbeiter beschäftigt und deren Daten verarbeitet (E-Mail, Gehalt, Zeiterfassung).  
**Trigger für neue Features:** Erste Mitarbeiter / Freelancer mit Zugangsdaten.  
**Volltext-Datei:** —

### Art. 89 – Wissenschaftliche Forschung / Statistik
**Status:** ⚠️ bedingt  
**compliance_ref:** —  
**Kurzinhalt:** Verarbeitung zu Forschungs-/Statistikzwecken mit besonderen Garantien (Pseudonymisierung). Ausnahmen von bestimmten Betroffenenrechten möglich.  
**AustroFit-Relevanz:** Relevant für Impact-Analytics-API (Phase 2/3): anonymisierte KPI-Pakete (Schritte, Quiz-Scores) für B2G-Partner. Differential Privacy als technische Garantie.  
**Trigger für neue Features:** Export anonymisierter Nutzungsdaten an Krankenkassen/Gesundheitsbehörden.  
**Volltext-Datei:** —

### Art. 90–91 – Berufsgeheimnis / Kirchliche Daten
**Status:** ❌ nicht anwendbar  
**compliance_ref:** —  
**Kurzinhalt:** Berufsgeheimnispflichten; kirchliche Datenschutzregeln.  
**AustroFit-Relevanz:** Nicht anwendbar.  
**Trigger für neue Features:** —  
**Volltext-Datei:** —

---

## Kapitel X–XI – Delegierte Rechtsakte / Schlussbestimmungen (Art. 92–99)

### Art. 92–99
**Status:** 📋 referenz  
**compliance_ref:** —  
**Kurzinhalt:** Ausschussverfahren, Aufhebung der Richtlinie 95/46/EG, Verhältnis zur ePrivacy-Richtlinie, Anwendungsdatum (25. Mai 2018).  
**AustroFit-Relevanz:** Art. 95 wichtig: DSGVO und TKG/ePrivacy ergänzen sich (TKG regelt Cookie/Tracking-Consent, DSGVO die allgemeinen Datenschutzpflichten).  
**Trigger für neue Features:** —  
**Volltext-Datei:** —

---

## Zusammenfassung Screening

| Kategorie | Anzahl Artikel | Beispiele |
|---|---|---|
| ✅ anwendbar | 18 | Art. 5, 6, 7, 9, 13–17, 24, 25, 28, 30, 32, 33, 35, 44, 82 |
| ⚠️ bedingt | 9 | Art. 8, 11, 22, 30, 36, 37, 46, 88, 89 |
| ❌ nicht anwendbar | 14 | Art. 10, 23, 26, 27, 40, 41, 47–50, 85–87, 90–91 |
| 📋 referenz | 58 | Art. 1–4, 12, 51–59, 60–76, 77, 83–84, 92–99 |

**Volltext-Dateien vorhanden:**  
art-05.md, art-06.md, art-07.md, art-09.md, art-13.md, art-17.md, art-25.md, art-28.md, art-30.md, art-32.md, art-33.md, art-35.md

**Volltext-Dateien zu erstellen:** —
