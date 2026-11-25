# Stil, Ton und Wortwahl

## Stimme und Ton

- Aktiv statt Passiv. Test: "von Zombies" anhängen. Ergibt der Satz dann Sinn ("Die Sandbox wird erstellt von Zombies"), umschreiben und den Handelnden nennen
- Direkte Anrede in der Form des Styleguides (`du` oder `Sie`), nie "der Benutzer", "der Anwender" oder "man"
- Anrede im ganzen Dokument einheitlich; `du`, `dein`, `dir` klein
- Imperativ für Schritte: "Klicke auf **Projekt hinzufügen**." bzw. "Klicken Sie auf **Projekt hinzufügen**.", nicht "Du musst nun auf **Projekt hinzufügen** klicken" und nicht "Es muss auf … geklickt werden"
- Eine Form für Schritte im ganzen Korpus: Imperativ oder Infinitiv ("Auf **Projekt hinzufügen** klicken"), nicht gemischt; ohne Festlegung im Styleguide gilt Imperativ
- Richtwert: Sätze unter 20 Wörtern, höchstens ein Nebensatz pro Satz. Im Fließtext die Länge variieren; nicht jeder Satz muss kurz sein
- Keine umgangssprachlichen Verschmelzungen ("gibt's", "geht's", "fürs Erste"). Wärme entsteht im Deutschen durch direkte Anrede und Verben, nicht durch Verkürzungen
- Präsens, außer bei tatsächlich zukünftigem Verhalten; kein "wird … werden" für Dinge, die jetzt gelten
- `wir` begrenzen: nur für bewusste Handlungen des Teams ("wir empfehlen", "wir haben … abgekündigt"), nie als Ersatz für die Anrede ("Jetzt legen wir eine Datei an" → "Lege eine Datei an")
- Keine rhetorischen Fragen (klingt nach Werbung)
- Zweitlese-Test: jeden Satz einmal im Sprechtempo lesen; wer zurückspringen muss, benennt Subjekt, Handlung und Folge neu (keine Metaphernverben, keine Pronomen, die mehrere Sätze zurückgreifen)

## Deutsche Stilfallen

- Nominalstil: Verben statt Substantivierungen ("Die Durchführung der Konfiguration erfolgt über …" → "Du konfigurierst … über …")
- Funktionsverbgefüge auflösen: "zur Anwendung bringen" → "anwenden", "eine Prüfung vornehmen" → "prüfen", "in Betrieb nehmen" nur als fester Fachbegriff
- Schachtelsätze: keine eingeschobenen Nebensätze; Hauptaussage in den Hauptsatz, Bedingung davor oder in einen eigenen Satz
- Verbklammer kurz halten: zusammengehörige Verbteile stehen nah beieinander ("Du kannst die Datei, nachdem du sie … und … hast, hochladen" → zwei Sätze)
- Keine Genitivketten ("die Konfiguration der Einstellungen des Dienstes") und keine langen Partizipialattribute ("die vom Server an den Client gesendete Antwort" → Relativsatz oder eigener Satz)
- Modalverben eindeutig: `muss` = Pflicht, `darf nicht` = Verbot, `sollte` = Empfehlung, `kann` = Möglichkeit. Kein `sollte` für Pflichten, kein `muss nicht` für Verbote
- Papierdeutsch streichen: "erfolgt", "mittels", "seitens", "hinsichtlich", "diesbezüglich", "im Rahmen von", "zwecks", "obig", "nachfolgend", "entsprechend" als Füllwort
- `bzw.`, `ggf.`, `etc.`, `usw.` im Fließtext vermeiden: sagen, was gemeint ist ("und", "oder", die konkrete Bedingung, die vollständige Aufzählung)
- Eine Sache, ein Wort: denselben Begriff durchhalten, keine Synonyme zur Abwechslung

## Englische Begriffe und Denglisch

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

## Verbotene Wörter

- `einfach`, `simpel`, `leicht`, `schnell`, `mühelos`, `problemlos`, `mal eben`, `nur noch` als Bewertung von Leserhandlungen: setzt Leser unter Druck und klingt nach Werbung; durch konkrete Beschreibung ersetzen ("ein Befehl", "Standardeinstellungen", "die meisten Projekte brauchen das nicht")
- `sehr`, `wirklich`, `eigentlich`, `halt`, `eben`, `natürlich`, `selbstverständlich`, `quasi`, `sozusagen`, `durchaus`, `letztendlich`, `im Grunde`: Füllwörter; streichen oder umschreiben

## Knappheit

- Jedes Detail muss sich verdienen: Zahl, Name oder Implementierungsdetail streichen, wenn eine allgemeinere Formulierung Verständnis und Handlung der Leser nicht ändert
- Weichmacher durch konkrete Zahl oder Aussage ersetzen: `deutlich`, `erheblich`, `viele`, `oft`, `häufig`, `meist`, `typischerweise`, `in der Regel`, `generell`, `grundsätzlich`, `relativ`, `ziemlich`, `unter Umständen`
- Vage Mengenangaben: kein "nahezu null", "im Subsekundenbereich", "die meisten Anfragen", "blitzschnell"; Zahl nennen und belegen ("99,37 % der Anfragen ohne Kaltstart")
- Füll- und Metaphernverben: die Handlung benennen statt Klang zu erzeugen ("durchläuft", "landet", "wandert", "greift", "trifft auf" → der wörtliche Schritt)

## KI-typische Muster (melden)

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
- Überschriften mit Doppelpunkt ("Docker: Der umfassende Leitfaden"); Emojis in Überschriften
- Gleichförmigkeit im Fließtext: alle Sätze gleich lang, alle Absätze gleich gebaut. Ausnahme: Schritte, Listen und Referenzeinträge sollen gleichförmig sein
- Fazit-Absatz, der nur wiederholt, was darüber steht
- Chatbot-Reste: "Gerne!", "Hier ist …", "Ich hoffe, das hilft"
- Übersetzungsspuren: englische Zeichensetzung, englische Anführungszeichen (Regel in `typografie-und-code.md`), Großschreibung englischer Art in Überschriften, Lehnübersetzungen (siehe "Englische Begriffe und Denglisch")

## Ton nach Inhaltstyp

- **Tutorial**: warm, ermutigend, vorhersehbarer Aufbau, keine Fallen
- **Anleitung**: knapp, direkt (Leser sind mitten in der Aufgabe)
- **Referenz**: neutral, vollständig, zitierfähig
- **Konzept**: so erklären, dass Leser es weitergeben können; Beispiele und Vergleiche erwünscht
- **Fehlerbehebung**: verständnisvoll, aber nicht entschuldigend; Problem anerkennen, dann lösen
