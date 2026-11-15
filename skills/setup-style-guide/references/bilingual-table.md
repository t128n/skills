# Bilingual Terminology Table Reference

Use this format for `docs/writing/glossary.md` when maintaining documentation in English and German (or another language pair). It is optimized for fast lookup while drafting (`write-doc`) and reviewing (`writing-style-guide`).

## Table structure

Use five columns in this order:

```markdown
| Concept | English | Deutsch | Do not use | Notes |
|---|---|---|---|---|
```

| Column | Purpose | What to write |
|---|---|---|
| **Concept** | Anchors the meaning so translators and writers know *which* sense is meant | A one-line definition or disambiguator (not just repeating the English term) |
| **English** | Canonical English term | Singular form; include part of speech or casing only if ambiguous |
| **Deutsch** | Canonical German term | Include article (`der`, `die`, `das`) for nouns, plus plural if non-obvious; mark English loanwords explicitly |
| **Do not use** | Variants to avoid in both languages | Rejected synonyms, false friends, old names, or inconsistent spellings |
| **Notes** | Usage boundaries | Where it applies (UI label, prose only), compound rules, or when code identifiers differ |

## Good example

Notice how each row disambiguates meaning, gives the German article, calls out rejected synonyms, and explains *why* or *where* the term applies:

```markdown
# Glossary

Canonical terminology for documentation in English and German. See [the style guide](style-guide.md) for general prose rules.

| Concept | English | Deutsch | Do not use | Notes |
|---|---|---|---|---|
| Isolated working directory for a repository | workspace | der Workspace (Pl. Workspaces) | Arbeitsbereich, repo folder, Projektordner | Stays English in German prose. Code config key is `workspaceRoot`. |
| Scheduled automated job that runs periodically | cron job | der Cronjob (Pl. Cronjobs) | timer, batch task, Zeitplan-Task | Use "timer" only for one-shot delays. |
| Permission check that grants or denies an action | access control | die Zugriffskontrolle | auth check, Berechtigungsprüfung | Use "authentication" (*Authentifizierung*) only for identity verification. |
| Saved credential token for API requests | API key | der API-Schlüssel | API token, Zugangsschlüssel, Key | Matches UI label "API key" / "API-Schlüssel". Hyphenated in German compounds. |
| Action of publishing a build to an environment | deployment | das Deployment (Pl. Deployments) | release, Auslieferung, Rollout | Stays English in German prose. Verb in German: *deployen* (avoid if *bereitstellen* fits). |
| User-facing configuration file for a skill | skill manifest | das Skill-Manifest | skill config, Skill-Datei | Refers specifically to `SKILL.md` frontmatter. |
```

## Ordering and grouping

- **Small glossaries (< ~30 rows):** One alphabetical table sorted by `Concept` or `English` is easiest to scan.
- **Larger glossaries (30+ rows):** Group into thematic `##` sections (for example `## Core domain`, `## Architecture & runtime`, `## UI & navigation`) and sort alphabetically within each section. Avoid nesting deeper than `##`.

## Common pitfalls to avoid

- **Empty cells:** Never leave `Deutsch` or `English` blank. If a term is not translated, write the term again and note `(stays English)` or `(bleibt Englisch)` in `Deutsch` or `Notes`.
- **Circular Concept column:** Writing `workspace` in `Concept` and `workspace` in `English` wastes the column. Use `Concept` to define *what it is*.
- **Merging distinct concepts:** Keep *authentication* and *authorization*, or *workspace* and *repository*, on separate rows even if people casually conflate them.
- **Putting code identifiers in `Do not use`:** If the code already calls a field `repoDir` while docs say `workspace`, do not ban `repoDir` in code—note in `Notes` that `repoDir` is the code identifier.
