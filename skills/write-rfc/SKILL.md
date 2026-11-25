---
name: write-rfc
description: "Write or update a Request for Comments: a design proposal with alternatives, circulated for review before a decision. Use when asked for an RFC or when a consequential change needs feedback first."
---

# RFC

A proposal that asks for review before anyone builds. Fixed structure, one to two pages.

## When to write one

Write an RFC when a change is consequential and feedback would change the outcome: cross-team impact, hard-to-reverse design, several credible approaches. Do not write one when the approach is routine or already agreed.

## Rules

1. **Match the language.** A German RFC uses the German headings from Language, not the English template below.
2. **Look first.** Read `docs/rfcs/` and `docs/adr/`, plus the code the change touches. Follow the project's naming and status words. Do not reopen decisions an accepted ADR settled. Link it.
3. **State the problem before the solution.** A reviewer must be able to disagree with the problem.
4. **Be concrete.** Name interfaces, data shapes, and behavior changes. No filler about benefits or "robustness".
5. **Real alternatives.** Include "do nothing" when it is credible. Give each alternative a reason it lost.
6. **Mark what is unknown.** Open questions go in their own section, with who or what resolves each. Do not hide them in prose.
7. **Never invent approval.** New RFCs are `status: draft`. Move to `in review`, `accepted`, `rejected`, or `withdrawn` only when a human says so.
8. **End in an ADR.** When the RFC is accepted and the decision is expensive to reverse, record it as an ADR in `docs/adr/` (the `domain-modeling` skill does this). Link both ways. The RFC stays as history.
9. **Diagram only if prose cannot do the job.** One Mermaid diagram at most.
10. **Verify claims about today's behavior.** Check each statement about current behavior against the code, configuration or docs. Mark what you could not verify, and say so in the open questions.

## File

Path: `docs/rfcs/<slug>.md`, or the project's convention. `<slug>` is lowercase and hyphenated.

## Language

Write the RFC in the language the user asks in, or the project's documentation language. For German, load `german-writing-guidelines` first and use exactly these headings. Frontmatter keys and status words stay English.

```markdown
# RFC: <Titel>

## Problem

## Vorschlag

## Betrachtete Alternativen

## Risiken und offene Fragen

## Einführung und Verifikation

## Entscheidung
```

## Structure

Use these headings, in this order. In a German RFC, use the translated headings from Language instead; do not mix English headings into German text. Drop an optional section instead of leaving it empty.

```markdown
---
status: draft
date: YYYY-MM-DD
authors: <names>
reviewers: <names, if known>
---

# RFC: <Title>

## Problem

<What is wrong or missing, who is affected, and the constraints. Link specs and issues.>

## Proposal

<The solution: interfaces, data, behavior, and what changes for users or operators.
State what is out of scope.>

## Alternatives considered

### <Alternative A>

<What it is. Why it lost.>

### <Alternative B>

<What it is. Why it lost.>

## Risks and open questions

- <Risk or question>: <how and by whom it gets resolved>

## Rollout and verification

<Optional. How it is verified, deployed, and reversed.>

## Decision

<Optional until decided. The outcome, the date, who decided, and the ADR link.>
```

## Check before finishing

- Can a reviewer find the problem, the proposal, and what you want from them within one minute?
- Does each alternative say why it lost?
- Is every open question owned or resolvable?
- Is the status `draft` unless a human changed it?
- Is every statement about current behavior verified or marked as unverified?
