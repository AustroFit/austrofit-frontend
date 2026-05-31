---
law: DSGVO
article: "7"
title: "Bedingungen für die Einwilligung"
rechtsgrundlage: Verordnung (EU) 2016/679
compliance_ref: dsgvo-art9-consent
req_refs: "REQ-R-001"
applicable: true
risk_level: hoch
last_reviewed: 2026-05-23
reviewed_by: "AI-assisted (Claude Sonnet), bestätigt durch: [Name + Datum]"
change_log:
  - date: 2026-05-23
    author: AI-assisted
    change: "Initiale Erstellung. Status: partial – Art. 9-Consent-Dialog fehlt, kein Consent-Logging in DB."
---

# Art. 7 – Bedingungen für die Einwilligung (DSGVO)

## Gesetzestext (offiziell, Deutsch)

> **(1)** Beruht die Verarbeitung auf einer Einwilligung, muss der Verantwortliche nachweisen können, dass die betroffene Person in die Verarbeitung ihrer personenbezogenen Daten eingewilligt hat.
>
> **(2)** Erfolgt die Einwilligung der betroffenen Person durch eine schriftliche Erklärung, die noch andere Sachverhalte betrifft, so muss das Ersuchen um Einwilligung in verständlicher und leicht zugänglicher Form in einer klaren und einfachen Sprache so erfolgen, dass es von den anderen Sachverhalten klar zu unterscheiden ist. Teile der Erklärung, die gegen diese Verordnung verstoßen, sind nicht bindend.
>
> **(3)** Die betroffene Person hat das Recht, ihre Einwilligung jederzeit zu widerrufen. Durch den Widerruf der Einwilligung wird die Rechtmäßigkeit der aufgrund der Einwilligung bis zum Widerruf erfolgten Verarbeitung nicht berührt. Die betroffene Person wird vor Abgabe der Einwilligung hiervon in Kenntnis gesetzt. Der Widerruf muss so einfach wie die Erteilung der Einwilligung sein.
>
> **(4)** Bei der Beurteilung, ob die Einwilligung freiwillig erteilt wurde, muss dem Umstand in größtmöglichem Umfang Rechnung getragen werden, ob unter anderem die Erfüllung eines Vertrags, einschließlich der Erbringung einer Dienstleistung, von der Einwilligung zu einer Verarbeitung von personenbezogenen Daten abhängig gemacht wird, die für die Erfüllung des Vertrags nicht erforderlich sind.

*Quelle: Verordnung (EU) 2016/679, Amtsblatt der EU L 119 vom 4.5.2016, S. 37*

---

## Kontext: Einwilligungsanforderungen (Erwägungsgründe)

Die Erwägungsgründe 32, 33, 42 und 43 präzisieren Art. 7:

- **EG 32**: Einwilligung durch eindeutige bestätigende Handlung (kein vorausgefülltes Kästchen, kein Schweigen)
- **EG 42**: Nachweispflicht liegt beim Verantwortlichen; Einwilligung nicht freiwillig wenn Ungleichgewicht besteht
- **EG 43**: Kopplungsverbot — Einwilligung nicht freiwillig wenn Vertragsdurchführung davon abhängig
- **EG 33**: Zweck muss zum Zeitpunkt der Einwilligung feststehen (Zweckbindung)

---

## AustroFit — Einwilligungsübersicht

AustroFit verwendet Einwilligung (Art. 6 Abs. 1 lit. a und Art. 9 Abs. 2 lit. a) für folgende Verarbeitungen:

| Einwilligungstyp | Rechtsgrundlage | Implementiert | Nachweisbar | Widerrufbar |
|---|---|---|---|---|
| Analytics (PostHog) | Art. 6 Abs. 1 lit. a | ✅ Consent-Banner | ✅ localStorage `austrofit_analytics_consent` | ✅ Banner erneut zeigen |
| Gesundheitsdaten / Schritte (Health Connect) | Art. 9 Abs. 2 lit. a | ⚠️ partial (OS-Permission, kein DSGVO-Consent) | ❌ kein DB-Log | ⚠️ via OS-Einstellungen |
| Workouts / Cardio (Health Connect) | Art. 9 Abs. 2 lit. a | ⚠️ partial (gemeinsam mit Schritte-Permission) | ❌ kein DB-Log | ⚠️ via OS-Einstellungen |
| Aktivitätsgruppe pregnant/chronic | Art. 9 Abs. 2 lit. a | ❌ kein expliziter Consent | ❌ kein DB-Log | ❌ kein In-App-Widerruf |

---

## AustroFit-Mapping

### Anforderungen aus Art. 7

| # | Anforderung | Status | Evidence | REQ-Ref |
|---|---|---|---|---|
| 1 | **Nachweisbarkeit** (Abs. 1): Einwilligung muss dokumentiert sein | ❌ open | Analytics: localStorage-Flag (flüchtig, kein DB-Log). Art. 9-Consent: kein Log vorhanden. | REQ-R-001 |
| 2 | **Klar abgegrenzt** (Abs. 2): Einwilligungstext von anderen Erklärungen trennbar | ⚠️ partial | Analytics-Banner ✅ getrennt. Art. 9-Consent: aktuell kein separater Dialog — im Onboarding-Flow nicht explizit abgegrenzt. | REQ-R-001 |
| 3 | **Verständliche Sprache** (Abs. 2): Kein Fachjargon, klare Zweckbenennung | ⚠️ partial | Analytics-Banner: klar ✅. Art. 9-Consent-Text: nicht vorhanden (Dialog fehlt). | REQ-R-001 |
| 4 | **Widerrufsrecht vor Einwilligung bekannt** (Abs. 3 Satz 3) | ⚠️ partial | Analytics: Widerruf in DSE erwähnt ✅. Art. 9: kein Hinweis beim (fehlenden) Consent-Dialog. | REQ-R-001 |
| 5 | **Widerruf ebenso einfach wie Erteilung** (Abs. 3 Satz 4) | ⚠️ partial | Analytics: Widerruf via Profil → Datenschutz möglich ✅. Art. 9: Widerruf nur via OS-Einstellungen (nicht gleichwertig einfach). | REQ-R-001 |
| 6 | **Kopplungsverbot** (Abs. 4): Art. 9-Consent darf nicht Bedingung für App-Nutzung sein | ⚠️ offen (zu prüfen) | Health Connect Permission ist aktuell Voraussetzung für Kernfunktionen (Schritt-Tracking). Klären: Ist App ohne Health Connect sinnvoll nutzbar? | — |
| 7 | **Granularität** (EG 32): Separate Einwilligung je Zweck | ❌ open | Schritte, Workouts und Aktivitätsgruppe werden mit einer einzigen Health Connect Permission abgedeckt — keine Granularität. | REQ-R-001 |

### Offene Punkte (vor Go-Live)

- [ ] **Art. 9-Consent-Dialog** implementieren — separater Schritt im Onboarding zwischen Registrierung und Health Connect Permission:
  - Klarer Titel: "Darf AustroFit deine Aktivitätsdaten verarbeiten?"
  - Explizite Auflistung: Schrittzahl, Workout-Typ/-Dauer, Aktivitätsgruppe
  - Zweck klar benennen: Punktevergabe, Streak-Berechnung, Zielanpassung
  - Widerruf erwähnen: "Du kannst deine Einwilligung jederzeit in Profil → Datenschutz widerrufen"
  - Freiwilligkeit: Hinweis, dass Gesundheitstracking optional ist (App teilweise ohne Health Connect nutzbar — Quiz, Artikel weiterhin verfügbar)
- [ ] **Consent-Logging in Datenbank** — neue Collection `consent_log` oder Feld in `user_profiles`:
  - Felder: `user_id`, `consent_type` ('health_data_art9', 'analytics'), `granted_at`, `revoked_at`, `version` (Consent-Text-Version)
  - Bei Analytics: Upgrade von localStorage-Flag auf DB-Log für Nachweisbarkeit
- [ ] **In-App-Widerruf** für Art. 9-Einwilligung — Profilseite → Datenschutz → "Aktivitätsdaten-Einwilligung widerrufen": löscht Health-Daten (Schritte, Workouts) und deaktiviert zukünftige Syncs
- [ ] **Kopplungsverbot klären** — Rechtsberatung: Ist App ohne Gesundheitstracking sinnvoll nutzbar (Quiz, Artikel, Gamification via manuelle Eingabe)? Wenn ja: Consent klar als optional kommunizieren.
- [ ] **Consent-Text Rechtsberatung** — Finalen Consent-Dialog-Text durch Rechtsberatung (WKO-Erstberatung) absegnen lassen

### Abgrenzung: Was ist KEINE Einwilligung

| Verarbeitungstätigkeit | Rechtsgrundlage | Begründung |
|---|---|---|
| Registrierung (E-Mail, Name) | Art. 6 Abs. 1 lit. b (Vertrag) | Für Vertragserfüllung erforderlich — kein Einwilligungserfordernis |
| Punkte-Ledger, Badge-Vergabe | Art. 6 Abs. 1 lit. b (Vertrag) | Kern des Produktversprechens |
| Quiz-Attempts (anonym) | Art. 6 Abs. 1 lit. b (Vertrag) | Anonyme Daten; kein Personenbezug vor Claim |
| Impressum / DSE bereitstellen | Art. 6 Abs. 1 lit. c (rechtl. Verpflichtung) | ECG-Pflicht |

---

## Audit-Nachweis

**Umsetzungsstand:** ⚠️ partial — BLOCKEND vor Go-Live (Art. 9-Consent)

**Implementierte Teile:**
- `src/lib/components/dashboard/ConsentBanner.svelte` — Analytics-Consent ✅
- `src/routes/datenschutz/+page.svelte` — Widerrufsinformation in DSE ✅

**Fehlende Implementierung:**
- `src/lib/components/consent/HealthDataConsent.svelte` — Art. 9-Consent-Dialog (zu erstellen)
- DB-Migration `consent_log` Collection in Directus (zu erstellen)
- In-App-Widerruf in `src/routes/profil/+page.svelte` (zu ergänzen)

**Bestätigt durch:** — (ausstehend)  
**Nächste Review:** Nach Implementierung Consent-Dialog + Consent-Logging; nach Rechtsberatung Consent-Text
