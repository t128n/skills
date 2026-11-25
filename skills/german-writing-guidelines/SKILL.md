---
name: german-writing-guidelines
description: "Apply German style, grammar and typography rules to technical documents, adapted from the Vercel Writing Guidelines. Use when reviewing a German document, or as the German baseline when writing German prose with write-documentation, write-rfc, write-briefing or write-message. Never for English documents."
---

# Schreibrichtlinien (Deutsch)

Deutsche Adaption der Vercel Writing Guidelines (vercel-labs/writing-guidelines), angepasst an deutsche Grammatik, Typografie und typische Fehler KI-generierter deutscher Texte.

## Anwendung

- **Prüfen**: die genannten Dateien lesen und gegen die Regeln prüfen. Sind keine Dateien genannt, nachfragen. Befunde im Ausgabeformat unten melden. Dateien nur ändern, wenn das ausdrücklich verlangt ist.
- **Schreiben**: der Workflow kommt vom aufrufenden Skill (`write-documentation`, `write-rfc`, `write-briefing`, `write-message`), diese Richtlinien liefern Stil, Grammatik und Typografie. Vor der Abgabe die Fehler-Regeln unten gegenlesen.
- Gilt nur für deutsche Dokumente. Englische Dokumente folgen dem Styleguide des Projekts.

## Vorrang

- `docs/WRITING_STYLE.md` und `GLOSSARY.md` gehen vor, wo sie etwas anderes festlegen (Anrede, Gendern, Fachbegriffe, Zahlenformate, Anführungszeichen)
- Der aufrufende Skill bestimmt Dokumenttyp, Struktur und Antwortsprache. Bei `write-message` geht `~/.agents/writing-style.md` vor (Anrede, Grußformel, Wörter)
- Fehlt eine Festlegung: nicht raten, sondern Uneinheitlichkeit im Dokument melden (z. B. Wechsel zwischen `du` und `Sie`)
- Code, Bezeichner, Befehle, Logausgaben und UI-Beschriftungen bleiben in ihrer Originalsprache und werden nicht nach diesen Regeln geprüft
- Ausnahme für `write-message`: die Angabe "— from opencode" bleibt unverändert, obwohl sie einen Gedankenstrich enthält

## Vorgehen beim Prüfen

1. Mechanische Treffer sammeln: `python3 <skill-verzeichnis>/scripts/lint.py <dateien>`. Der Linter überspringt Code und Frontmatter und meldet Kandidaten, keine Urteile. Jeden Treffer prüfen: "einfache Datenstruktur" ist erlaubt.
2. Das Dokument einmal je Referenz lesen, weil ein einziger Durchgang über alles Befunde übersieht:
   - `references/stil-und-ton.md`: Stimme, Nominalstil, Denglisch, Füllwörter, KI-Muster
   - `references/struktur.md`: Inhaltstyp, Überschriften, Aufbau, Listen, Hervorhebung, Links
   - `references/typografie-und-code.md`: Satzzeichen, Zahlen, Datum, Platzhalter, Codeblöcke
3. Befunde nach Schwere melden.

## Schwere

- **Fehler** `[F]`: objektiv falsch oder regelwidrig. Wechsel `du`/`Sie`, uneinheitliches Gendern, `sollte` für Pflichten, Begriff weicht vom Glossar ab oder wechselt als Synonym, Leerzeichen in Zusammensetzungen, Gedankenstrich als Satzzeichen, Einheiten ohne Leerzeichen, US-Datum, generische Platzhalter, Codeblock ohne Sprachangabe, nackte URLs, englische Zeichensetzung, Lehnübersetzungen
- **Stil** `[S]`: verbessert den Text, ist aber Geschmack. Weichmacher, Füllwörter, Floskeln, Datenblatt-Stil, Nominalstil, Satzbau, Absatzlänge, Rhythmus, KI-Muster

Fehler zuerst melden. Stil-Befunde bündeln, wenn dasselbe Muster mehrfach vorkommt ("Füllwörter: Z. 12, 18, 31").

## Ausgabeformat

Nach Datei gruppieren. Format `datei:zeile - [F|S] Befund`. Knappe Befunde auf Deutsch, Fehler vor Stil. Erklärung nur, wenn die Korrektur nicht offensichtlich ist. Keine Einleitung, kein Nachsatz, keine Rückfrage.

```text
## docs/anleitungen/sandbox.md

docs/anleitungen/sandbox.md:1 - [F] Inhaltstyp fehlt
docs/anleitungen/sandbox.md:12 - [F] Titel "Sandbox" aus Featuresicht, nicht aus Lesersicht
docs/anleitungen/sandbox.md:47 - [F] "..." → "…"
docs/anleitungen/sandbox.md:58 - [F] Codeblock ohne Sprachangabe
docs/anleitungen/sandbox.md:71 - [F] Platzhalter <TOKEN> → dein_zugriffstoken_hier
docs/anleitungen/sandbox.md:24 - [S] Passiv ("Die Sandbox wird erstellt …")
docs/anleitungen/sandbox.md:38 - [S] Nominalstil ("Die Durchführung der Konfiguration erfolgt") → "Du konfigurierst"

## docs/referenz/cron.md

✓ in Ordnung
```
