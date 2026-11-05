---
name: planning
description: Plan software engineering work, technical products, and architectural changes. Use when asked for an implementation plan, technical design, engineering specification, RFC, architecture decision record, or help decomposing work and dependencies. Scale the process to the task; do not turn routine implementation requests into unsolicited planning projects.
---

# Engineering planning

Planning should improve engineering judgment, not merely produce tasks or documents. Match the depth and output to the change, risks, and user's request. A small fix may need only a short approach and verification; a consequential change may need alternatives and a decision review. Respect higher-priority instructions, existing project conventions, and the user's requested artifact or conversational format.

## Workflow

1. **Understand.** Identify the objective, scope, constraints, and acceptance criteria. Inspect relevant code, architecture, documentation, decisions, and project practices when available. Identify dependencies, stakeholders, unknowns, and assumptions. Separate confirmed requirements from interpretation. Ask focused questions only when ambiguity materially changes the solution; otherwise state assumptions.
2. **Design.** Consider credible approaches in proportion to the decision. Prefer established project patterns and proven technology where suitable. Explain the recommendation and meaningful trade-offs, including integration, maintenance, operational cost, and reversibility. Consult existing decision records. Mark consequential architectural decisions as proposed and obtain human approval rather than inventing it; identify what is blocked until approval.
3. **Decompose.** Derive a small set of cohesive, independently verifiable tasks from the requirements and design. Identify prerequisites, produced interfaces, ownership boundaries, integration points, and completion and verification criteria. Identify genuinely independent work, not artificial parallelism. Use a dependency DAG and execution waves when they clarify the work; establish interface contracts before parallel producer and consumer work.
4. **Visualize.** Use a text-based Mermaid diagram only when it clarifies relationships that prose or a table cannot. Choose the diagram for the problem and keep it consistent with the plan. Task ordering alone is not a schedule.
5. **Validate.** Check coverage of requirements and acceptance criteria; missing prerequisites, cycles, and integration points; unresolved decisions, risks, and unverified assumptions; and meaningful completion and verification for each implementation task. Remove unnecessary architecture, tasks, and documentation. Present the plan for review.

## Output and boundaries

- Follow the user's requested output. An implementation-plan request calls for a plan, not an unsolicited set of specifications, RFCs, and ADRs. Suggest additional artifacts only when warranted; obtain agreement before creating them. A lightweight plan can remain in the conversation.
- Prefer the project's existing document locations, formats, statuses, and issue tracker. When durable documentation is appropriate and no suitable convention exists, use the defaults in [artifact conventions](references/artifacts.md). Do not persist scratch analysis by default.
- Never invent facts, approvals, estimates, or stakeholder decisions. Label uncertainty, and link to authoritative requirements and decisions rather than copying them.
- A plan is not authorization to implement. Do not proceed to implementation unless explicitly requested, and respect any current planning-only restrictions even when implementation is requested.

## Load as needed

- For choosing document types and readiness or completion criteria, read [methodologies](references/methodologies.md).
- For document selection, naming, lifecycle, and links, read [artifact conventions](references/artifacts.md).
- For task contracts, dependency analysis, waves, and parallel work, read [task decomposition](references/task-decomposition.md).
- For choosing and writing diagrams, read [visualizations](references/visualizations.md).
- For a requested durable artifact, adapt the relevant template: [specification](templates/spec.md), [RFC](templates/rfc.md), [ADR](templates/adr.md), or [implementation plan](templates/plan.md). Existing project templates take precedence.
