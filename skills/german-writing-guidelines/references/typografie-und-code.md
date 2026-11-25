# Typografie, Zahlen, Code und Platzhalter

## Zeichensetzung und Typografie

- Nie Geviertstrich (`—`). Auch Gedankenstrich (`–`) und Bindestrich (`-`) nicht als Satzzeichen: Doppelpunkt, Komma, Punkt verwenden oder umformulieren
- Halbgeviertstrich (`–`) nur als Bis-Strich ohne Leerzeichen: `10–20 Sekunden`
- Anführungszeichen laut Styleguide. Ohne Festlegung gerade `"` und `'`: Beispiele und Suchbegriffe bleiben im Quelltext kopier- und durchsuchbar. Verlangt der Styleguide `„…“`, gilt das einheitlich. Englische `“…”` nie in deutschen Texten
- Auslassungszeichen `…`, nicht drei Punkte `...`; mit Leerzeichen davor, wenn Wörter fehlen
- Ladezustände enden mit ` …`: `Wird geladen …`, `Wird gespeichert …`
- Geschützte Leerzeichen in `10 MB`, `99 %`, `z. B.`, `d. h.`, `⌘ K` und in Markennamen
- Nach Doppelpunkt klein weiter, außer es folgt ein ganzer Satz oder ein Substantiv
- Kein Apostroph im Genitiv ("Vercels Plattform") und keiner im Plural ("APIs", nicht "API's")
- `&` statt "und" nur bei Platzmangel (Navigation, Schaltflächen)
- Gendern in der Form des Styleguides und überall gleich; ohne Festlegung Uneinheitlichkeit melden

## Zahlen, Einheiten und Datum

- Leerzeichen zwischen Zahl und Einheit, immer: `64 KB`, `200 ms`, `30 s`, `99,37 %`
- Dezimalkomma im Fließtext: `1,5 GB`; Punkt nur in Code und zitierten Ausgaben
- Tausendertrennung einheitlich laut Styleguide (`10 000` oder `10.000`)
- Datum als `14.11.2026` oder `14. November 2026`; ISO `2026-11-14` in technischem Zusammenhang; nie `11/14/2026`
- Uhrzeit im 24-Stunden-Format: `13:50 Uhr`
- Einheitlich im ganzen Korpus, damit Leser Suchgewohnheiten entwickeln

## Platzhalter

- Textplatzhalter: `snake_case`, sprechend, nur ASCII ohne Umlaute: `dein_zugriffstoken_hier` (per Doppelklick markierbar)
- Zahlenplatzhalter: aufwärts zählen `1234567890123` (als unecht erkennbar)
- Nie `<TOKEN>`, `xxx`, `dein-token` oder generische GROSSBUCHSTABEN
- Eine Platzhaltersprache pro Korpus (deutsch oder englisch), laut Styleguide

## Code

- Codeblöcke brauchen eine Sprachangabe für die Syntaxhervorhebung
- Standardsprache des Projekts für neue Beispiele verwenden
- Mehrschrittige Abläufe als nummerierte Schritte oder mit der Schritt-Komponente des Projekts, damit die Struktur sichtbar ist
- Tragende Zeilen hervorheben, wenn das Format es erlaubt
- Höchstens 80 Spalten pro Zeile
- Höchstens 25 Zeilen pro Block; längere Blöcke durch Prosa teilen
- Standardwerte weglassen; Variablendefinitionen nicht wiederholen
- Wenige Kommentare im Code; Erklärung gehört in die Prosa
- Kommentare und Bezeichner im Code in der Sprache der Codebasis, nicht ins Deutsche übersetzen
- Zu jedem Codeblock in Prosa erklären, was er tut
- Nicht am Ende auf vollständige Beispieldateien verweisen ("siehe `train.py`"); die Anleitung ist das Ergebnis
- Zahlen und Daten in Codebeispielen locale-abhängig formatieren (`Intl.DateTimeFormat`, `Intl.NumberFormat` oder das Gegenstück der Sprache), nicht fest codieren

## Versionen in Beispielen

- Aktuelle Versions- und Modellbezeichner verwenden, keine abgekündigten
- Maßgeblich ist die Version, die das Projekt selbst einsetzt
