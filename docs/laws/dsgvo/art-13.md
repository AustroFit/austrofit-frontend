---
law: DSGVO
article: "13"
title: "Informationspflicht bei direkter Datenerhebung"
rechtsgrundlage: Verordnung (EU) 2016/679
compliance_ref: dsgvo-art13-dse
req_refs: "REQ-R-004"
applicable: true
risk_level: mittel
last_reviewed: 2026-05-23
reviewed_by: "AI-assisted (Claude Sonnet), bestätigt durch: [Name + Datum]"
change_log:
  - date: 2026-05-23
    author: AI-assisted
    change: "Initiale Erstellung. Status: compliant (DSE Mai 2026 abgedeckt). Nachführungspflicht bei neuen Verarbeitungszwecken dokumentiert."
---

# Art. 13 – Informationspflicht bei direkter Datenerhebung (DSGVO)

## Gesetzestext (offiziell, Deutsch)

> **(1)** Werden personenbezogene Daten bei der betroffenen Person erhoben, so teilt der Verantwortliche der betroffenen Person **zum Zeitpunkt der Erhebung** dieser Daten Folgendes mit:
>
> **(a)** den Namen und die Kontaktdaten des Verantwortlichen sowie gegebenenfalls seines Vertreters;
>
> **(b)** gegebenenfalls die Kontaktdaten des Datenschutzbeauftragten;
>
> **(c)** die Zwecke, für die die personenbezogenen Daten verarbeitet werden sollen, sowie die Rechtsgrundlage für die Verarbeitung;
>
> **(d)** wenn die Verarbeitung auf Artikel 6 Absatz 1 Buchstabe f beruht, die berechtigten Interessen, die von dem Verantwortlichen oder einem Dritten verfolgt werden;
>
> **(e)** gegebenenfalls die Empfänger oder Kategorien von Empfängern der personenbezogenen Daten;
>
> **(f)** gegebenenfalls die Absicht des Verantwortlichen, die personenbezogenen Daten an ein Drittland oder eine internationale Organisation zu übermitteln.
>
> **(2)** Zusätzlich zu den Informationen gemäß Absatz 1 stellt der Verantwortliche der betroffenen Person zum Zeitpunkt der Erhebung dieser Daten folgende weitere Informationen zur Verfügung, die notwendig sind, um eine faire und transparente Verarbeitung zu gewährleisten:
>
> **(a)** die Dauer, für die die personenbezogenen Daten gespeichert werden, oder, falls dies nicht möglich ist, die Kriterien für die Festlegung dieser Dauer;
>
> **(b)** das Bestehen eines Rechts auf Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch und Datenübertragbarkeit;
>
> **(c)** das Recht, die Einwilligung jederzeit zu widerrufen, ohne dass die Rechtmäßigkeit der aufgrund der Einwilligung bis zum Widerruf erfolgten Verarbeitung berührt wird;
>
> **(d)** das Recht auf Beschwerde bei einer Aufsichtsbehörde;
>
> **(e)** ob die Bereitstellung der personenbezogenen Daten gesetzlich oder vertraglich vorgeschrieben oder für einen Vertragsabschluss erforderlich ist, sowie ob die betroffene Person verpflichtet ist, die Daten bereitzustellen, und die möglichen Folgen einer Nichtbereitstellung;
>
> **(f)** das Bestehen einer automatisierten Entscheidungsfindung einschließlich Profiling.
>
> **(3)** Beabsichtigt der Verantwortliche, die personenbezogenen Daten für einen anderen Zweck weiterzuverarbeiten als den, für den sie erhoben wurden, so stellt er der betroffenen Person vor dieser Weitverarbeitung Informationen über diesen anderen Zweck und alle anderen maßgeblichen Informationen [...] zur Verfügung.

*Quelle: Verordnung (EU) 2016/679, Amtsblatt der EU L 119 vom 4.5.2016, S. 40–41*

---

## AustroFit — Erhebungszeitpunkte

Daten werden bei folgenden Schritten direkt vom Nutzer erhoben — Art. 13 gilt jeweils:

| Erhebungszeitpunkt | Kanal für Art. 13-Information |
|---|---|
| Registrierung (E-Mail, Name, Passwort) | DSE + Hinweis auf Registrierungsseite |
| Onboarding (Aktivitätsgruppe-Auswahl) | DSE + (geplant) Art. 9-Consent-Dialog |
| Health Connect Permission (Schritte, Workouts) | OS-Permission-Dialog + DSE |
| Analytics-Einwilligung (Consent-Banner) | Consent-Banner-Text |
| Google OAuth Login | DSE + Google Datenschutzhinweis |

---

## AustroFit-Mapping

### Anforderungen aus Art. 13 — Checkliste DSE Mai 2026

| # | Pflichtinformation | Status | Fundstelle in DSE |
|---|---|---|---|
| 1 | Name + Kontakt Verantwortlicher (Abs. 1 lit. a) | ✅ | Impressum + DSE Abschnitt "Verantwortlicher" |
| 2 | Kontakt DSB (Abs. 1 lit. b) | ✅ n.a. | Kein DSB bestellt (Kleinstunternehmen); in DSE vermerkt |
| 3 | Verarbeitungszwecke + Rechtsgrundlage (Abs. 1 lit. c) | ✅ | DSE Abschnitt "Zwecke der Verarbeitung" |
| 4 | Empfänger / Kategorien (Abs. 1 lit. e) | ✅ | DSE Abschnitt "Weitergabe an Dritte" (Hetzner, Vercel, PostHog) |
| 5 | Drittlandübermittlung (Abs. 1 lit. f) | ⚠️ partial | Vercel (US) in DSE; DPA-Status noch nicht final → nach Vercel Pro Update aktualisieren |
| 6 | Speicherdauer (Abs. 2 lit. a) | ⚠️ partial | DSE: "bis zur Kontolöschung" — konkrete Fristen noch nicht präzisiert |
| 7 | Betroffenenrechte (Abs. 2 lit. b) | ✅ | DSE Abschnitt "Ihre Rechte" |
| 8 | Widerrufsrecht + Hinweis (Abs. 2 lit. c) | ✅ | DSE + Analytics-Consent-Banner |
| 9 | Beschwerderecht DSB (Abs. 2 lit. d) | ✅ | DSE: Datenschutzbehörde Wien, Barichgasse 40–42, 1030 Wien |
| 10 | Freiwilligkeit Datenangabe (Abs. 2 lit. e) | ⚠️ partial | Registrierungsfelder als Pflichtfelder kenntlich; Health-Daten-Freiwilligkeit unklar kommuniziert |
| 11 | Automatisierte Entscheidungen / Profiling (Abs. 2 lit. f) | ✅ n.a. | Kein Profiling mit Rechtswirkung; in DSE vermerkt |

**Gesamtstatus DSE: ✅ weitgehend compliant** — offene Punkte sind Präzisierungen, keine strukturellen Lücken.

### Offene Punkte

- [ ] **Speicherfristen** in DSE präzisieren — nach Finalisierung des VVT (art-30.md) die Löschfristen aus dem VVT in die DSE übernehmen
- [ ] **Vercel-Drittlandübermittlung aktualisieren** — nach Vercel Pro Upgrade + DPA-Abschluss DSE-Abschnitt zu Drittlandübermittlungen aktualisieren (SCCs dokumentieren)
- [ ] **Health-Daten-Freiwilligkeit** kommunizieren — im Art. 9-Consent-Dialog klar stellen, dass Health Connect optional ist (App ohne Schritte-Tracking teilweise nutzbar: Quiz, Artikel, Gamification via manuelle Eingabe)
- [ ] **DSE-Versionierung** — nach jeder Änderung Versionsstand und Datum in DSE aktualisieren; ältere Versionen archivieren

---

## Audit-Nachweis

**Umsetzungsstand:** ✅ compliant (mit kleinen offenen Punkten zur Präzisierung)

**Primäre Nachweise:**
- `src/routes/datenschutz/+page.svelte` — Datenschutzerklärung Mai 2026
- `src/routes/impressum/+page.svelte` — Kontaktdaten Verantwortlicher
- `src/lib/components/dashboard/ConsentBanner.svelte` — Analytics-Einwilligung mit Widerrufshinweis

**Bestätigt durch:** — (ausstehend — DSE-Inhalt durch Rechtsberatung absichern lassen)  
**Nächste Review:** Nach Art. 9-Consent-Implementierung (DSE-Update erforderlich); nach Vercel Pro Upgrade
