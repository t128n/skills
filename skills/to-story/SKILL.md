---
name: to-story
description: "Shape a conversation or an Epic into Stories (or defects) that meet the Definition of Ready, and publish them to the tracker after confirmation. Use when asked to turn a discussion into a Story, split an Epic into its next Stories, slice a Story that is too big, or check whether a Story is ready to delegate."
---

# To Story

Turn a conversation, or an existing Epic, into **Stories** that one lead agent can take and verify. This is the counterpart to upstream `to-tickets`: follow its vertical slicing and quiz steps, but write our template, check readiness, and never size.

## Conventions

- **Epic:** a bounded, outcome-oriented initiative made of independently verifiable deliverables.
- **Story:** the smallest outcome-oriented unit of work that one lead agent can deliver and verify independently. A defect is a narrower kind of Story.
- **Task:** an optional execution step owned by the lead agent. Never a tracked item. Do not list tasks.
- **Definition of Ready (Story):** goal, acceptance criteria, constraints and needed access are clear enough for the lead agent to start. Not every task has to be known.
- **Definition of Ready (defect):** a lower bar. A symptom and an affected system can be enough.
- **Definition of Done:** outcome verified, relevant tests pass, documentation updated where relevant, required acceptance in place. "The agent says it's done" does not count. Do not restate it per Story.

## Modes

- **Create one Story** (`/to-story`): from what was just discussed.
- **Split an Epic** (`/to-story <epic-id>`): fetch the Epic with its comments, then shape its next Stories. At most three, with blocking relations.
- **Slice** ("this Story is too big"): replace one Story with smaller ones, using the rules below.
- **Check** ("is this ready?"): run the readiness check only. Do not publish.

If the reference is ambiguous, ask.

## Process

1. **Gather.** Read the conversation, or the Epic and its comments. Read the code, docs and ADRs the work touches. Use the project's domain vocabulary. If the work is a defect, say so now.
2. **Slice vertically.** Each Story is a narrow but complete path, demoable or verifiable on its own. Never a layer ("the schema", "the UI"). If a Story looks too big, slice it. Never size, estimate, point or rank by effort.
3. **Detail only the next Stories.** Later work stays as one-line candidates in the Epic. Do not draft them.
4. **Note blocking relations** only where one Story cannot start before another is done. Prefer no relation over a speculative one.
5. **Write each Story** with the Story template. Every acceptance criterion is a checkable statement: someone can run, read or observe something and answer yes or no. Rewrite or drop "works well", "is robust", "is clean". Avoid file paths and code snippets, they go stale.
6. **Check readiness** (next section) for each Story.
7. **Confirm.** Show the numbered list: title, kind, one-line outcome, blockers, readiness. Ask whether the granularity and the blocking relations are right. Iterate until the user approves. Do not publish before this.
8. **Publish** the ready, approved Stories (see Publishing).

## Readiness check

A Story is ready when:

- **Goal:** the outcome and why it matters are stated.
- **Acceptance criteria:** at least one, each verifiable.
- **Constraints:** out-of-scope and do-not-touch are stated, or explicitly none.
- **Access:** the repositories, systems and permissions needed are named, and exist.
- **Independence:** one lead agent can deliver and verify it without another Story, except declared blockers.

A defect is ready when it has a symptom and an affected system. Evidence is welcome, not required.

If a Story is not ready, **do not publish it.** Report it with its gaps, as a list of what is missing and who or what can supply it. Publish the ready ones if the user approves that. This is a quick check. Full triage with context retrieval belongs to `work-triage`.

Do not add a risk field. Do not guess missing facts to make a Story pass.

## Templates

- Story: [references/story-template.md](references/story-template.md)
- Defect, when the item describes a defect: [references/defect-template.md](references/defect-template.md)

## Publishing

Use the project's configured tracker and its skill.

- Publish blockers first, so blocking relations can use real identifiers. Use the tracker's native blocking relation where it has one, otherwise a "Blocked by" line in Context.
- Link each Story to its Epic as its parent (a sub-issue where supported).
- Do not close or edit the Epic, except to turn a candidate line into a link to the new Story, and only if the user agreed.
- Do not set labels that mean "ready" by themselves. Readiness is the Definition of Ready.
- After publishing, report each Story with its link and any relations.

## Output rules

No estimates, points, sizes, durations or t-shirt sizes anywhere: not in Stories, not in the confirmation list, not in the Epic.
