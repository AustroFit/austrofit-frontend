---
law: DSGVO
article: "28"
title: "Auftragsverarbeiter (AVV)"
rechtsgrundlage: Verordnung (EU) 2016/679
compliance_ref: dsgvo-avv
req_refs: "REQ-R-002"
applicable: true
risk_level: hoch
last_reviewed: 2026-05-23
reviewed_by: "AI-assisted (Claude Sonnet), bestätigt durch: [Name + Datum]"
change_log:
  - date: 2026-05-23
    author: AI-assisted
    change: "Initiale Erstellung. Status: partial – Hetzner AVV offen (P1 Blocker), Vercel DPA offen (erfordert Pro-Upgrade)."
---

# Art. 28 – Auftragsverarbeiter (DSGVO)

## Gesetzestext (offiziell, Deutsch)

> **(1)** Erfolgt eine Verarbeitung im Auftrag eines Verantwortlichen, so arbeitet dieser nur mit Auftragsverarbeitern, die **hinreichende Garantien** dafür bieten, dass geeignete technische und organisatorische Maßnahmen so durchgeführt werden, dass die Verarbeitung im Einklang mit den Anforderungen dieser Verordnung erfolgt und den Schutz der Rechte der betroffenen Person gewährleistet.
>
> **(2)** Der Auftragsverarbeiter nimmt ohne vorherige schriftliche Genehmigung des Verantwortlichen **keine weiteren Auftragsverarbeiter** in Anspruch. Liegt eine allgemeine schriftliche Genehmigung vor, informiert der Auftragsverarbeiter den Verantwortlichen über beabsichtigte Änderungen hinsichtlich der Hinzuziehung oder Ersetzung weiterer Auftragsverarbeiter.
>
> **(3)** Die Verarbeitung durch einen Auftragsverarbeiter erfolgt auf der Grundlage eines **Vertrags oder eines anderen Rechtsinstruments** nach dem Unionsrecht oder dem Recht der Mitgliedstaaten, der bzw. das den Auftragsverarbeiter in Bezug auf den Verantwortlichen bindet und der Gegenstand, die Dauer, die Art und den Zweck der Verarbeitung, die Art der personenbezogenen Daten, die Kategorien betroffener Personen und die Pflichten und Rechte des Verantwortlichen festlegt. Dieser Vertrag bzw. dieses andere Rechtsinstrument sieht insbesondere vor, dass der Auftragsverarbeiter:
>
> **(a)** die personenbezogenen Daten **nur auf dokumentierte Weisung** des Verantwortlichen verarbeitet [...];
>
> **(b)** gewährleistet, dass die zur Verarbeitung befugten Personen **zur Vertraulichkeit** verpflichtet wurden [...];
>
> **(c)** alle gemäß **Artikel 32** erforderlichen Maßnahmen ergreift;
>
> **(d)** die in den Absätzen 2 und 4 genannten Voraussetzungen für die Inanspruchnahme der Dienste eines weiteren **Auftragsverarbeiters** einhält;
>
> **(e)** angesichts der Art der Verarbeitung den Verantwortlichen nach Möglichkeit mit geeigneten technischen und organisatorischen Maßnahmen dabei **unterstützt, seiner Pflicht zur Beantwortung von Anträgen** auf Wahrnehmung der in Kapitel III genannten Rechte der betroffenen Person nachzukommen;
>
> **(f)** unter Berücksichtigung der Art der Verarbeitung und der ihm zur Verfügung stehenden Informationen den Verantwortlichen bei der Einhaltung der in den **Artikeln 32 bis 36** genannten Pflichten unterstützt;
>
> **(g)** nach Abschluss der Erbringung der Verarbeitungsleistungen alle personenbezogenen Daten nach Wahl des Verantwortlichen **löscht oder zurückgibt** [...];
>
> **(h)** dem Verantwortlichen alle erforderlichen Informationen zum **Nachweis der Einhaltung** der in diesem Artikel niedergelegten Pflichten zur Verfügung stellt und Überprüfungen [...] ermöglicht [...].
>
> **(4)** Nimmt der Auftragsverarbeiter die Dienste eines weiteren Auftragsverarbeiters in Anspruch, um bestimmte Verarbeitungstätigkeiten [...] auszuführen, so werden diesem weiteren Auftragsverarbeiter [...] **dieselben Datenschutzpflichten auferlegt** [...].
>
> **(5)** Die Einhaltung genehmigter Verhaltensregeln [...] oder eines genehmigten Zertifizierungsverfahrens [...] kann als Garantie im Sinne der Absätze 1 und 4 des vorliegenden Artikels verwendet werden.
>
> **(6)** Unbeschadet eines individuellen Vertrags zwischen dem Verantwortlichen und dem Auftragsverarbeiter kann der Vertrag oder das andere Rechtsinstrument [...] ganz oder teilweise auf **Standardvertragsklauseln** [...] beruhen.
>
> **(9)** Wenn ein Auftragsverarbeiter unter Verstoß gegen diese Verordnung die Zwecke und Mittel der Verarbeitung bestimmt, so wird er in Bezug auf diese Verarbeitung als **Verantwortlicher** angesehen.

*Quelle: Verordnung (EU) 2016/679, Amtsblatt der EU L 119 vom 4.5.2016, S. 55–56*

---

## AustroFit — Auftragsverarbeiter-Übersicht

### Klassifikation aller Dienstleister

| Dienstleister | Rolle | Verarbeitet Nutzerdaten? | AVV-Status | Priorität |
|---|---|---|---|---|
| **Hetzner Online GmbH** | Hosting (Directus + PostgreSQL) | ✅ Ja — alle Nutzerdaten, inkl. Gesundheitsdaten | ❌ **offen** | P1 – Go-Live Blocker |
| **Vercel Inc.** | Serverless Functions / CDN | ✅ Ja — API-Requests mit personenbez. Daten | ❌ **offen** (erfordert Pro-Plan) | P1 – Go-Live Blocker |
| **PostHog Inc. (EU)** | Analytics | ✅ Ja — pseudonymisierte User-IDs, Events | ✅ DPA vorhanden (EU-Server Frankfurt) | erledigt |
| **Google LLC** | OAuth (Login via Google) | ⚠️ Ja — E-Mail, Name (nur bei Google-Login) | ✅ Google Cloud DPA (Standardvertragsklauseln) | erledigt |
| **AWIN GmbH** | Affiliate-Marketing | ⚠️ begrenzt — Impression/Click-Tracking | ⚠️ AWIN DPA prüfen | P2 |
| **Directus (self-hosted)** | CMS | — | — kein AVV nötig (self-hosted auf Hetzner) | — |

---

## Detail: Hetzner Online GmbH

**Status:** ❌ AVV offen — **P1 Go-Live Blocker**

| Feld | Inhalt |
|---|---|
| **Dienstleistung** | Virtual Server (VPS) — Hosting von Directus CMS + PostgreSQL-Datenbank |
| **Verarbeitete Daten** | Alle Nutzerdaten: E-Mail, Name, Schritte, Workouts, Aktivitätsgruppe, Punkte-Ledger, Badges |
| **Besondere Kategorien** | ✅ Ja — Gesundheitsdaten (Art. 9) werden auf Hetzner-Servern gespeichert |
| **Serverstandort** | Deutschland (Nürnberg) — EU, DSGVO-Jurisdiktion |
| **Drittland-Übermittlung** | Nein |
| **AVV-Abschluss** | Hetzner Kundencenter → Datenschutz → „AV-Vertrag" → kostenlos, ~5 Minuten |
| **Unterauftragsverarbeiter** | Hetzner informiert über Sub-Processors in ihrem Datenschutzzentrum |
| **Garantien** | Hetzner ist ISO 27001-zertifiziert; DIN EN 50600 (Rechenzentrum) |
| **Art. 28 Abs. 3 Erfüllung** | Durch Hetzner AV-Vertrag abgedeckt — nach Abschluss ✅ |

**Aktion:** Hetzner Kundencenter → https://www.hetzner.com/de/legal/privacy/ → „Auftragsdatenverarbeitung" → AV-Vertrag abschließen

---

## Detail: Vercel Inc.

**Status:** ❌ DPA offen — **P1 Go-Live Blocker** (erfordert Vercel Pro-Upgrade)

| Feld | Inhalt |
|---|---|
| **Dienstleistung** | Serverless Functions (SvelteKit API-Routes), CDN, Edge Network |
| **Verarbeitete Daten** | API-Requests enthalten personenbezogene Daten (Bearer-Token, User-IDs, Schritt-/Workout-Daten im Request-Body) |
| **Besondere Kategorien** | ✅ Ja — Gesundheitsdaten transit über Vercel-Infrastruktur (API-Proxy-Pattern) |
| **Serverstandort** | Primär: Frankfurt (EU); Edge-Nodes global |
| **Drittland-Übermittlung** | ⚠️ Vercel Inc. = US-Unternehmen; EU-Serverstandort allein reicht nicht → DPA mit Standardvertragsklauseln erforderlich |
| **DPA-Verfügbarkeit** | Vercel DPA (vercel.com/legal/dpa) gilt **nur für Pro- und Enterprise-Pläne** (bestätigt). Hobby-Plan: kein AVV verfügbar. |
| **AVV-Abschluss** | Upgrade auf Vercel Pro → DPA gilt automatisch als Teil der Nutzungsbedingungen |
| **Kosten** | Vercel Pro: ~$20/Monat |
| **Art. 28 Abs. 3 Erfüllung** | Nach Pro-Upgrade: durch Vercel DPA mit Standardvertragsklauseln (SCCs) abgedeckt |

**Aktion:** Vercel Pro abonnieren → DPA unter vercel.com/legal/dpa lesen und als abgeschlossen dokumentieren

---

## Detail: PostHog (EU)

**Status:** ✅ DPA vorhanden

| Feld | Inhalt |
|---|---|
| **Dienstleistung** | Produktanalytics (Events, Funnel-Analyse) |
| **Serverstandort** | Frankfurt (EU) — PostHog Cloud EU |
| **DPA** | PostHog EU DPA abgedeckt durch posthog.com/terms → EU Cloud Terms |
| **Drittland-Übermittlung** | Nein (EU-Server) |
| **Gesundheitsdaten** | Nein — Events enthalten keine Art. 9-Daten |

---

## AustroFit-Mapping

### Anforderungen aus Art. 28

| # | Anforderung | Status | Evidence |
|---|---|---|---|
| 1 | Nur Auftragsverarbeiter mit hinreichenden Garantien (Abs. 1) | ⚠️ partial | Hetzner: ISO 27001 ✅, aber kein AVV abgeschlossen. Vercel: kein DPA ohne Pro. PostHog: ✅. |
| 2 | Schriftlicher AVV-Vertrag mit allen 8 Mindestklauseln (Abs. 3 lit. a–h) | ❌ open | Hetzner: AVV nicht abgeschlossen. Vercel: DPA nicht aktiv (kein Pro-Plan). |
| 3 | Weisungsgebundenheit (Abs. 3 lit. a) | ⚠️ partial | Technisch: API-Calls sind Weisungen. Formal: ohne AVV nicht dokumentiert. |
| 4 | Vertraulichkeitsverpflichtung Beschäftigte (Abs. 3 lit. b) | ⚠️ partial | Hetzner-Mitarbeiter unterliegen Vertragspflichten — nach AVV formal abgesichert. |
| 5 | TOM-Verpflichtung (Abs. 3 lit. c → Art. 32) | ⚠️ partial | Hetzner: ISO 27001 ✅. Formal: erst nach AVV nachweisbar. |
| 6 | Unterauftragsverarbeiter-Genehmigung (Abs. 2/4) | ⚠️ partial | Hetzner informiert über Sub-Processors. Formal: erst nach AVV geregelt. |
| 7 | Unterstützung bei Betroffenenrechten (Abs. 3 lit. e) | ⚠️ partial | Technisch: Löschkaskade implementiert ✅. Formal: ohne AVV nicht dokumentiert. |
| 8 | Löschung/Rückgabe nach Vertragsende (Abs. 3 lit. g) | ⚠️ partial | Keine schriftliche Regelung ohne AVV. |
| 9 | Nachweisbarkeit / Audit-Recht (Abs. 3 lit. h) | ❌ open | Ohne AVV kein formales Audit-Recht gegenüber Hetzner/Vercel. |

### Offene Punkte (vor Go-Live)

- [ ] **Hetzner AVV abschließen** — Hetzner Kundencenter → Datenschutz → AV-Vertrag (~5 Min., kostenlos) → PDF als `docs/avv/hetzner-avv-[datum].pdf` ablegen
- [ ] **Vercel Pro upgraden** — DPA gilt automatisch nach Upgrade → Screenshot/Bestätigung als `docs/avv/vercel-dpa-[datum].pdf` ablegen
- [ ] **AVV-Ablage** — `docs/avv/` Verzeichnis anlegen; alle abgeschlossenen AVV-Dokumente versioniert ablegen
- [ ] **AWIN DPA prüfen** — AWIN DSGVO-Dokumentation sichten; ggf. Data Processing Agreement einholen
- [ ] **VVT-05 und VVT-08 aktualisieren** — nach AVV-Abschluss Status in `art-30.md` (VVT) auf "AVV vorhanden" aktualisieren
- [ ] **compliance.yaml** — `dsgvo-avv` Status nach AVV-Abschlüssen auf `compliant` setzen

---

## Audit-Nachweis

**Umsetzungsstand:** ⚠️ partial — BLOCKEND vor Go-Live (Hetzner + Vercel)

**Erledigte Teile:**
- PostHog EU: DPA vorhanden ✅
- Google OAuth: Google Cloud DPA (SCCs) ✅
- Directus self-hosted: kein AVV nötig ✅

**Fehlende Teile:**
- `docs/avv/hetzner-avv-[datum].pdf` — nicht vorhanden (AVV nicht abgeschlossen)
- `docs/avv/vercel-dpa-[datum].pdf` — nicht vorhanden (Pro-Plan nicht aktiv)

**Code-Referenz:**
- `src/hooks.server.ts` — CORS-Handler (Daten laufen über Vercel)
- `src/lib/server/stepsService.ts`, `cardioService.ts` — Datenschreiben auf Hetzner/Directus

**Bestätigt durch:** — (ausstehend)  
**Nächste Review:** Nach Abschluss Hetzner AVV + Vercel Pro Upgrade
