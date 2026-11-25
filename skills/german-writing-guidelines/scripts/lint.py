#!/usr/bin/env python3
"""Mechanical checks for German Markdown docs.

Usage: python3 lint.py FILE [FILE ...]

Prints `file:line - [F|S] message` per finding (F = Fehler, S = Stil) and
exits 1 when there are findings. Code blocks, inline code and frontmatter
are skipped. Findings are candidates: the reviewer decides, because a word
like "einfach" can be legitimate (for example "einfache Datenstruktur").
"""
import re
import sys

PATTERNS = [
    ("F", r"—", "Geviertstrich: Doppelpunkt, Komma oder Punkt"),
    ("F", r" – ", "Gedankenstrich als Satzzeichen: Doppelpunkt, Komma oder Punkt"),
    ("F", r"\.\.\.", '"..." → "…"'),
    ("F", r"[„“”‚‘]", "typografische oder englische Anführungszeichen: laut Styleguide, sonst gerade"),
    ("F", r"\b\d+(?:[.,]\d+)?(?:KB|MB|GB|TB|ms|s|min|h|%)(?![\w])", "Einheit ohne Leerzeichen"),
    ("F", r"\b\d{1,2}/\d{1,2}/\d{4}\b", "Datum im US-Format"),
    ("F", r"<[A-Z][A-Z_]{2,}>|\bxxx+\b|\bdein-token\b|\bABC123\b", "generischer Platzhalter"),
    ("F", r"\b[A-Za-zÄÖÜäöü]+'s\b", "Genitiv-Apostroph"),
    ("F", r"\b(?:Jedoch|Zusätzlich|Außerdem|Daher|Dennoch),", "englische Kommasetzung nach Satzanfang"),
    ("F", r"(?<=[a-zäöüß,;] )(?:Du|Dein\w*|Dir|Dich)\b", "großgeschriebenes Du mitten im Satz"),
    ("F", r"\b(?:der Benutzer|der Anwender|die Benutzer|die Anwender)\b", "direkte Anrede statt Benutzer/Anwender"),
    ("F", r"\bSinn machen\b|\bdas meint\b|\bFühl dich frei\b|\bDies erlaubt\b", "Lehnübersetzung"),
    ("F", r"\bin 20\d\d\b", 'Lehnübersetzung "in 2026" → "2026" oder "im Jahr 2026"'),
    ("S", r"\b(?:einfach\w*|simpel\w*|mühelos|problemlos|mal eben|nur noch)\b", "verbotenes Wort (Bewertung von Leserhandlungen)"),
    ("S", r"\b(?:sehr|wirklich|eigentlich|halt|eben|natürlich|selbstverständlich|quasi|sozusagen|durchaus|letztendlich|im Grunde)\b", "Füllwort"),
    ("S", r"\b(?:erfolgt|mittels|seitens|hinsichtlich|diesbezüglich|im Rahmen von|zwecks|nachfolgend|obig\w*)\b", "Papierdeutsch"),
    ("S", r"\b(?:bzw|ggf|etc|usw)\.", "Abkürzung im Fließtext: sagen, was gemeint ist"),
    ("S", r"\bman\b", '"man": direkte Anrede oder Handelnden nennen'),
    ("S", r"\b(?:bietet|ermöglicht|stellt bereit|verfügt über)\b", "Datenblatt-Stil"),
    ("S", r"\b(?:nahtlos\w*|revolutionier\w*|leistungsstark\w*|maßgeschneidert\w*|ganzheitlich\w*|innovativ\w*|robust\w*|umfassend\w*)\b", "Werbewort"),
    ("S", r"Es ist wichtig zu beachten|Zusammenfassend lässt sich|Im Folgenden wird|integraler Bestandteil|eintauchen|auf das nächste Level|Nachdem wir nun", "Floskel"),
    ("S", r"nicht nur .{1,60}, sondern auch|Egal ob .{1,60} oder", "Satzschablone"),
    ("S", r"\b(?:Gerne!|Ich hoffe, das hilft)", "Chatbot-Rest"),
]
COMPILED = [(sev, re.compile(rx, re.I if sev == "S" else 0), msg) for sev, rx, msg in PATTERNS]

DU = re.compile(r"\b(?:du|dein\w*|dir|dich)\b", re.I)
SIE = re.compile(r"(?<![.!?]\s)(?<!^)\b(?:Sie|Ihr\w*)\b")
INLINE_CODE = re.compile(r"`[^`]*`")
LINK_URL = re.compile(r"\]\([^)]*\)|<https?://[^>]*>")
BARE_URL = re.compile(r"https?://\S+")
BAD_LINK_TEXT = re.compile(r"\[(?:hier|Link|klicke hier|mehr)\]\(", re.I)
GENERIC_HEADINGS = {"überblick", "hinweise", "sonstiges", "allgemeines"}
LIST_OR_SPECIAL = re.compile(r"^\s*(?:[-*+]\s|\d+[.)]\s|>|\||#|!\[|\[[^\]]+\]:)")


def lint(path):
    findings = []
    with open(path, encoding="utf-8") as fh:
        lines = fh.read().split("\n")

    in_front = bool(lines and lines[0].strip() == "---")
    in_code = False
    fence_start = 0
    fence_len = 0
    du_line = sie_line = 0
    prev_prose = False
    for n, raw in enumerate(lines, 1):
        line = raw.rstrip()
        if in_front:
            if n > 1 and line.strip() == "---":
                in_front = False
            continue
        if line.lstrip().startswith("```"):
            if not in_code:
                in_code, fence_start, fence_len = True, n, 0
                if line.strip() == "```":
                    findings.append((n, "F", "Codeblock ohne Sprachangabe"))
            else:
                in_code = False
                if fence_len > 25:
                    findings.append((fence_start, "F", "Codeblock über 25 Zeilen: durch Prosa teilen"))
            prev_prose = False
            continue
        if in_code:
            fence_len += 1
            continue

        if line.strip() == "---":
            findings.append((n, "S", "horizontale Linie zwischen Abschnitten"))
        heading = re.match(r"^(#{1,6})\s+(.*)$", line)
        if heading:
            title = heading.group(2).strip()
            if title.endswith((".", ":")):
                findings.append((n, "S", "Überschrift endet auf Punkt oder Doppelpunkt"))
            if title.lower() in GENERIC_HEADINGS:
                findings.append((n, "S", "Überschrift aus generischem Wort"))
            if re.search(r"[\U0001F300-\U0001FAFF\u2600-\u27BF]", title):
                findings.append((n, "S", "Emoji in Überschrift"))
        # hard-wrapped paragraph: two plain prose lines in a row
        is_prose = bool(line.strip()) and not LIST_OR_SPECIAL.match(line) and not heading
        if is_prose and prev_prose:
            findings.append((n, "S", "hart umbrochener Absatz"))
        prev_prose = is_prose

        text = INLINE_CODE.sub("", line)
        if BAD_LINK_TEXT.search(text):
            findings.append((n, "F", 'Linktext "hier"/"Link": das Ziel nennen'))
        if BARE_URL.search(LINK_URL.sub("", text)):
            findings.append((n, "F", "nackte URL"))
        text = LINK_URL.sub("", text)
        for sev, rx, msg in COMPILED:
            for m in rx.finditer(text):
                findings.append((n, sev, f'{msg} ("{m.group(0)}")'))
        if DU.search(text) and not du_line:
            du_line = n
        if SIE.search(text) and not sie_line:
            sie_line = n

    if du_line and sie_line:
        findings.append((max(du_line, sie_line), "F", f"Wechsel zwischen du (Zeile {du_line}) und Sie (Zeile {sie_line}): prüfen"))
    findings.sort(key=lambda f: (f[0], f[1]))
    return findings


def main(argv):
    if not argv:
        print(__doc__.strip().splitlines()[2], file=sys.stderr)
        return 2
    total = 0
    for path in argv:
        for n, sev, msg in lint(path):
            print(f"{path}:{n} - [{sev}] {msg}")
            total += 1
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
