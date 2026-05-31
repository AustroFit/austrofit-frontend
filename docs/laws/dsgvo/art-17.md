---
law: DSGVO
article: "17"
title: "Recht auf Löschung (Recht auf Vergessenwerden)"
rechtsgrundlage: Verordnung (EU) 2016/679
compliance_ref: dsgvo-art17-loeschung
req_refs: "REQ-R-005"
applicable: true
risk_level: mittel
last_reviewed: 2026-05-23
reviewed_by: "AI-assisted (Claude Sonnet), bestätigt durch: [Name + Datum]"
change_log:
  - date: 2026-05-23
    author: AI-assisted
    change: "Initiale Erstellung. Status: compliant – Kaskaden-Löschung implementiert. Offener Punkt: PostHog-Datenlöschung nicht automatisiert."
---

# Art. 17 – Recht auf Löschung / Recht auf Vergessenwerden (DSGVO)

## Gesetzestext (offiziell, Deutsch)

> **(1)** Die betroffene Person hat das Recht, von dem Verantwortlichen zu verlangen, dass sie betreffende personenbezogene Daten unverzüglich gelöscht werden, und der Verantwortliche ist verpflichtet, personenbezogene Daten unverzüglich zu löschen, sofern einer der folgenden Gründe zutrifft:
>
> **(a)** Die personenbezogenen Daten sind für die Zwecke, für die sie erhoben oder auf sonstige Weise verarbeitet wurden, nicht mehr notwendig.
>
> **(b)** Die betroffene Person widerruft ihre Einwilligung [...] und es fehlt an einer anderweitigen Rechtsgrundlage für die Verarbeitung.
>
> **(c)** Die betroffene Person legt gemäß Artikel 21 Absatz 1 Widerspruch gegen die Verarbeitung ein und es liegen keine vorrangigen berechtigten Gründe für die Verarbeitung vor, oder die betroffene Person legt gemäß Artikel 21 Absatz 2 Widerspruch gegen die Verarbeitung ein.
>
> **(d)** Die personenbezogenen Daten wurden unrechtmäßig verarbeitet.
>
> **(e)** Die Löschung der personenbezogenen Daten ist zur Erfüllung einer rechtlichen Verpflichtung nach dem Unionsrecht oder dem Recht der Mitgliedstaaten erforderlich [...].
>
> **(f)** Die personenbezogenen Daten wurden in Bezug auf angebotene Dienste der Informationsgesellschaft gemäß Artikel 8 Absatz 1 erhoben.
>
> **(2)** Hat der Verantwortliche die personenbezogenen Daten öffentlich gemacht und ist er gemäß Absatz 1 zu deren Löschung verpflichtet, so trifft er unter Berücksichtigung der verfügbaren Technologie und der Implementierungskosten angemessene Maßnahmen [...], um für Daten Verantwortliche, die die personenbezogenen Daten verarbeiten, darüber zu informieren, dass die betroffene Person die Löschung [...] verlangt hat.
>
> **(3)** Die Absätze 1 und 2 gelten nicht, soweit die Verarbeitung erforderlich ist:
>
> **(a)** zur Ausübung des Rechts auf freie Meinungsäußerung und Information;
>
> **(b)** zur Erfüllung einer rechtlichen Verpflichtung [...];
>
> **(c)** aus Gründen des öffentlichen Interesses im Bereich der öffentlichen Gesundheit [...];
>
> **(d)** für im öffentlichen Interesse liegende Archivzwecke, wissenschaftliche oder historische Forschungszwecke oder statistische Zwecke [...];
>
> **(e)** zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen.

*Quelle: Verordnung (EU) 2016/679, Amtsblatt der EU L 119 vom 4.5.2016, S. 43*

---

## AustroFit — Implementierung Kaskaden-Löschung

### Primärer Endpunkt

**`DELETE /api/profile/delete`** — `src/routes/api/profile/delete/+server.ts`

Authentifizierung: Bearer-Token erforderlich (eigener Account). Admin-Token für Directus-User-Löschung.

### Lösch-Kaskade (implementiert)

| Collection / System | Gelöscht? | Methode | Anmerkung |
|---|---|---|---|
| `directus_users` (Konto) | ✅ | DELETE /users/{id} via Admin-Token | Löscht Login, E-Mail, Name |
| `user_profiles` | ✅ | DELETE filter user={id} | Streak, Gesundheitsgruppe, totalSteps |
| `points_ledger` | ✅ | DELETE filter user={id} | Alle Punkte-Buchungen |
| `activity_logs` | ✅ | DELETE filter user_id={id} | Alle Workout-Logs |
| `quiz_attempts` | ⚠️ | — | Anonymous-ID-basiert — kein direkter User-Bezug nach Claim. `points_ledger_ref` gelöscht mit Ledger. |
| `reward_redemptions` | ✅ | DELETE filter user={id} | Alle Gutschein-Einlösungen |
| `consent_log` (geplant) | ⚠️ zu ergänzen | — | Collection noch nicht erstellt; nach Implementation in Kaskade aufnehmen |
| **PostHog Analytics** | ❌ nicht automatisiert | Manuell: PostHog-Dashboard → User löschen | Identifizierung via pseudonymisierter User-ID |
| **Google OAuth** | ✅ n.a. | Google speichert keine AustroFit-Daten | OAuth-Token werden von Google verwaltet |

### Trigger für Löschung

| Trigger | Frist lt. Art. 17 | AustroFit-Umsetzung |
|---|---|---|
| Nutzer löscht Konto (Profil → Account löschen) | unverzüglich | ✅ sofortige Kaskade |
| Widerruf Einwilligung (Health-Daten) | unverzüglich | ⚠️ Widerruf-Flow noch nicht implementiert; manuell via Kontolöschung möglich |
| Anfrage per E-Mail | unverzüglich (max. 1 Monat, Art. 12) | ✅ via kontakt@austrofit.at; Admin kann Konto löschen |

---

## AustroFit-Mapping

### Anforderungen aus Art. 17

| # | Anforderung | Status | Evidence |
|---|---|---|---|
| 1 | Löschung auf Anfrage (Abs. 1) — Self-Service | ✅ | `DELETE /api/profile/delete` — in Profil → Account löschen verfügbar |
| 2 | Kaskaden-Löschung aller verknüpften Daten | ✅ | Kaskade: users, user_profiles, points_ledger, activity_logs, reward_redemptions |
| 3 | Löschung bei Einwilligungswiderruf (lit. b) | ⚠️ partial | Kontolöschung = vollständiger Widerruf. Partieller Widerruf (nur Health-Daten) noch nicht möglich |
| 4 | Unverzügliche Löschung | ✅ | Löschung synchron im API-Call; kein Delay |
| 5 | Dritte informieren (Abs. 2 — soweit öffentlich gemacht) | ✅ n.a. | AustroFit veröffentlicht keine Nutzerdaten an Dritte |
| 6 | PostHog-Daten löschen bei Kontolöschung | ❌ nicht automatisiert | PostHog-Löschung manuell erforderlich (User-ID bekannt) |
| 7 | Neue Datentypen in Kaskade aufnehmen | ⚠️ Prozess nötig | Kein formaler Review-Prozess bei neuen Collections |

### Offene Punkte

- [ ] **PostHog-Löschung automatisieren** — bei Kontolöschung: PostHog Delete Person API aufrufen (`POST /api/person/{distinct_id}/delete/`) → in `/api/profile/delete/+server.ts` integrieren
- [ ] **Partieller Widerruf** (Health-Daten) — nach Art. 9-Consent-Implementierung: separater "Health-Daten widerrufen"-Flow in Profil → Datenschutz; löscht `activity_logs`, Schritte-Einträge in `points_ledger`
- [ ] **`consent_log`** in Lösch-Kaskade aufnehmen — sobald Collection erstellt
- [ ] **Lösch-Prozess dokumentieren** — SOP für manuelle E-Mail-Löschanfragen erstellen (Identitätsverifizierung → Konto-Lookup → Löschung → Bestätigung)
- [ ] **Datenexport vor Löschung** (Art. 20) — Phase-2-Feature: Nutzer soll Datenkopie herunterladen können bevor Konto gelöscht wird

---

## Audit-Nachweis

**Umsetzungsstand:** ✅ compliant (Kernanforderung erfüllt) — mit offenen Punkten für Vollständigkeit

**Primärer Code-Nachweis:**
- `src/routes/api/profile/delete/+server.ts` — Lösch-Endpunkt mit Kaskade ✅
- `src/routes/profil/+page.svelte` — "Konto löschen"-Button im UI ✅

**Bestätigt durch:** — (ausstehend)  
**Nächste Review:** Nach Art. 9-Consent-Implementierung (Widerruf-Flow); bei jeder neuen Collection
