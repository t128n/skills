---
name: "write-doc"
description: "Write or revise technical documentation in German or English so that tone, terminology and structure follow the project's writing style guide: guidelines, how-tos, tutorials, reference pages, explanations and READMEs. Use when the user asks to write, draft or rewrite such a document. Not for specs, plans or ADRs, and not during a grilling or brainstorming session."
---

# Write doc

Write documentation that reads as if one careful author wrote all of it. Consistency comes from three sources, used in this order: the project's writing style guide, its glossary, and its best existing documents. Your own default voice comes last.

## When to stay out of the way

- If a grilling, interview or brainstorming skill is running, or the user is still deciding what the document should say, do not start drafting. Wait until they ask for the document.
- Feature specs, implementation plans and ADRs belong to the `planning` skill and the folders `docs/specs/`, `docs/plans/` and `docs/adrs/`. Do not write those here.
- For a small fix such as a typo or one corrected sentence, make the edit directly and skip the steps below, but still use the glossary's terms.

## Step 1: Load the rules

1. Read `docs/writing/style-guide.md` and `docs/writing/glossary.md`. If the repository keeps its prose style guide somewhere else, use that one.
2. If no style guide exists, say so once and suggest the `writing-style-guide` skill. Then continue: read two or three neighbouring documents of the same type and language and follow their conventions, so that the new document at least matches its surroundings.
3. For German documents, also load `schreibrichtlinien` as the baseline for German prose, grammar, typography, and anti-patterns. Project rules in `docs/writing/style-guide.md` and `docs/writing/glossary.md` take precedence where they differ; `write-doc` still governs the authoring workflow, document types, and bilingual pairing.
4. Read the reference examples the style guide names for this document type. Examples carry tone more reliably than rules do.

## Step 2: Settle language, type and reader

**Language.** Decide the target language before writing a word, from the user's request, the document's location and the style guide's language policy, in that order. If they disagree or leave it open, ask. Reply to the user in the language they write in; write the document in its target language.

**Type.** Each type answers a different reader question, and mixing them is the most common reason documents feel inconsistent:

| Type | The reader wants to | Shape |
|---|---|---|
| Guideline | know what to do and why | Rule, reason, good example, bad example, exceptions |
| How-to | finish one task | Goal, prerequisites, numbered steps, result, troubleshooting |
| Tutorial | learn by doing | One worked example from start to finish, one new concept at a time |
| Reference | look something up | Complete, uniform entries, no narrative |
| Explanation | understand why | Context, how it works, trade-offs, links to the how-tos |
| README | decide whether and how to start | What it is, quick start, where to go next |

If the style guide defines the structure for a type, its version wins over this table.

**Reader.** Name who reads this, what they already know and what they should be able to do afterwards.

## Step 3: Brief and outline

Write a brief of a few lines: language, type, reader, the outcome for the reader, the three to seven points the document has to make, the sources of truth for its facts (code, specs, ADRs, existing documents) and where the file will live. Add a heading-level outline.

Show the brief and outline and wait for agreement before drafting, because restructuring a finished draft costs far more than changing an outline. Skip the wait when the user asked for an autonomous run, for example through a `/write` command.

Ask only about gaps that block the brief, at most three questions in one message. If more is open, the content is not settled: list the open points and recommend a grilling session.

## Step 4: Draft

- Write directly in the target language. Do not draft in English and translate, because the result carries English sentence structure into German and reads as a translation.
- Use the glossary's term for every concept, every time. Varying a term for elegance makes a technical reader wonder whether a different thing is meant.
- If the document needs a term the glossary lacks, choose one, use it consistently, and add it to the glossary in both languages in the same change.
- Follow the section for the target language in the style guide for address, inclusive language, formats and loanwords. Code, identifiers, commands and quoted output stay in their original language.
- Lead with what the reader needs most. State rules and steps plainly, and give the reason next to the rule.
- Use real examples from the project, and prefer one complete example to several fragments.

## Step 5: Verify the content

A document that is consistent in tone and wrong in fact is worse than no document.

- Check every factual claim against its source of truth: the code, the configuration, the spec or the ADR. Where the document and the code disagree, the code is right unless the user says otherwise; report the mismatch.
- Run every command and code sample that can be run. Mark any that could not be run and say why.
- Check that every link and cross-reference resolves.
- Check that the document does not contradict a neighbouring document. If it replaces one, update or remove the old one and its inbound links.

## Step 6: Review

Read the draft against the style guide once for each of these, since trying to check everything in one pass misses things: terminology against the glossary, tone and address, structure for the type, formatting.

For anything longer than about a page, also have a subagent read it cold. Give it only the document and the reader description from the brief, not the conversation, and ask what a reader would misunderstand, what is missing for the stated outcome and which terms are unclear. Fix what it finds. If subagents are not available, reread the document from the top as the stated reader would.

## Two languages

When a document is needed in both German and English:

- Write it first in the source language named by the style guide's language policy, and finish verification and review there.
- Then write the second version as its own text in the other language: the same content, the same headings in the same order, the same examples, and sentences built the way that language builds them.
- Follow the project's convention for naming and linking the pair. Record which version is the source, so later edits start there.
- When revising one version of an existing pair, update the other in the same change, or tell the user clearly that it is now out of date.

## Delivering

Save the file where the repository keeps that type of document. Tell the user where it is, which facts you could not verify, which terms you added to the glossary, and, for a pair, whether both versions are in sync.