---
name: planning
description: Plan software engineering work, technical products, and architectural changes into test-first feature specs, implementation plans, RFCs, ADRs, or task breakdowns with BDD scenarios, property-based tests, and consumer-driven contracts. Use when asked for a plan, spec, technical design, RFC, ADR, or work decomposition. Scale the process to the task; do not turn routine implementation requests into planning projects, and do not interrupt active grilling, interview, or brainstorming sessions.
---

# Engineering planning

Planning should improve engineering judgment, not merely produce tasks or documents. State how each piece of work will be verified before saying how to build it, because generated code is cheap and verification is the scarce resource. Match the depth and output to the change, risks, and user's request. Respect higher-priority instructions, existing project conventions, and the user's requested artifact or conversational format.

## When to wait or skip

- **Do not interrupt discovery:** If a grilling, interview, or brainstorming skill is running, or the user is still exploring options, do not start a plan, suggest one, or add plan sections to replies. Wait until the user ends the session and asks for the plan or spec.
- **Skip trivial work:** For typos, renames, one-line fixes, or throwaway spikes, say a formal plan is not worth it and proceed directly (when implementation is requested).
- **Respect settled decisions:** If the conversation contains a completed grilling session, design discussion, or ADR, treat its outcomes as decided and do not reopen them.

## Workflow

1. **Understand.** Identify the objective, scope, constraints, and acceptance criteria. Inspect relevant code, interfaces, existing tests, test commands, and existing docs (`docs/specs/`, `docs/plans/`, `docs/adrs/`, `docs/rfcs/`) before asking anything. Separate confirmed requirements from interpretation. Ask focused questions only when ambiguity materially changes the solution—at most three blocking questions in one message. If more than three decisions are open, say the design is not settled, list the open decisions, and recommend a grilling session instead of guessing.
2. **Design.** Consider credible approaches in proportion to the decision. Prefer established project patterns and proven technology where suitable. Explain the recommendation and meaningful trade-offs, including integration, maintenance, operational cost, and reversibility. Consult existing decision records. Mark consequential architectural decisions as `Draft` / proposed and obtain human approval rather than inventing it; identify what is blocked until approval.
3. **Specify verification.** Choose verification techniques by what the change touches (BDD scenarios, property-based tests, consumer-driven contracts, or ordinary example tests) using [verification](references/verification.md).
4. **Decompose.** Derive a small set of cohesive, independently verifiable tasks with stable IDs (`T1`, `T2`), prerequisites, exact verification commands, and completion criteria. Order tests before the code they check, keep the build passing after each step, identify genuinely independent work (not artificial parallelism), and end with a documentation-sync task. See [task decomposition](references/task-decomposition.md).
5. **Visualize.** Use a text-based Mermaid diagram only when it clarifies relationships that prose or a table cannot. Keep it consistent with the plan. Task ordering alone is not a schedule.
6. **Validate.** Check requirement coverage, missing prerequisites, cycles, integration points, unresolved decisions, risks and rollback, and meaningful verification for every task. Remove unnecessary architecture, tasks, and documentation. Present the plan for review, pointing to the two or three choices most worth the user's attention.

## Output and boundaries

- Follow the user's requested output. An implementation-plan request calls for a plan, not an unsolicited set of specs, RFCs, and ADRs. Suggest additional artifacts only when warranted (such as a companion feature spec for new or changed observable behaviour, or an ADR for expensive-to-reverse decisions) and obtain agreement before creating them. A lightweight plan can remain in the conversation.
- Prefer the project's existing document locations, formats, statuses, and issue tracker. When durable documentation is appropriate and no suitable convention exists, use the defaults in [artifact conventions](references/artifacts.md). Do not persist scratch analysis by default.
- Never invent facts, approvals, estimates, or stakeholder decisions. Label uncertainty, and link to authoritative requirements and decisions rather than copying them.
- A plan is not authorization to implement. Do not proceed to implementation unless explicitly requested, and respect any current planning-only restrictions even when implementation is requested. If the user changes a decision, update the planning documents so they stay the single source of truth.

## Load as needed

- For choosing and writing BDD scenarios, property-based tests, and consumer-driven contract tests, read [verification](references/verification.md).
- For choosing document types and readiness or completion criteria, read [methodologies](references/methodologies.md).
- For document selection, naming, lifecycle, linking, and doc-sync rules, read [artifact conventions](references/artifacts.md).
- For task contracts, test-first ordering, dependency analysis, waves, and parallel work, read [task decomposition](references/task-decomposition.md).
- For choosing and writing diagrams, read [visualizations](references/visualizations.md).
- For a requested durable artifact, adapt the relevant template: [specification](templates/spec.md), [RFC](templates/rfc.md), [ADR](templates/adr.md), or [implementation plan](templates/plan.md). Existing project templates take precedence.
