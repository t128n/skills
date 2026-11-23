---
name: write-epic
description: "Shape a raw conversation, note or link into an Epic (outcome, scope, success criteria, context, next Stories) and publish it to the project tracker once, after confirmation. Use when asked to turn a discussion into an Epic, to shape a note into an Epic, or to propose the next Stories of an Epic."
---

# Epic

Turn loose ideas, notes and half-decisions into one well-formed Epic. Synthesize from what is already there. Do not interview; if the idea is still vague, suggest `grill-me` or `grill-with-docs` first.

## Vocabulary

- **Epic**: a bounded, outcome-oriented initiative made of independently verifiable deliverables.
- **Story**: the smallest team-managed, outcome-oriented unit of work that one lead agent can take and verify independently. A bug is a Story.
- **Task**: an optional execution step owned by the lead agent. Not a tracked work item.

## Rules

1. **Source.** Use the conversation, or the path or link the user gave. Read linked notes and the tracker items they point to. Do not guess at what you cannot see.
2. **Never invent.** Do not make up dates, owners, numbers or decisions. Clarify a gap with the user (`grill-me` or `grill-with-docs`) instead of recording it in the Epic. Only a gap the user accepts as solved later becomes an open question, under an `Open questions:` line in its section.
3. **Scope both ways.** State what is in and what is out. If the source never excludes anything, ask the user.
4. **Checkable success.** Each success criterion can be verified when the Epic ends. Rewrite "better", "robust" and "clean" into something you can observe, or ask the user.
5. **Next Stories only.** Propose at most three, as one line each: the outcome it delivers and how it is verified. Detail them just in time. Plan by week at most. No estimates, no cycles, no full ticket tree.
6. **Do not create Stories.** Hand the chosen one over to the project's Story workflow (a `to-story` skill, if installed).
7. **Confirm before publishing.** Show the full draft and wait for approval. Publishing writes to an external system and cannot be undone silently.

## Template

Read `references/template.md` and fill it. Use exactly its headings, in order, with no extra sections. The title is a short outcome phrase, not a task. Do not copy the template into other documents.

## Publish

Target the tracker the project uses. Use the tool available, MCP or REST. Keep the Epic content tracker-independent, and read tracker details (project, labels, issue type) from project config or the user, not from this skill.

Publish once. Before creating, search the tracker for the source link and a close title match. If an Epic already exists, update that one or stop and report its link. Never create a second one. After publishing, report the link.

If no tracker is reachable, hand back the draft as Markdown and say it is unpublished.

## Check before finishing

- Does every heading of the template appear, and nothing else?
- Is every unknown either clarified or an accepted open question, never a guess?
- Can each success criterion be checked at the end?
- Are there at most three next Stories, and none created?
- Did the user confirm before anything was published, and was the tracker searched for an existing Epic?
