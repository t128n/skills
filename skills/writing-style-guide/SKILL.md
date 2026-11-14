---
name: "writing-style-guide"
description: "Create, update, or audit the project's writing style guide (`docs/writing/style-guide.md`) and terminology glossary (`docs/writing/glossary.md` or standalone domain glossaries). Supports bilingual German/English terminology tables by default, single-language or other language pairs, and conceptual domain glossaries with definitions, examples, and forbidden variants. Use whenever the user asks to set up, derive, update, extract, or audit a writing style guide, tone of voice, glossary, vocabulary, or inconsistent terminology across docs. Not for code style, linters, source formatting rules, or full document drafting (use `write-doc`)."
---

# Writing style guide

Produce and maintain the files that keep documentation consistent across authors, agents, and languages:

- `docs/writing/style-guide.md`: voice, tone, structure, and language rules for prose.
- `docs/writing/glossary.md`: one row per concept, with its English and German term (or a standalone conceptual glossary when onboarding/domain definitions are the goal).

They live in `docs/writing/` so they cannot be confused with a code style guide, a linter config, or a contribution guide. If the repository already has a prose style guide or glossary somewhere else, keep it where it is and update it there. Never merge prose rules into a code style guide; link the two instead.

A style guide earns its keep by being short and specific. Describe what this project's writing already does well, settle the places where it disagrees with itself, and show examples. A guide that lists generic advice gets ignored by people and applied unevenly by agents.

## Choose a mode

- **Full setup or update:** Create or update both `docs/writing/style-guide.md` and `docs/writing/glossary.md`.
- **Glossary only:** Create or update `docs/writing/glossary.md` using [the bilingual table reference](references/bilingual-table.md) and [the bilingual template](templates/bilingual-glossary.md) (or omit the second language column for single-language projects). For onboarding or conceptual domain glossaries with full definitions, examples, and cross-links, use [the domain glossary reference](references/domain-glossary.md) and [the domain template](templates/domain-glossary.md).
- **Terminology audit:** Scan existing docs against the glossary's `Do not use` variants and surface competing terms with file paths and line numbers (see [Auditing docs against a glossary](#auditing-docs-against-a-glossary)).

## Step 1: Explore what exists

Read before proposing anything. The guide should codify the project's own best writing, not replace it with a generic voice.

Use subagents to explore in parallel, because the documentation is usually larger than one context can hold and each area can be judged independently. Give each subagent one area, the list of things to report, and an instruction to sample rather than read everything (about five to eight documents per area, favouring recently edited and frequently linked ones). Suggested split:

- **Inventory:** where prose lives (README files, `docs/`, guides, ADRs, wiki exports, UI strings, templates), which document types exist, which language each is in, and whether translated pairs exist.
- **English voice and structure:** how the English documents address the reader, sentence and paragraph length, heading style, how steps, warnings and code samples are presented.
- **German voice and structure:** the same for the German documents, plus the points under "German and English" below.
- **Terminology:** the terms used for the main concepts in both languages, with every variant found and where.

Each subagent returns findings with file paths and short quoted examples, separating what is consistent from what conflicts. If subagents are not available, do the same sampling yourself, one area at a time.

Also read any existing glossary or domain language file (for example a `CONTEXT.md` written by grill-with-docs) and reuse its terms instead of inventing a second vocabulary.

## Step 2: Report findings

Summarize for the user in three short lists:

1. Conventions that are already consistent. These go into the guide as they are.
2. Conflicts, each with examples from both sides. These need a decision.
3. Gaps: things a guide needs that the existing writing does not answer.

Point to the two or three existing documents that best represent the voice the project should keep. They become the reference examples.

## Step 3: Settle the open decisions

Conflicts and gaps are the user's decisions, not yours. Resolve them through an interview:

- If the `grilling` skill is available, use it to walk through the open decisions.
- If only `grill-me` is installed, it can be started only by the user: give them the list of open decisions and ask them to run `/grill-me` with it.
- If neither is available, ask the questions yourself, one at a time, each with a recommended answer taken from the findings.

Do not write the guide while decisions are still open. Do not reopen points the user has already settled.

## Step 4: Write the files

Write the style guide in the project's main documentation language, and keep it to about two pages. Put rules that apply to only one language in that language's section, written in that language, with examples in that language.

```markdown
# Writing style guide

## Scope
Which documents this covers. Pointer to the code style guide for everything else.

## Readers
Who reads the docs, what they already know, what they want to get done.

## Voice and tone
Three to five traits, each with one sentence of explanation and a "write this, not that" pair taken from real documents.

## Language policy
Which document types are written in which language. Which language is the source when both exist. How translated pairs are named and kept in sync. What always stays in English (code, identifiers, commands, log output).

## English
Spelling variant, how the reader is addressed, heading capitalization, contractions, number and date formats.

## Deutsch
Anrede, geschlechtergerechte Sprache, Umgang mit englischen Fachbegriffen, Schreibweise von Komposita, Zahlen- und Datumsformate, Variante (DE, AT oder CH).

## Structure by document type
For each type the project uses (guideline, how-to, tutorial, reference, explanation, README): the sections it has, in order.

## Formatting
Headings, lists, tables, code samples, warnings and notes, links, screenshots.

## Reference examples
Links to the documents that show the voice at its best.

## Candidates for automation
Rules precise enough for a prose linter, such as banned words, required terms and heading style.
```

Write `docs/writing/glossary.md` using [the bilingual table reference](references/bilingual-table.md) and [the bilingual template](templates/bilingual-glossary.md) (one concept per row, both languages filled, `Do not use` populated, and German articles/plurals recorded). For onboarding or conceptual glossaries that need full definitions and cross-links, use [the domain glossary reference](references/domain-glossary.md) and [the domain template](templates/domain-glossary.md).

After writing, propose one line for `AGENTS.md` that points agents to `docs/writing/style-guide.md` for all prose, and add it if the user agrees.

## German and English

The two languages need separate rules, because tone does not translate. For German documentation, `schreibrichtlinien` provides the default prose, grammar, and typography baseline; record only project-specific choices and overrides here, and use `write-doc` when drafting documents. Settle these explicitly for German and record them in the Deutsch section:

- **Anrede:** du, Sie or ihr, and whether it differs by audience or document type.
- **Geschlechtergerechte Sprache:** neutral forms, paired forms or a gender marker such as the colon, applied the same way everywhere.
- **English terms in German text:** which terms are translated and which stay English. For terms that stay English, record the article (`der`, `die`, `das`), the plural, and the hyphenated compound spelling (for example `der API-Schlüssel`). See [loanwords and compounds](references/loanwords-and-compounds.md).
- **Sentence style:** German technical writing drifts into nominal style and long passive constructions. State the preference and give a before and after pair.
- **Formats:** dates, decimal separators, quotation marks, and the regional variant, since Swiss German does not use ß.

Settle the equivalent points for English: spelling variant, address, contractions and heading capitalization.

For both languages:

- One language per document. Mixed-language documents are a finding to report, not a pattern to copy.
- Code, identifiers, commands and quoted output stay in their original language.
- A translated document follows the rules of its own language. It mirrors the source in content and structure, not in sentence construction.
- Every glossary row has both terms filled in, or an explicit note that one language keeps the other's term.

## Updating an existing guide or glossary

When the guide or glossary already exists, do not rewrite it. Explore only the documents added or changed since it was last edited, report new conflicts and terms, settle them the same way, and make the smallest edit that adds new concepts or records settled decisions without rewriting untouched rows. Add new terms to the glossary in both languages in the same change.

## Auditing docs against a glossary

When asked to audit documentation against a glossary:

1. Read the glossary and extract canonical terms and `Do not use` variants.
2. Search the target documents for `Do not use` variants, mixed-language terms, and recurring concepts missing from the glossary.
3. Report findings grouped by file with line numbers, the offending term, and the canonical replacement—or apply fixes directly if the user asked for edits.