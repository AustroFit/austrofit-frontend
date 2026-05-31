---
law: DSGVO
article: "6"
title: "Rechtmäßigkeit der Verarbeitung"
rechtsgrundlage: Verordnung (EU) 2016/679
compliance_ref: dsgvo-art13-dse
req_refs: "REQ-R-003"
applicable: true
risk_level: hoch
last_reviewed: 2026-05-23
reviewed_by: "AI-assisted (Claude Sonnet), bestätigt durch: [Name + Datum]"
change_log:
  - date: 2026-05-23
    author: AI-assisted
    change: "Initiale Erstellung. Rechtsgrundlagen-Mapping aller AustroFit-Verarbeitungen. Status: partial – Art. 9-Consent noch nicht implementiert."
---

# Art. 6 – Rechtmäßigkeit der Verarbeitung (DSGVO)

## Gesetzestext (offiziell, Deutsch)

> **(1)** Die Verarbeitung ist nur rechtmäßig, wenn mindestens eine der nachstehenden Bedingungen erfüllt ist:
>
> **(a)** Die betroffene Person hat ihre **Einwilligung** zu der Verarbeitung der sie betreffenden personenbezogenen Daten für einen oder mehrere bestimmte Zwecke gegeben;
>
> **(b)** die Verarbeitung ist für die **Erfüllung eines Vertrags**, dessen Vertragspartei die betroffene Person ist, oder zur Durchführung vorvertraglicher Maßnahmen erforderlich, die auf Anfrage der betroffenen Person erfolgen;
>
> **(c)** die Verarbeitung ist zur **Erfüllung einer rechtlichen Verpflichtung** erforderlich, der der Verantwortliche unterliegt;
>
> **(d)** die Verarbeitung ist erforderlich, um **lebenswichtige Interessen** der betroffenen Person oder einer anderen natürlichen Person zu schützen;
>
> **(e)** die Verarbeitung ist für die Wahrnehmung einer Aufgabe erforderlich, die **im öffentlichen Interesse** liegt oder in Ausübung öffentlicher Gewalt erfolgt, die dem Verantwortlichen übertragen wurde;
>
> **(f)** die Verarbeitung ist zur Wahrung der **berechtigten Interessen** des Verantwortlichen oder eines Dritten erforderlich, sofern nicht die Interessen oder Grundrechte und Grundfreiheiten der betroffenen Person, die den Schutz personenbezogener Daten erfordern, überwiegen, insbesondere dann, wenn es sich bei der betroffenen Person um ein Kind handelt.
>
> Unterabsatz 1 Buchstabe f gilt nicht für die von Behörden in Erfüllung ihrer Aufgaben vorgenommene Verarbeitung.

*Quelle: Verordnung (EU) 2016/679, Amtsblatt der EU L 119 vom 4.5.2016, S. 36*

**Wichtig:** Für besondere Kategorien (Art. 9 — Gesundheitsdaten) ist Art. 6 Abs. 1 allein **nicht ausreichend**. Zusätzlich muss eine Ausnahme nach Art. 9 Abs. 2 vorliegen.

---

## AustroFit — Rechtsgrundlagen-Mapping

### Übersicht aller Verarbeitungstätigkeiten

| Verarbeitungstätigkeit | Rechtsgrundlage Art. 6 | Zusatz Art. 9 | DSE-Eintrag | Status |
|---|---|---|---|---|
| Nutzerregistrierung (E-Mail, Name, Passwort) | **lit. b** — Vertragserfüllung | — | ✅ | ✅ |
| Schritte-Tracking (Health Connect) | **lit. a** — Einwilligung | Art. 9 Abs. 2 lit. a | ✅ | ⚠️ partial (Consent-Dialog fehlt) |
| Workout-Tracking (Health Connect) | **lit. a** — Einwilligung | Art. 9 Abs. 2 lit. a | ✅ | ⚠️ partial (Consent-Dialog fehlt) |
| Aktivitätsgruppe adult/senior | **lit. b** — Vertragserfüllung | — | ✅ | ✅ |
| Aktivitätsgruppe pregnant/chronic | **lit. a** — Einwilligung | Art. 9 Abs. 2 lit. a | ✅ | ❌ kein Consent-Dialog |
| Punkte-Ledger, Badges, Level | **lit. b** — Vertragserfüllung | — | ✅ | ✅ |
| Quiz-Attempts (anonym) | **lit. b** — Vertragserfüllung | — | ✅ | ✅ |
| Quiz-Claim (User-Verknüpfung) | **lit. b** — Vertragserfüllung | — | ✅ | ✅ |
| Analytics (PostHog) | **lit. a** — Einwilligung | — | ✅ | ✅ |
| Belohnungen / Gutscheineinlösung | **lit. b** — Vertragserfüllung | — | ✅ | ✅ |
| Impressum, DSE bereitstellen | **lit. c** — rechtl. Verpflichtung (ECG) | — | — | ✅ |
| Google OAuth — Login | **lit. b** — Vertragserfüllung | — | ✅ | ✅ |

### Explizit ausgeschlossene Rechtsgrundlagen

| Rechtsgrundlage | Warum nicht für AustroFit |
|---|---|
| **lit. d** — lebenswichtige Interessen | Kein Notfall-Kontext |
| **lit. e** — öffentliches Interesse | AustroFit ist privater Betreiber |
| **lit. f** — berechtigte Interessen | Nicht für Gesundheitsdaten zulässig (Art. 9 sperrt lit. f für besondere Kategorien). Für normale Daten theoretisch möglich, wird aber nicht verwendet. |

---

## AustroFit-Mapping

### Anforderungen aus Art. 6

| # | Anforderung | Status | Evidence |
|---|---|---|---|
| 1 | Jede Verarbeitung hat dokumentierte Rechtsgrundlage | ✅ | DSE Mai 2026; dieses Dokument (Mapping-Tabelle) |
| 2 | Rechtsgrundlage vor Beginn der Verarbeitung feststehen | ⚠️ partial | Für neue Features: Prozess ist noch informell — kein formaler Pre-Implementation-Check |
| 3 | Keine Verarbeitung auf lit. f für Gesundheitsdaten | ✅ | Art. 9-Daten: ausschließlich lit. a (Einwilligung) |
| 4 | Einwilligung nach Art. 7 (für lit. a-Fälle) | ⚠️ partial | Analytics ✅; Art. 9-Consent fehlt (→ art-07.md) |
| 5 | Zweckänderung nur kompatibel (Art. 6 Abs. 4) | ✅ | Kein Zweckwechsel geplant; alle Zwecke in DSE festgelegt |
| 6 | DSE benennt Rechtsgrundlage pro Verarbeitung | ✅ | DSE Mai 2026 dokumentiert Rechtsgrundlagen ✅ |

### Offene Punkte

- [ ] **Art. 9-Consent implementieren** — für Schritte, Workouts, pregnant/chronic: lit. a erfordert gültige Einwilligung nach Art. 7 (→ `art-07.md`)
- [ ] **Feature-Review-Prozess** — vor jeder neuen Verarbeitungstätigkeit: dokumentierte Rechtsgrundlage festlegen bevor Implementation beginnt (in `docs/features.yaml` oder als REQ-R-ID)

---

## Audit-Nachweis

**Umsetzungsstand:** ⚠️ partial — Rechtsgrundlagen dokumentiert, Art. 9-Consent-Implementierung ausstehend

**Primäre Dokumente:**
- `src/routes/datenschutz/+page.svelte` — DSE (Rechtsgrundlagen je Zweck aufgelistet ✅)
- `docs/laws/dsgvo/art-07.md` — Consent-Anforderungen
- `docs/laws/dsgvo/art-09.md` — Gesundheitsdaten-Klassifikation
- `docs/laws/dsgvo/art-30.md` — VVT (Rechtsgrundlage pro Tätigkeit dokumentiert)

**Bestätigt durch:** — (ausstehend)  
**Nächste Review:** Nach Art. 9-Consent-Implementierung; bei jeder neuen Verarbeitungstätigkeit
