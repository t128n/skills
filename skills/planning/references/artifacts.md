# Artifact conventions

Use existing project locations, templates, status vocabulary, and decision records when suitable. Otherwise, select only the artifacts needed for the work:

| Artifact | Purpose | Default path |
| --- | --- | --- |
| Specification | Authoritative requirements and acceptance criteria | `docs/specs/<slug>.md` |
| RFC | Proposed solution, alternatives, and trade-offs for review | `docs/rfcs/<slug>.md` |
| ADR | A consequential architectural decision and its consequences | `docs/adrs/NNNN-<slug>.md` |
| Implementation plan | Tasks, dependencies, and verification for execution | `docs/plans/YYYY-MM-DD-<slug>.md` |
| Execution tracking | Actual progress, ownership, and discussion | Existing project issue tracker |

When no project naming convention exists, use a short lowercase hyphenated slug and the creation date for a plan. For an ADR, follow existing numbering; otherwise choose the next available zero-padded number after inspecting existing records. Do not create a tracker or new directory convention merely to use this skill.

Use a descriptive `#` title and consistent `##` section headings. For durable artifacts, include a status where it aids interpretation, using project vocabulary first. If that vocabulary does not clearly express a proposal's approval state, explain it in prose. In the absence of a project vocabulary, use **Draft**, **In review**, **Accepted**, **Superseded**, and **Retired**: a draft may enter review, review may return to draft or be accepted by an authorized human, and an accepted artifact may be superseded or retired. Record the actual decision or reason and date when it matters; never infer acceptance. Not every document needs every state.

Link related project-relative documents and issue URLs. Specifications own requirements and observable acceptance criteria; designs own the proposed solution; ADRs own the decision and consequences; plans own execution and task-level completion and verification. Refer to the authoritative source rather than copying it, and distinguish proposed changes from accepted decisions. Use explicit **Assumptions**, **Open questions**, and **Decisions** sections or labels when relevant; identify a decision owner or resolution condition only when known. Verification should say how an observable outcome will be checked, not just that work is complete.

When superseding, link old and new records in both directions where practical and preserve historical context. Retire obsolete material with a reason and a pointer to its replacement when available. Keep exploratory notes and agent scratch work out of permanent documentation unless requested or useful to the project.
