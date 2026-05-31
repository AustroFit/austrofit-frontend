# AustroFit – Regulatory Law Filing System: Schema & Anleitung

## Übersicht der Dateistruktur

```
docs/laws/
├── _SCHEMA.md                     ← dieses Dokument (Referenz für alle Gesetze)
├── _index.md                      ← Audit-ready Übersichtstabelle (von Claude bei jeder Änderung mitgepflegt)
├── dsgvo/
│   ├── _screening.md              ← ALLE Artikel: applicable true/false + Kontext
│   ├── art-04.md                  ← Volltext nur für anwendbare Artikel
│   ├── art-05.md
│   ├── art-06.md
│   └── ...
├── tkg2021/
│   ├── _screening.md
│   └── ...
├── mdr/
│   └── _screening.md              ← nur Screening (nicht anwendbar, aber begründet)
└── ...
```

## Rollen und Source of Truth

| Dokument | Rolle | Source of Truth für |
|---|---|---|
| `docs/laws/[gesetz]/` | **Legal ground truth** – Volltext, Artikel-Mapping, Audit-Nachweis | Alle rechtlichen Details, Applicability-Argumente, Evidence |
| `docs/compliance.yaml` | **Maschinenlesbare Statuszusammenfassung** – Status + `law_ref` Pointer | Entwicklungssteuerung, Feature-Checks |
| `docs/requirements/regulatory-requirements.yaml` | **Entwicklungsaufgaben** – REQ-IDs, Prioritäten | Sprint-Planung, Förderanträge |

Statusänderungen passieren primär in `docs/laws/`, `compliance.yaml` wird synchron gehalten.

---

## Zweck der zwei Ebenen

| Datei | Zweck | Größe | Wer liest es |
|---|---|---|---|
| `_screening.md` | Vollständige Artikelliste mit Applicability-Check | Kompakt (~1 Seite/Gesetz) | Claude (immer im Kontext), Auditor (Übersicht) |
| `art-XX.md` | Volltext + AustroFit-Mapping + Nachweislog | Ausführlich | Claude (bei Detailarbeit), Anwalt, Behörde |

---

## Schema: `_screening.md`

```markdown
---
law: [Kurzname, z.B. DSGVO]
title: [Vollständiger Name]
rechtsgrundlage: [z.B. Verordnung (EU) 2016/679]
source_ref: [OJ/BGBl-Referenz + CELEX-Nummer falls EU]
source_date: [Datum der verwendeten Fassung, ISO]
source_url: [URL zur offiziellen Quelle]
screened_by: "AI-assisted (Claude), bestätigt durch: [Name + Datum]"  # PFLICHT: muss von Johannes oder Rechtsanwalt inhaltlich bestätigt werden
screened_date: [ISO-Datum]
last_reviewed: [ISO-Datum]
version: "1.0"
---

# [Gesetzname] – Artikel-Screening (AustroFit)

## Screening-Legende
- `✅ anwendbar` – Pflichten oder Rechte die AustroFit direkt betreffen
- `⚠️ bedingt` – Anwendbar nur unter bestimmten Bedingungen (trigger_conditions)
- `❌ nicht anwendbar` – Mit Begründung; aber Trigger-Bedingungen dokumentiert
- `📋 referenz` – Kein Pflichtenartikel, aber Definitionsgrundlage

---

## Kapitel X – [Kapitelname]

### Art. N – [Artikeltitel]
**Status:** ✅ anwendbar | ⚠️ bedingt | ❌ nicht anwendbar | 📋 referenz  
**compliance_ref:** [ID in docs/compliance.yaml, z.B. dsgvo-art9-consent]  
**Kurzinhalt:** [1-2 Sätze was der Artikel regelt – sprachlich nah am Gesetzestext]  
**AustroFit-Relevanz:** [Warum anwendbar oder warum nicht – AustroFit-spezifisch]  
**Trigger für neue Features:** [Unter welchen Umständen wird der Artikel relevant, auch wenn aktuell ❌]  
**Volltext-Datei:** [art-NN.md | —]
```

---

## Schema: `art-XX.md`

```markdown
---
law: [Kurzname]
article: [Nummer, z.B. "9"]
title: [Artikeltitel]
compliance_ref: [ID in docs/compliance.yaml]
req_refs: [REQ-IDs in docs/requirements/regulatory-requirements.yaml, kommagetrennt]
applicable: true
last_reviewed: [ISO-Datum]
reviewed_by: "AI-assisted (Claude), bestätigt durch: [Name + Datum]"  # PFLICHT: juristisch verbindlich erst nach menschlicher Bestätigung
change_log:
  - date: [ISO]
    author: [Name]
    change: [Was geändert/geprüft wurde]
---

# Art. [N] – [Titel] ([Gesetzname])

## Gesetzestext (offiziell, [Sprache])

> [Vollständiger Artikeltext – wörtlich aus der offiziellen Quelle]
> Quelle: [rechtsgrundlage], [source_ref]

---

## AustroFit-Mapping

### Anforderungen die sich aus diesem Artikel ergeben

| # | Anforderung | Status | Evidence | REQ-Ref |
|---|---|---|---|---|
| 1 | [Konkrete Pflicht] | compliant / partial / open | [Nachweis] | [REQ-R-XXX] |

### Offene Punkte
- [ ] [Offene Maßnahme mit Frist]

### Abgrenzung / Nicht-Anwendungsfälle
[Was AustroFit NICHT tut, das relevant wäre – z.B. "kein Profiling nach Art. 22, da..."]

---

## Audit-Nachweis

**Umsetzungsstand:** [compliant | partial | open]  
**Primärer Nachweis:**
- [Pfad zu Code/Dokument]

**Sekundärer Nachweis:**
- [AVV, TOM-Dokument, etc.]

**Bestätigt durch:** [Name, Datum]  
**Nächste Review:** [Datum oder Trigger, z.B. "bei Änderung Health Connect Integration"]
```

---

## Schema: `_index.md`

Wird in `docs/laws/_index.md` gepflegt – Übersichtstabelle aller Gesetze.
Struktur: siehe `docs/laws/_index.md`.

---

## Claude-Anleitung (für VS Code)

### Neues Feature prüfen
1. `_screening.md` des relevanten Gesetzes lesen
2. Artikel mit `⚠️ bedingt` und `trigger_conditions` prüfen
3. Falls Trigger zutrifft → `art-XX.md` öffnen oder neu anlegen
4. `compliance.yaml` und `regulatory-requirements.yaml` aktualisieren

### Gesetzesänderung verarbeiten
1. Neue offizielle Fassung als PDF in `docs/laws/[gesetz]/` ablegen (Git LFS empfohlen für Binaries > 1 MB: `git lfs track "*.pdf"`)
2. `source_date` im Frontmatter aktualisieren — dieser Wert ist der **Versionsanker**: er dokumentiert gegen welche Fassung implementiert wurde, nicht die aktuelle Fassung auf EUR-Lex/RIS
3. `_screening.md` → `last_reviewed` aktualisieren
4. Geänderte Artikel identifizieren → betroffene `art-XX.md` updaten
5. Gap-Analyse: Hat sich die Applicability geändert?
6. `compliance.yaml` Status synchronisieren
7. `_index.md` aktualisieren

### Audit vorbereiten
1. `docs/laws/_index.md` exportieren (Übersichtstabelle)
2. Alle `art-XX.md` der relevanten Gesetze zusammenstellen
3. `docs/compliance.yaml` als maschinenlesbare Basis beifügen
