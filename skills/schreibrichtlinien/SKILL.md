---
name: "schreibrichtlinien"
description: "German writing guidelines for technical documentation, adapted from the Vercel Writing Guidelines. Use when reviewing or auditing German docs or prose (Doku prüfen, Schreibstil prüfen, Text gegenlesen) and as the German style baseline alongside write-doc when writing or revising German documentation. Never apply to English documents."
---

# Schreibrichtlinien (Deutsch)

Deutsche Adaption der Vercel Writing Guidelines (vercel-labs/writing-guidelines), angepasst an deutsche Grammatik, Typografie und typische Fehler KI-generierter deutscher Texte.

## Anwendung

- **Prüfen**: die genannten Dateien lesen und gegen die Regeln unten prüfen. Sind keine Dateien genannt, nachfragen. Befunde im Ausgabeformat am Ende melden: knapp, aber vollständig, Stichworte statt ganzer Sätze. Dateien nur ändern, wenn das ausdrücklich verlangt ist.
- **Schreiben**: beim Verfassen oder Überarbeiten deutscher Dokumentation liefert `write-doc` den Dokumentations-Workflow (Brief, Gliederung, Verifikation, Sprachpaare und Dokumenttypen), `writing-style-guide` pflegt `docs/writing/style-guide.md` und `docs/writing/glossary.md`, und diese Richtlinien liefern die deutschen Stil-, Grammatik- und Typografieregeln als Basis. Vor der Abgabe gegen die Liste "Anti-Muster" prüfen.
- Gilt nur für deutsche Dokumente. Englische Dokumente mit den englischen Richtlinien prüfen.

## Vorrang

- `docs/writing/style-guide.md` und `docs/writing/glossary.md` gehen vor, wo sie etwas anderes festlegen (Anrede, Gendern, Fachbegriffe, Zahlenformate).
- Wenn `write-doc` ein Dokument erstellt, gelten dessen Dokumenttypen (`write-doc`) und die Regel, dem Nutzer in seiner eigenen Sprache zu antworten; das deutsche Dokument selbst folgt diesen Schreibrichtlinien.
- Fehlt eine Festlegung: nicht raten, sondern Uneinheitlichkeit im Dokument melden (z. B. Wechsel zwischen `du` und `Sie`)
- Code, Bezeichner, Befehle, Logausgaben und UI-Beschriftungen bleiben in ihrer Originalsprache und werden nicht nach diesen Regeln geprüft

## Regeln

### Planung und Inhaltstyp

- Jede Seite hat einen Plan (Überblick, Ziel, Zielgruppe, Inhaltsplan, offene Fragen), referenziert oder verlinkt
- Inhaltstyp ist benannt: `Tutorial`, `Anleitung`, `Referenz`, `Konzept`, `Fehlerbehebung` oder `Einstieg`; im Frontmatter, falls das Projekt dort ein Feld dafür hat
- Titel aus Lesersicht (die Frage der Leser), nicht aus Featuresicht (der Name aus der Entwicklung)
- Eine Seite, eine Aufgabe: Tutorial ODER Anleitung ODER Referenz, nicht alle drei
- Ziel mit prüfbarem Verb (Bloom): "konfigurieren", "erklären", "debuggen"
- Seiten für mehrere Zielgruppen: kurzer gemeinsamer Einstieg, danach technische Unterabschnitte

### Stimme und Ton

- Aktiv statt Passiv. Test: "von Zombies" anhängen. Ergibt der Satz dann Sinn ("Die Sandbox wird erstellt von Zombies"), umschreiben und den Handelnden nennen
- Direkte Anrede in der Form des Styleguides (`du` oder `Sie`), nie "der Benutzer", "der Anwender" oder "man"
- Anrede im ganzen Dokument einheitlich; `du`, `dein`, `dir` klein
- Imperativ für Schritte: "Klicke auf **Projekt hinzufügen**." bzw. "Klicken Sie auf **Projekt hinzufügen**.", nicht "Du musst nun auf **Projekt hinzufügen** klicken" und nicht "Es muss auf … geklickt werden"
- Eine Form für Schritte im ganzen Korpus: Imperativ oder Infinitiv ("Auf **Projekt hinzufügen** klicken"), nicht gemischt; ohne Festlegung im Styleguide gilt Imperativ
- Sätze unter 20 Wörtern anstreben, höchstens ein Nebensatz pro Satz
- Keine umgangssprachlichen Verschmelzungen ("gibt's", "geht's", "fürs Erste"). Wärme entsteht im Deutschen durch direkte Anrede und Verben, nicht durch Verkürzungen
- Präsens, außer bei tatsächlich zukünftigem Verhalten; kein "wird … werden" für Dinge, die jetzt gelten
- `wir` begrenzen: nur für bewusste Handlungen des Teams ("wir empfehlen", "wir haben … abgekündigt"), nie als Ersatz für die Anrede ("Jetzt legen wir eine Datei an" → "Lege eine Datei an")
- Keine rhetorischen Fragen (klingt nach Werbung)
- Zweitlese-Test: jeden Satz einmal im Sprechtempo lesen; wer zurückspringen muss, benennt Subjekt, Handlung und Folge neu (keine Metaphernverben, keine Pronomen, die mehrere Sätze zurückgreifen)

### Deutsche Stilfallen

- Nominalstil: Verben statt Substantivierungen ("Die Durchführung der Konfiguration erfolgt über …" → "Du konfigurierst … über …")
- Funktionsverbgefüge auflösen: "zur Anwendung bringen" → "anwenden", "eine Prüfung vornehmen" → "prüfen", "in Betrieb nehmen" nur als fester Fachbegriff
- Schachtelsätze: keine eingeschobenen Nebensätze; Hauptaussage in den Hauptsatz, Bedingung davor oder in einen eigenen Satz
- Verbklammer kurz halten: zusammengehörige Verbteile stehen nah beieinander ("Du kannst die Datei, nachdem du sie … und … hast, hochladen" → zwei Sätze)
- Keine Genitivketten ("die Konfiguration der Einstellungen des Dienstes") und keine langen Partizipialattribute ("die vom Server an den Client gesendete Antwort" → Relativsatz oder eigener Satz)
- Modalverben eindeutig: `muss` = Pflicht, `darf nicht` = Verbot, `sollte` = Empfehlung, `kann` = Möglichkeit. Kein `sollte` für Pflichten, kein `muss nicht` für Verbote
- Papierdeutsch streichen: "erfolgt", "mittels", "seitens", "hinsichtlich", "diesbezüglich", "im Rahmen von", "zwecks", "obig", "nachfolgend", "entsprechend" als Füllwort
- `bzw.`, `ggf.`, `etc.`, `usw.` im Fließtext vermeiden: sagen, was gemeint ist ("und", "oder", die konkrete Bedingung, die vollständige Aufzählung)
- Eine Sache, ein Wort: denselben Begriff durchhalten, keine Synonyme zur Abwechslung

### Englische Begriffe und Denglisch

- Das Glossar entscheidet, welche Begriffe englisch bleiben. Etablierte Fachbegriffe nicht zwangsübersetzen ("Pull-Request", nicht "Ziehanforderung")
- Englische Begriffe mit Artikel und Plural laut Glossar, einheitlich ("das Deployment", "die Deployments")
- Zusammensetzungen mit Bindestrich durchkoppeln: "API-Schlüssel", "Pull-Request-Vorlage", "Build-Prozess"; nie mit Leerzeichen ("API Schlüssel", "Deployment Prozess")
- Eingedeutschte Verben einheitlich laut Glossar ("deployen", "deployt", "gemergt"); im Zweifel deutsches Verb ("bereitstellen", "zusammenführen")
- UI-Beschriftungen exakt wie in der Oberfläche, auch wenn sie englisch sind, in Fettschrift
- Lehnübersetzungen aus dem Englischen ersetzen:
  - "Sinn machen" → "sinnvoll sein"
  - "in 2026" → "2026" oder "im Jahr 2026"
  - "das meint" → "das bedeutet"
  - "ein Problem adressieren" → "lösen", "beheben"
  - "nicht wirklich", "am Ende des Tages", "einmal mehr", "unter der Haube" → wörtlich sagen, was gemeint ist
  - "Dies erlaubt dir, … zu …" → "Damit kannst du …"
  - "Fühl dich frei, …" → "Du kannst …"
  - "Bitte beachte, dass …" → streichen und die Aussage direkt nennen
  - "Stelle sicher, dass …" in jedem zweiten Schritt → die konkrete Prüfung nennen ("Prüfe, ob …")
- Besitzpronomen nicht aus dem Englischen übernehmen: "dein Terminal", "dein Browser", "deine Kommandozeile" → Artikel, wo kein Besitz gemeint ist
- Englische Zeichensetzung im Deutschen melden: Komma nach Satzanfang ("Jedoch, …", "Zusätzlich, …", "In diesem Fall, …"), Komma vor `und` in Aufzählungen, fehlendes Komma vor Nebensatz, Genitiv-Apostroph ("Vercel's" → "Vercels")

### Verbotene Wörter

- `einfach`, `simpel`, `leicht`, `schnell`, `mühelos`, `problemlos`, `mal eben`, `nur noch` als Bewertung von Leserhandlungen: setzt Leser unter Druck und klingt nach Werbung; durch konkrete Beschreibung ersetzen ("ein Befehl", "Standardeinstellungen", "die meisten Projekte brauchen das nicht")
- `sehr`, `wirklich`, `eigentlich`, `halt`, `eben`, `natürlich`, `selbstverständlich`, `quasi`, `sozusagen`, `durchaus`, `letztendlich`, `im Grunde`: Füllwörter; streichen oder umschreiben

### Knappheit

- Jedes Detail muss sich verdienen: Zahl, Name oder Implementierungsdetail streichen, wenn eine allgemeinere Formulierung Verständnis und Handlung der Leser nicht ändert
- Weichmacher durch konkrete Zahl oder Aussage ersetzen: `deutlich`, `erheblich`, `viele`, `oft`, `häufig`, `meist`, `typischerweise`, `in der Regel`, `generell`, `grundsätzlich`, `relativ`, `ziemlich`, `unter Umständen`
- Vage Mengenangaben: kein "nahezu null", "im Subsekundenbereich", "die meisten Anfragen", "blitzschnell"; Zahl nennen und belegen ("99,37 % der Anfragen ohne Kaltstart")
- Füll- und Metaphernverben: die Handlung benennen statt Klang zu erzeugen ("durchläuft", "landet", "wandert", "greift", "trifft auf" → der wörtliche Schritt)

### KI-typische Muster (melden)

- Zusammenfassende Übergänge: Absatz nie mit Rückblick auf den vorigen beginnen ("Nachdem wir nun … eingerichtet haben", "Mit dieser Einrichtung …"); direkt zum nächsten Punkt ("In der Praxis …", "Der Haken: …")
- Stakkato: eine zusammenhängende Aussage nicht in Bruchstücke zerlegen ("Früher war das manuell. Jetzt ist es automatisch. Das spart Zeit." → ein Satz); kurze Sätze zur Betonung sind in Ordnung
- Frage-Antwort-Fragmente: "Das Ergebnis? Schnellere Builds." → ein Aussagesatz
- Datenblatt-Stil: Sätze umschreiben, die wie ein Systemprospekt klingen ("bietet", "ermöglicht", "stellt bereit", "verfügt über", "ist konfigurierbar")
- Kaltstart-Absätze: Absatz, dessen erster Satz als Überschrift stehen könnte, hat keinen Anschluss; das vorige Subjekt weiterführen ("Weil …", "Sobald …")
- Vermenschlichte Artefakte: Maschinen führen keine menschlich-körperlichen Handlungen aus ("dem Browser eine URL reichen" → "der Browser ruft die URL ab")
- Wiederverwendete Rahmung: der Aufhänger kommt von dieser Seite, nicht aus einer Schablone ("Die Frage, vor der die meisten Teams stehen, …")
- Floskeln: "in der heutigen (digitalen) Welt", "integraler Bestandteil", "vielfältige Möglichkeiten", "auf das nächste Level heben", "spielt eine entscheidende Rolle", "Grundsätzlich gilt", "Es ist wichtig zu beachten, dass", "Im Folgenden wird gezeigt", "Zusammenfassend lässt sich sagen", "Lass uns gemeinsam …", "eintauchen"
- Werbewörter: `revolutionieren`, `optimiert`, `umfassend`, `nahtlos`, `robust`, `leistungsstark`, `maßgeschneidert`, `ganzheitlich`, `innovativ`
- Satzschablonen: "nicht nur …, sondern auch …", "Es geht nicht um X, sondern um Y", "Egal ob … oder …", Dreierreihen aus Gewohnheit ("schnell, sicher und skalierbar")
- Gedankenstrich-Häufung; Überschriften mit Doppelpunkt ("Docker: Der umfassende Leitfaden"); Emojis in Überschriften
- Gleichförmigkeit im Fließtext: alle Sätze gleich lang, alle Absätze gleich gebaut. Ausnahme: Schritte, Listen und Referenzeinträge sollen gleichförmig sein
- Fazit-Absatz, der nur wiederholt, was darüber steht
- Chatbot-Reste: "Gerne!", "Hier ist …", "Ich hoffe, das hilft"
- Übersetzungsspuren: englische Zeichensetzung, englische Anführungszeichen, Großschreibung englischer Art in Überschriften, Lehnübersetzungen (siehe "Englische Begriffe und Denglisch")
- Typografische Anführungszeichen: `„` und `“` vermeiden, stattdessen gerade Anführungszeichen `""` verwenden

### Ton nach Inhaltstyp

- **Tutorial**: warm, ermutigend, vorhersehbarer Aufbau, keine Fallen
- **Anleitung**: knapp, direkt (Leser sind mitten in der Aufgabe)
- **Referenz**: neutral, vollständig, zitierfähig
- **Konzept**: so erklären, dass Leser es weitergeben können; Beispiele und Vergleiche erwünscht
- **Fehlerbehebung**: verständnisvoll, aber nicht entschuldigend; Problem anerkennen, dann lösen

### Überschriften

- Normale deutsche Groß- und Kleinschreibung: erstes Wort und Substantive groß, sonst klein. Nie englische Titelschreibung ("Die Wichtigsten Schritte Im Überblick")
- Handlungsüberschriften mit Verb: "Umgebungsvariablen konfigurieren", nicht "Konfiguration von Umgebungsvariablen"
- Eine Form für alle Überschriften eines Inhaltstyps
- Navigationseinträge kurz und in derselben Schreibung; Seitentitel wird zur `H1`
- Unterüberschriften beschreibend, nicht verspielt: "Einschränkungen beim Selbsthosten auf Cloudflare", nicht "Einschränkungen"
- Der Inhalt eines Abschnitts lässt sich allein aus der Überschrift erraten
- Kein Punkt und kein Doppelpunkt am Ende, keine Doppelpunkt-Konstruktionen

### Aufbau

- Jede Seite beginnt mit einem Absatz, der zusammenfasst, was die Seite abdeckt
- Jeder größere Abschnitt beginnt mit einem zusammenfassenden Satz
- Abkürzungen bei der ersten Verwendung ausschreiben: "Content Security Policy (CSP) blockiert Inline-Skripte"
- Jeden Begriff bei der ersten Verwendung erklären und auf seine Konzeptseite verlinken
- Referenz nach Oberfläche oder Schnittstelle gliedern, Lerninhalte nach Leseraufgabe
- Absätze mit 2 bis 4 Sätzen; längere oder solche mit zwei Gedanken teilen

### Listen

- Drei oder mehr aufzählbare Punkte in einem Absatz: in eine Liste umwandeln
- Aufzählungszeichen für Ungeordnetes, Nummern für Reihenfolgen (Abläufe, Schritte)
- Liste immer mit einem Satz und Doppelpunkt einleiten
- Kein Punkt am Ende von Listenpunkten, außer es sind ganze Sätze
- Listenpunkte beginnen klein, außer mit Substantiv oder ganzem Satz
- Listenpunkte grammatisch gleich gebaut (alle Infinitive, alle Substantive oder alle Sätze)
- Begriff mit Beschreibung: `- **Begriff**: Beschreibung` (Doppelpunkt nach dem fetten Begriff)
- Ein Schritt, eine Handlung

### Code

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

### Platzhalter

- Textplatzhalter: `snake_case`, sprechend, nur ASCII ohne Umlaute: `dein_zugriffstoken_hier` (per Doppelklick markierbar)
- Zahlenplatzhalter: aufwärts zählen `1234567890123` (als unecht erkennbar)
- Nie `<TOKEN>`, `xxx`, `dein-token` oder generische GROSSBUCHSTABEN
- Eine Platzhaltersprache pro Korpus (deutsch oder englisch), laut Styleguide

### Zahlen, Einheiten und Datum

- Leerzeichen zwischen Zahl und Einheit, immer: `64 KB`, `200 ms`, `30 s`, `99,37 %`
- Dezimalkomma im Fließtext: `1,5 GB`; Punkt nur in Code und zitierten Ausgaben
- Tausendertrennung einheitlich laut Styleguide (`10 000` oder `10.000`)
- Datum als `14.11.2026` oder `14. November 2026`; ISO `2026-11-14` in technischem Zusammenhang; nie `11/14/2026`
- Uhrzeit im 24-Stunden-Format: `13:50 Uhr`
- Einheitlich im ganzen Korpus, damit Leser Suchgewohnheiten entwickeln

### Preise und Abrechnung

- Kompromisslos detailliert: im Zweifel zu viel
- Preise in Tabellen
- Währung nach dem Betrag mit Leerzeichen: `20 €`, `0,40 € pro Stunde`
- Nie voraussetzen, dass Leser das Preismodell kennen oder wissen, ob ihre Last als ein Aufruf oder als mehrere zählt
- Klarheit und Transparenz vor allem anderen

### Hervorhebung

- **Fett** bedeutet UI-Element oder kritische Tatsache, nie Betonung um der Betonung willen
- Griff zu Fett für den Ton: der Satz ist schwach; umschreiben
- `Inline-Code` für Pfade, Dateiendungen, Bezeichner, kurze Schnipsel: `/api`, `.tsx`, `body`, `query`, `req`
- Regel: sähe es ohne Festbreitenschrift seltsam aus, dann Festbreitenschrift
- Keine Hervorhebung durch GROSSBUCHSTABEN oder Sperrung

### Zeichensetzung und Typografie

- Nie Geviertstrich (`—`). Auch Gedankenstrich (`–`) und Bindestrich (`-`) nicht als Satzzeichen: Doppelpunkt, Komma, Punkt verwenden oder umformulieren
- Halbgeviertstrich (`–`) nur als Bis-Strich ohne Leerzeichen: `10–20 Sekunden`
- Gerade Anführungszeichen `"` und `'`, keine typografischen (`„` `“`, `‚` `‘`) und keine englischen (`“` `”`)
- Auslassungszeichen `…`, nicht drei Punkte `...`; mit Leerzeichen davor, wenn Wörter fehlen
- Ladezustände enden mit ` …`: `Wird geladen …`, `Wird gespeichert …`
- Geschützte Leerzeichen in `10 MB`, `99 %`, `z. B.`, `d. h.`, `⌘ K` und in Markennamen
- Nach Doppelpunkt klein weiter, außer es folgt ein ganzer Satz oder ein Substantiv
- Kein Apostroph im Genitiv ("Vercels Plattform") und keiner im Plural ("APIs", nicht "API's")
- `&` statt "und" nur bei Platzmangel (Navigation, Schaltflächen)
- Gendern in der Form des Styleguides und überall gleich; ohne Festlegung Uneinheitlichkeit melden

### Quelltext-Formatierung

- Absätze nicht hart umbrechen: jeder Absatz ist eine Zeile im Quelltext, der Editor bricht um
- Eine Leerzeile vor Überschriften; eine Leerzeile vor und nach Codeblöcken
- Keine horizontalen Linien (`---`) zwischen Abschnitten
- Keine zusätzlichen Leerzeilen, wo kein Absatzwechsel ist

### Links

- Jeden Begriff bei der ersten Erwähnung erklären und auf seine Konzeptseite verlinken
- Der Linktext nennt das Ziel; nie nackte URLs, nie "hier", "Link" oder "klicke hier"
- Auf die maßgebliche Quelle verlinken, nicht auf Kopien
- Deutsche Dokumente verlinken auf die deutsche Fassung des Ziels, wenn es eine gibt; sonst die Sprache des Ziels angeben: "(englisch)"

### Versionen in Beispielen

- Aktuelle Versions- und Modellbezeichner verwenden, keine abgekündigten
- Maßgeblich ist die Version, die das Projekt selbst einsetzt

### Arbeiten mit KI

- Du bist für den Inhalt verantwortlich, egal wie er entstanden ist
- Du entscheidest; das Modell schlägt vor
- Hohe Messlatte für fachliche Richtigkeit: Doku wird auch von LLMs gelesen, falsche Doku erzeugt falsche Antworten
- Nur Modelle einsetzen, die nicht mit deinen Daten trainieren (besonders bei unveröffentlichten Produkten)
- KI-Einsatz im Pull-Request offenlegen (Modell, bei Bedarf Prompts)
- Erst von Hand planen; der Plan ist die Vorgabe, gegen die das Modell arbeitet
- Deutsche Texte direkt auf Deutsch erzeugen lassen, nicht aus einem englischen Entwurf übersetzen
- Das Modell auf `AGENTS.md`, den Styleguide und das Glossar verweisen
- Gegenprobe: "Kann das Modell mit dem Ziel des Plans die Aufgabe allein mit dieser Seite lösen?"
- Am Ende immer eine menschliche Durchsicht durch jemanden, der Deutsch als Erstsprache liest

### Qualitätscheckliste

- **Auffindbarkeit**: Seite ist in der Navigation eingeordnet; die Oberfläche verlinkt dort auf die Doku, wo das Feature sichtbar ist
- **Richtigkeit**: Codebeispiele laufen; Screenshots entsprechen der aktuellen Oberfläche und zeigen ein Demokonto
- **Relevanz**: Codebeispiele vorhanden, wo sie helfen; mehrschrittige Abläufe als Schritte
- **Klarheit**: Überblick beantwortet wer, was, wo, warum; Anwendungsfälle benannt; Voraussetzungen bei Tutorials genannt; Schritte konkret; Bilder an schwierigen Stellen; bei mehreren Wegen der kürzeste empfohlen
- **Vollständigkeit**: Grenzen und Limits dokumentiert; Inhaltsplan eingehalten und Ziele erreicht
- **Lesbarkeit**: Navigationsnamen überfliegbar; Inhaltstypen korrekt verwendet; Unterüberschriften beschreibend; Abschnitte beginnen mit Zusammenfassung; Codeblöcke korrekt formatiert; Aktiv, wo möglich
- **Sprachpaar**: Gibt es eine englische Fassung, stimmen Überschriften, Inhalt und Beispiele überein; die Quellfassung ist benannt

### Review

- Die Pull-Request-Beschreibung verlinkt den Inhaltsplan, nennt, was zu prüfen ist, und verlinkt die Vorschau
- Verantwortlich ist, wer schreibt, nicht wer prüft
- Kleine Textkorrekturen als Änderungsvorschlag, Größeres als Kommentar
- Widerspruch ist in Ordnung: mit einem Satz begründet ablehnen und weitermachen

### Anti-Muster (melden)

- Geviertstrich (`—`) oder Gedankenstrich als Satzzeichen
- `einfach`, `simpel`, `schnell`, `leicht`, `problemlos` als Bewertung von Leserhandlungen
- Passiv ("von Zombies"-Test), "man", "der Benutzer"
- Wechsel zwischen `du` und `Sie`; großgeschriebenes `Du`
- Uneinheitliches Gendern
- Nominalstil und Funktionsverbgefüge ("erfolgt", "Durchführung", "zur Anwendung bringen")
- Schachtelsätze, lange Verbklammern, Genitivketten
- Unklare Modalverben (`sollte` für Pflicht)
- Leerzeichen in Zusammensetzungen ("API Schlüssel")
- Lehnübersetzungen ("Sinn machen", "in 2026", "das meint", "Dies erlaubt dir")
- Englische Kommasetzung ("Jedoch, …"), Genitiv-Apostroph ("Vercel's")
- Englische Titelschreibung in Überschriften
- Typografische oder englische Anführungszeichen (`„` `“`, `“` `”`) statt gerader `""`
- Drei Punkte (`...`) statt `…`; "Wird geladen..." statt "Wird geladen …"
- Einheiten ohne Leerzeichen (`64KB`, `200ms`, `99%`); Dezimalpunkt im Fließtext
- Datum im US-Format
- Generische Platzhalter: `<TOKEN>`, `xxx`, `dein-token`, `ABC123`
- Codeblöcke ohne Sprachangabe; Codeblöcke über 25 Zeilen ohne Prosa dazwischen
- Übersetzte Bezeichner oder Kommentare im Code
- Hart umbrochene Absätze; horizontale Linien zwischen Abschnitten
- Unterüberschriften aus einem generischen Wort: "Überblick", "Hinweise", "Sonstiges"
- Fett als Betonung statt für UI-Element oder kritische Tatsache
- Seite oder Abschnitt ohne einleitende Zusammenfassung
- Abkürzungen vor dem Ausschreiben; `bzw.`, `ggf.`, `etc.` im Fließtext
- "Wir" als Ersatz für die Anrede
- Rhetorische Fragen und Frage-Antwort-Fragmente
- Füllwörter: `sehr`, `wirklich`, `eigentlich`, `natürlich`, `quasi`
- Weichmacher statt konkreter Aussage (`deutlich`, `oft`, `in der Regel`, `grundsätzlich`)
- Vage Mengen ohne belegte Zahl ("nahezu null", "die meisten Anfragen")
- Floskeln und Werbewörter ("in der heutigen Zeit", "nahtlos", "umfassend", "auf das nächste Level heben")
- Satzschablonen ("nicht nur …, sondern auch …")
- Zusammenfassende Übergänge ("Nachdem wir nun …")
- Stakkato-Fragmente; Datenblatt-Stil ("bietet", "ermöglicht", "verfügt über")
- Kaltstart-Absätze ohne Anschluss; vermenschlichte Artefakte
- Füll- und Metaphernverben statt des wörtlichen Schritts ("landet", "durchläuft", "greift")
- Synonyme für denselben Begriff; Begriffe, die vom Glossar abweichen
- Sprachmischung im Fließtext außerhalb von Fachbegriffen, Code und UI-Beschriftungen
- Sätze, die ein zweites Lesen brauchen
- Absätze über 4 Sätze oder mit zwei Gedanken
- Nackte URLs oder "hier" als Linktext
- Verweis auf "die vollständige Beispieldatei am Ende" statt Code im Text
- Veraltete Versions- oder Modellbezeichner in Beispielen
- Fest codierte Datums- und Zahlenformate in Codebeispielen

## Ausgabeformat

Nach Datei gruppieren. Format `datei:zeile` (in VS Code anklickbar). Knappe Befunde auf Deutsch.

```text
## docs/anleitungen/sandbox.md

docs/anleitungen/sandbox.md:1 - Inhaltstyp fehlt
docs/anleitungen/sandbox.md:12 - Titel "Sandbox" aus Featuresicht, nicht aus Lesersicht
docs/anleitungen/sandbox.md:24 - Passiv ("Die Sandbox wird erstellt …")
docs/anleitungen/sandbox.md:31 - verbotenes Wort "einfach"
docs/anleitungen/sandbox.md:38 - Nominalstil ("Die Durchführung der Konfiguration erfolgt") → "Du konfigurierst"
docs/anleitungen/sandbox.md:47 - "..." → "…"
docs/anleitungen/sandbox.md:58 - Codeblock ohne Sprachangabe
docs/anleitungen/sandbox.md:71 - Platzhalter <TOKEN> → dein_zugriffstoken_hier
docs/anleitungen/sandbox.md:89 - "64KB" → "64 KB"
docs/anleitungen/sandbox.md:102 - H2 "Hinweise" zu generisch
docs/anleitungen/sandbox.md:118 - Gedankenstrich als Satzzeichen → Doppelpunkt oder Komma

## docs/konzepte/gateway.md

docs/konzepte/gateway.md:5 - englische Titelschreibung in H1
docs/konzepte/gateway.md:9 - Wechsel von "du" zu "Sie"
docs/konzepte/gateway.md:18 - "API Schlüssel" → "API-Schlüssel"
docs/konzepte/gateway.md:27 - Lehnübersetzung "macht Sinn" → "ist sinnvoll"
docs/konzepte/gateway.md:34 - Fett als Betonung, kein UI-Element
docs/konzepte/gateway.md:52 - Floskel "nahtlos"; konkret sagen, was passiert
docs/konzepte/gateway.md:71 - hart umbrochener Absatz (Zeilen 71-74)

## docs/referenz/cron.md

✓ in Ordnung
```

Befund und Stelle nennen. Erklärung nur, wenn die Korrektur nicht offensichtlich ist. Keine Einleitung.
