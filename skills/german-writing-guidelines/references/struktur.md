# Struktur und Formatierung

## Planung und Inhaltstyp

- Jede Seite hat einen Plan (Überblick, Ziel, Zielgruppe, Inhaltsplan, offene Fragen), referenziert oder verlinkt
- Inhaltstyp ist benannt: `Tutorial`, `Anleitung`, `Referenz`, `Konzept`, `Fehlerbehebung` oder `Einstieg`; im Frontmatter, falls das Projekt dort ein Feld dafür hat
- Titel aus Lesersicht (die Frage der Leser), nicht aus Featuresicht (der Name aus der Entwicklung)
- Eine Seite, eine Aufgabe: Tutorial ODER Anleitung ODER Referenz, nicht alle drei
- Ziel mit prüfbarem Verb (Bloom): "konfigurieren", "erklären", "debuggen"
- Seiten für mehrere Zielgruppen: kurzer gemeinsamer Einstieg, danach technische Unterabschnitte

## Überschriften

- Normale deutsche Groß- und Kleinschreibung: erstes Wort und Substantive groß, sonst klein. Nie englische Titelschreibung ("Die Wichtigsten Schritte Im Überblick")
- Handlungsüberschriften mit Verb: "Umgebungsvariablen konfigurieren", nicht "Konfiguration von Umgebungsvariablen"
- Eine Form für alle Überschriften eines Inhaltstyps
- Navigationseinträge kurz und in derselben Schreibung; Seitentitel wird zur `H1`
- Unterüberschriften beschreibend, nicht verspielt: "Einschränkungen beim Selbsthosten auf Cloudflare", nicht "Einschränkungen"
- Der Inhalt eines Abschnitts lässt sich allein aus der Überschrift erraten
- Kein Punkt und kein Doppelpunkt am Ende, keine Doppelpunkt-Konstruktionen

## Aufbau

- Jede Seite beginnt mit einem Absatz, der zusammenfasst, was die Seite abdeckt
- Jeder größere Abschnitt beginnt mit einem zusammenfassenden Satz
- Abkürzungen bei der ersten Verwendung ausschreiben: "Content Security Policy (CSP) blockiert Inline-Skripte"
- Referenz nach Oberfläche oder Schnittstelle gliedern, Lerninhalte nach Leseraufgabe
- Absätze mit 2 bis 4 Sätzen; längere oder solche mit zwei Gedanken teilen

## Listen

- Drei oder mehr aufzählbare Punkte in einem Absatz: in eine Liste umwandeln
- Aufzählungszeichen für Ungeordnetes, Nummern für Reihenfolgen (Abläufe, Schritte)
- Liste immer mit einem Satz und Doppelpunkt einleiten
- Kein Punkt am Ende von Listenpunkten, außer es sind ganze Sätze
- Listenpunkte beginnen klein, außer mit Substantiv oder ganzem Satz
- Listenpunkte grammatisch gleich gebaut (alle Infinitive, alle Substantive oder alle Sätze)
- Begriff mit Beschreibung: `- **Begriff**: Beschreibung` (Doppelpunkt nach dem fetten Begriff)
- Ein Schritt, eine Handlung

## Hervorhebung

- **Fett** bedeutet UI-Element oder kritische Tatsache, nie Betonung um der Betonung willen
- Griff zu Fett für den Ton: der Satz ist schwach; umschreiben
- `Inline-Code` für Pfade, Dateiendungen, Bezeichner, kurze Schnipsel: `/api`, `.tsx`, `body`, `query`, `req`
- Regel: sähe es ohne Festbreitenschrift seltsam aus, dann Festbreitenschrift
- Keine Hervorhebung durch GROSSBUCHSTABEN oder Sperrung

## Quelltext-Formatierung

- Absätze nicht hart umbrechen: jeder Absatz ist eine Zeile im Quelltext, der Editor bricht um
- Eine Leerzeile vor Überschriften; eine Leerzeile vor und nach Codeblöcken
- Keine horizontalen Linien (`---`) zwischen Abschnitten
- Keine zusätzlichen Leerzeilen, wo kein Absatzwechsel ist

## Links

- Jeden Begriff bei der ersten Erwähnung erklären und auf seine Konzeptseite verlinken
- Der Linktext nennt das Ziel; nie nackte URLs, nie "hier", "Link" oder "klicke hier"
- Auf die maßgebliche Quelle verlinken, nicht auf Kopien
- Deutsche Dokumente verlinken auf die deutsche Fassung des Ziels, wenn es eine gibt; sonst die Sprache des Ziels angeben: "(englisch)"
