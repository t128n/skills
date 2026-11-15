---
name: write-rfc
description: "Write or update a Request for Comments: a design proposal with alternatives, circulated for review before a decision. Use when asked for an RFC or when a consequential change needs feedback first."
---

# RFC

A proposal that asks for review before anyone builds. Fixed structure, one to two pages.

## When to write one

Write an RFC when a change is consequential and feedback would change the outcome: cross-team impact, hard-to-reverse design, several credible approaches. Do not write one when the approach is routine or already agreed.

## Rules

1. **Look first.** Read `docs/rfcs/` and `docs/adr/`, plus the code the change touches. Follow the project's naming and status words. Do not reopen decisions an accepted ADR settled. Link it.
2. **State the problem before the solution.** A reviewer must be able to disagree with the problem.
3. **Be concrete.** Name interfaces, data shapes, and behavior changes. No filler about benefits or "robustness".
4. **Real alternatives.** Include "do nothing" when it is credible. Give each alternative a reason it lost.
5. **Mark what is unknown.** Open questions go in their own section, with who or what resolves each. Do not hide them in prose.
6. **Never invent approval.** New RFCs are `status: draft`. Move to `in review`, `accepted`, `rejected`, or `withdrawn` only when a human says so.
7. **End in an ADR.** When the RFC is accepted and the decision is expensive to reverse, record it as an ADR in `docs/adr/` (the `domain-modeling` skill does this). Link both ways. The RFC stays as history.
8. **Diagram only if prose cannot do the job.** One Mermaid diagram at most.

## File

Path: `docs/rfcs/<slug>.md`, or the project's convention. `<slug>` is lowercase and hyphenated.

## Structure

Use these headings, in this order. Drop an optional section instead of leaving it empty.

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

## Alternatives Considered

### <Alternative A>

<What it is. Why it lost.>

### <Alternative B>

<What it is. Why it lost.>

## Risks and Open Questions

- <Risk or question> — <how and by whom it gets resolved>

## Rollout and Verification

<Optional. How it is verified, deployed, and reversed.>

## Decision

<Optional until decided. The outcome, the date, who decided, and the ADR link.>
```

## Check before finishing

- Can a reviewer find the problem, the proposal, and what you want from them within one minute?
- Does each alternative say why it lost?
- Is every open question owned or resolvable?
- Is the status `draft` unless a human changed it?
