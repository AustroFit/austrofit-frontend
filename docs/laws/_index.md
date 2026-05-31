# AustroFit – Regulatory Compliance Index

**Stand:** 2026-05-24 (GTelG vollständig)  
**Scope:** Österreich / EU  
**Verantwortlich:** Johannes Gnong (Betreiber)  
**Maschinenlesbare Quelle:** `docs/compliance.yaml`  
**Gesetzestexte:** `docs/laws/[gesetz]/`

---

## Gesamtstatus Übersicht

| Regulierung | Kategorie | Phase | Applicable | Status | Blocker Go-Live |
|---|---|---|---|---|---|
| DSGVO | Datenschutz | MVP | ✅ | ⚠️ partial | ✅ Ja (3 offene Punkte) |
| DSG (Österreich) | Datenschutz | MVP | ✅ | ⚠️ partial | ⚠️ § 4 Abs. 4 in AGB (mit AGB-Blocker) |
| TKG 2021 | Tracking/ePrivacy | MVP | ✅ | ✅ compliant | — |
| ECG | E-Commerce | MVP | ✅ | ⚠️ partial | ✅ Ja (AGB fehlen) |
| KSchG | Konsumentenschutz | MVP | ✅ | ⚠️ partial | ✅ Ja (§ 5a Informationspflichten + AGB § 6) |
| UWG | Werberecht | MVP | ✅ | ✅ compliant | — |
| MDR | Produktrecht | MVP | ❌ n.a. | ✅ documented | — |
| GSpG | Glücksspiel | MVP | ❌ n.a. | ✅ documented | — |
| ZaDiG | Finanzrecht | MVP | ❌ n.a. | ✅ documented | — |
| DSA | Plattformrecht | MVP | ✅ | ⚠️ partial | ✅ Ja (Art. 16 Meldeverfahren + AGB) |
| Health-Claims-VO | Werberecht | MVP | ❌ n.a. | ✅ documented | — |
| NIS2 / NISG 2026 | Cybersicherheit | MVP | ❌ n.a. | ✅ documented | — |
| BFSG / BaFG | Barrierefreiheit | Phase 2 | ❌ n.a. | deferred | — |
| EU AI Act | KI | Phase 2 | ✅ | deferred | — |
| IEC 82304-2 | Produktqualität | Phase 2 | ✅ | deferred | — |
| GTelG 2012 | B2G | Phase 3+ | ❌ n.a. | ✅ documented | — |
| eHealth-Strategie AT | B2G | Phase 3+ | ❌ n.a. | deferred | — |

---

## DSGVO – Detailstatus der offenen Punkte

| ID | Anforderung | Status | Frist | Priorität |
|---|---|---|---|---|
| dsgvo-art9-consent | Art. 9-Consent für Gesundheitsdaten | ⚠️ partial | Vor Go-Live | P1 |
| dsgvo-avv | AVV Hetzner + Vercel Pro | ⚠️ partial | Vor Go-Live | P1 |
| dsgvo-art35-dpia | DPIA erstellen | ❌ open | Vor Go-Live | P1 |
| dsgvo-art13-dse | Datenschutzerklärung | ✅ compliant | — | — |
| dsgvo-art17-loeschung | Löschung + Kaskade | ✅ compliant | — | — |
| dsgvo-art32-tom | TOM-Dokument | ⚠️ partial (Backup-Konzept offen) | Vor Go-Live | P2 |
| dsgvo-art25-privacy-by-design | Privacy by Design | ⚠️ partial (JWT-Begründung in DPIA) | Mit DPIA | P2 |

---

## ECG / KSchG – Detailstatus

| ID | Anforderung | Status | Frist |
|---|---|---|---|
| ecg-impressum | Impressum § 5 ECG | ✅ compliant | — |
| ecg-agb | Allgemeine Geschäftsbedingungen | ❌ open | Vor Go-Live |
| kschg-transparenz-punkte | Transparenz Punkte-System | ❌ open | Vor Go-Live (in AGB) |
| kschg-no-dark-patterns | Keine Dark Patterns | ✅ compliant | — |
| kschg-5a-informationspflichten | § 5a: Funktionalität/Kompatibilität/Kostenlosigkeit vor Registrierung | ✅ compliant | — |
| kschg-agb-§6-konformitaet | § 6: kein Haftungsausschluss Körperschäden; § 14: kein exklusiver Gerichtsstand | ❌ open | Vor Go-Live (Teil der AGB) |
| kschg-7d-bereitstellungspflicht | § 7d: Bereitstellungspflicht digitale Leistungen | ⚠️ partial | Bei AGB-Erstellung (Wartungsfenster) |

---

## Priorisierte Go-Live Blockers

| Priorität | ID | Aktion | Aufwand | Verantwortlich |
|---|---|---|---|---|
| **P1** | dsgvo-avv | Hetzner AVV abschließen (Kundencenter → Datenschutz) | gering (5 Min) | Betreiber |
| **P1** | dsgvo-avv | Vercel Pro upgraden → DPA automatisch aktiv | gering | Betreiber |
| P1 | dsgvo-art9-consent | Consent-Text Rechtscheck (Anwalt) | gering | Rechtsberatung |
| **P1** | dsgvo-art35-dpia | DPIA erstellen | hoch | Betreiber + Rechtsberatung |
| **P1** | ecg-agb | AGB mit Punkte-Regeln erstellen (§ 11 ECG + § 6 / § 14 KSchG-konform) | hoch | Rechtsberatung |
| ~~P1~~ | ~~kschg-5a-informationspflichten~~ | ~~§ 5a KSchG Registrierungsseite~~ | ✅ erledigt 2026-05-24 | — |
| **P1** | dsa-meldeverfahren | Meldeverfahren rechtswidrige Inhalte (abuse@austrofit.at + Impressum-Link) | gering | Entwicklung |
| **P2** | dsa-agb-inhaltsmoderation | DSA-Inhaltsmoderation in AGB integrieren (bei Rechtsberatung AGB) | gering (add-on) | Rechtsberatung |
| **P2** | dsgvo-art32-tom | Backup-Konzept schriftlich fertigstellen | mittel | Betreiber |
| **P2** | ecg-impressum | UID nach Gewerbeanmeldung ergänzen | gering | Betreiber |

---

## Screening-Status der Gesetze

| Gesetz | _screening.md | Volltext-Artikel | Zuletzt geprüft |
|---|---|---|---|
| DSGVO | ✅ vollständig (99 Artikel) | art-09.md, art-35.md | 2026-05-22 |
| DSG | ✅ vollständig (v1.0, 2026-05-24) | — (bei Bedarf § 4, § 6) | 2026-05-24 |
| TKG 2021 | ✅ vollständig (v1.0-pending-review) | — (bei Bedarf) | 2026-05-24 |
| ECG | ✅ vollständig (v1.0-pending-review) | — (bei Bedarf) | 2026-05-24 |
| KSchG | ✅ vollständig (v1.0-pending-review) | — (§§ 5a, 6, 7d, 9, 14 im Screening; VGG-Folge-Screening P2) | 2026-05-24 |
| MDR | ✅ vollständig (v1.0-pending-review) | — (nicht anwendbar) | 2026-05-24 |
| UWG | ⚠️ Skeleton (0.1-draft) | — | — |
| GSpG | ✅ vollständig (v1.0-pending-review) | — (nicht anwendbar: § 1 + § 2 nicht erfüllt; § 58 Abs. 3 deferred) | 2026-05-24 |
| ZaDiG | ⚠️ Skeleton (0.1-draft) | — | — |
| BFSG | ✅ vollständig (v1.1-pending-review) | — (nicht anwendbar, Art. 4 Abs. 5) | 2026-05-24 |
| NIS2 | ⚠️ Skeleton (0.1-draft) | — | — |
| AI Act | ✅ vollständig (v1.0-pending-review) | — (bei Bedarf) | 2026-05-23 |
| DSA | ✅ vollständig (v1.0, 2026-05-24) | — (alle Art. im Screening abgedeckt) | 2026-05-24 |
| GTelG | ✅ vollständig (v1.0, 2026-05-24) | — (nicht anwendbar: kein Gesundheitsdiensteanbieter § 2 Z 2) | 2026-05-24 |
| IEC 82304-2 | ⚠️ Skeleton (0.1-draft, kein Volltext) | — | — |
| eHealth-Strategie AT | ⚠️ Skeleton (0.1-draft) | — | — |
| Health-Claims-VO | ⚠️ Skeleton (0.1-draft) | — | — |

---

## Nicht-Anwendbarkeits-Register

Gesetze die explizit ausgeschlossen und begründet dokumentiert sind:

| Gesetz | Begründung | Trigger für Wiederprüfung |
|---|---|---|
| MDR (EU) 2017/745 | Keine medizinische Zweckbestimmung; keine Diagnostik/Therapie; Disclaimer implementiert | Neue Features mit diagnostischen Claims |
| GSpG | Punkte nur durch Aktivität verdient (kein Geldeinsatz); Gewinnspiele als kostenlose Preisausschreiben gestaltbar | Kaufmöglichkeit für Punkte |
| ZaDiG 2018 | Punkte nicht gegen Bargeld einlösbar, nicht übertragbar, kein Rückzahlungsanspruch | Monetarisierung von Punkten |
| Health-Claims-VO (EG) 1924/2006 | Gilt für Lebensmittel; AustroFit verkauft keine Lebensmittel | Lebensmittel-Partner mit Health-Claims |
| NIS2 / NISG 2026 | Unter Schwellenwert (< 50 MA, < 10 Mio EUR) | Wachstum auf ≥ 50 MA oder ≥ 10 Mio EUR |
| BFSG / BaFG | Doppelt nicht anwendbar: (1) Kein sachlicher Anwendungsbereich (Art. 2 Abs. 2) — kein E-Commerce i.S.d. Art. 3 Nr. 30 (kein Verbrauchervertrag auf Plattform); (2) Kleinstunternehmen-Ausnahme Art. 4 Abs. 5 (< 10 MA, ≤ 2 Mio EUR) | Wachstum auf ≥ 10 MA oder ≥ 2 Mio EUR; oder kostenpflichtiges Modell (direkter Kaufabschluss auf Plattform) |
| GTelG 2012 | AustroFit ist kein „Gesundheitsdiensteanbieter" (§ 2 Z 2 GTelG) — kein Arzt, keine Apotheke, kein Krankenhaus, keine Pflegeeinrichtung. Gesamtes Gesetz (ELGA, eImpfpass, Datensicherheit §§ 3–8, MyHealth@EU) gilt nur für diesen Personenkreis. Abgrenzung: Aktivitätsdaten als Art. 9 DSGVO-Gesundheitsdaten → Pflichten folgen aus DSGVO, nicht GTelG. Volltext-Screening (41 Seiten, alle §§) in docs/laws/gteleg/_screening.md. | ELGA-Anbindung, DiGA-Zertifizierung (REQ-P-042, ab 2027), SVS-Direktanbindung (REQ-P-043) |

---

## Änderungsprotokoll

| Datum | Autor | Änderung |
|---|---|---|
| 2026-05-22 | AI-assisted (Claude Sonnet) | Initiale Erstellung _index.md; DSGVO _screening.md (vollständig, 99 Artikel); art-09.md, art-35.md |
| 2026-05-22 | AI-assisted (Claude Sonnet) | Skeleton _screening.md für 11 weitere Regulierungen erstellt; compliance.yaml mit law_ref + VVT Art. 30 + ZaDiG Rechtsberatungshinweis aktualisiert; _SCHEMA.md und _index.md Source-of-Truth-Korrekturen |
| 2026-05-24 | AI-assisted (Claude Sonnet) | MDR _screening.md vollständig erstellt (v1.0-pending-review) — Art. 2 Nr. 1 + EG 19 aus PDF; Ergebnis: ❌ nicht anwendbar (Wellness-App, kein Medizinprodukt); Trigger-Liste dokumentiert |
| 2026-05-24 | AI-assisted (Claude Sonnet) | ECG _screening.md vollständig erstellt (v1.0-pending-review) — §§ 1–27 ausgewertet; P1-Blocker § 11 AGB bestätigt; § 10 Abs. 2 Empfangsbestätigung P2 |
| 2026-05-24 | AI-assisted (Claude Sonnet) | TKG 2021 _screening.md vollständig erstellt (v1.0-pending-review) — basiert auf PDF Fassung 24.05.2026; §§ 160–174 ausgewertet; Ergebnis: ✅ compliant (§ 165 Abs. 3 ConsentBanner, § 174 keine Marketing-E-Mails) |
| 2026-05-24 | AI-assisted (Claude Sonnet) | BFSG _screening.md v1.1 — basiert auf PDF CELEX_32019L0882_DE_TXT.pdf (42 S.); Art. 2+3+4+32+Anhang I aus Originaltext; Korrektur: Ausnahme in Art. 4 Abs. 5 (nicht Art. 15); E-Commerce (Art. 3 Nr. 30) eindeutig nicht anwendbar (kein Verbrauchervertrag); Ergebnis: ❌ doppelt nicht anwendbar |
| 2026-05-23 | AI-assisted (Claude Sonnet) | AI Act _screening.md vollständig erstellt (v1.0-pending-review) — basiert auf PDF OJ_L_202401689_DE_TXT.pdf; Art. 5, Art. 6, Art. 50, Art. 113, Anhang I, Anhang III ausgewertet; Ergebnis: aktuell kein KI-System implementiert, deferred bis ML-Feature-Implementierung |
| 2026-05-24 | AI-assisted (Claude Sonnet) | DSG _screening.md vollständig erstellt (v1.0) — RIS-PDF Fassung 23.05.2026 (BGBl. I Nr. 50/2025, 38 Seiten), alle 70 §§ gescreent. 2 neue REQ-R: REQ-R-026 (§ 4 Abs. 4 Mindestalter 14), REQ-R-027 (§ 6 Datengeheimnis). Korrektur: DSB-Pflicht-Hinweis + Rechtsgrundlage auf BGBl. I Nr. 50/2025. |
| 2026-05-24 | AI-assisted (Claude Sonnet) | DSA _screening.md vollständig erstellt (v1.0) — CELEX_32022R2065_DE_TXT.pdf (102 Seiten, alle 95 Artikel). Klassifikation: Hostingdiensteanbieter (kein Online-Plattform-Betreiber). Kleinstunternehmen-Ausnahme für Art. 15 + Art. 19–28. 2 neue P1-Blocker: Art. 16 Meldeverfahren, Art. 14 AGB-Inhaltsmoderation. compliance.yaml dsa-Sektion auf 7 Requirements ausgebaut. |
| 2026-05-24 | AI-assisted (Claude Sonnet) | GSpG _screening.md vollständig erstellt (v1.0-pending-review) — RIS-PDF Fassung 23.05.2026 (39 Seiten, alle §§ gescreent). Ergebnis: ❌ nicht anwendbar (§ 1 kein Zufallselement, § 2 kein Einsatz). § 58 Abs. 3 (Gewinnspiele) als deferred Watchlist dokumentiert. Fehler in Skeleton korrigiert: § 17 war falsch referenziert — richtig ist § 58 Abs. 3. compliance.yaml: 2 Requirements (Design-Guardrail + Steuer-Watchlist), law_ref auf _screening.md aktualisiert. |
| 2026-05-24 | AI-assisted (Claude Sonnet 4.6) | KSchG _screening.md vollständig erstellt (v1.0-pending-review) — RIS-PDF Fassung 24.05.2026 (24 Seiten, alle §§ gescreent). 2 neue P1-Blocker: REQ-R-030 (§ 5a Informationspflichten digitale Leistungen: Funktionalität/Kompatibilität/Kostenlosigkeit vor Registrierung), REQ-R-031 (§ 6 Abs. 1 Z 9 AGB-Haftungsausschluss Körperschäden — in Fitness-App unzulässig). § 7d Bereitstellungspflicht + § 14 Gerichtsstand dokumentiert. VGG (BGBl. I Nr. 175/2021) als P2-Folge-Screening identifiziert. compliance.yaml: 5 Requirements (inkl. 3 neue), 3 open_actions. |
| 2026-05-24 | AI-assisted (Claude Sonnet 4.6) | dsgvo-art9-consent technisch implementiert: Consent-Logging (gesundheitsdaten_consent_at/version/"v1") via init-onboarding, Widerruf-Endpoint /api/consent/revoke (setzt revoked_at + health_connected=false), Widerruf-UI in Profil → Datenschutz. OFFEN: Rechtscheck Consent-Text (Anwalt) + Google-OAuth-Consent (Phase 2). |
| 2026-05-24 | AI-assisted (Claude Sonnet 4.6) | REQ-R-030 implementiert: § 5a KSchG Info-Box in Registrierungsseite Step 1 (vor Formular) eingefügt — 4 Pflichtangaben: Kostenlosigkeit, Funktionalität/Health Connect, Android 8.0+ (minSdkVersion 26), Kündigungsbedingungen. compliance.yaml: kschg-5a-informationspflichten → compliant. |
| 2026-05-24 | AI-assisted (Claude Sonnet 4.6) | GTelG _screening.md vollständig erstellt (v1.0) — RIS-PDF Fassung 24.05.2026 (41 Seiten, alle §§ gescreent). Ergebnis: ❌ nicht anwendbar. Kernbegründung: AustroFit ist kein „Gesundheitsdiensteanbieter" i.S.d. § 2 Z 2 GTelG. Gesamtes Gesetz (ELGA §§ 13–24, eImpfpass §§ 24b–24h, Datensicherheit §§ 3–8, MyHealth@EU §§ 24i–24u) gilt nur für Ärzte, Apotheken, Krankenhäuser etc. Wichtige Abgrenzung dokumentiert: Aktivitätsdaten als Art. 9 DSGVO-Gesundheitsdaten → Pflichten folgen aus DSGVO (bestehender Art. 9-Consent-Workflow korrekt), nicht aus GTelG. Trigger für zukünftige Anwendbarkeit: ELGA-Anbindung, DiGA-Zertifizierung (REQ-P-042), SVS-Direktanbindung (REQ-P-043). compliance.yaml: begruendung + trigger_fuer_anwendbarkeit + notes ausgebaut. |

---

*Legal ground truth: `docs/laws/[gesetz]/` — Artikel-Mappings, Volltext, Audit-Nachweis.*  
*`docs/compliance.yaml` ist die maschinenlesbare Statuszusammenfassung (abgeleitet, mit `law_ref` Pointer).*  
*`docs/requirements/regulatory-requirements.yaml` enthält REQ-IDs für Entwicklungssteuerung und Förderanträge.*
