---
name: documentation
description: Write, maintain, refactor, or review engineering documentation. Use for README files, architecture and API documentation, operational documentation, documentation consistency, or checking documentation against implemented behavior. Respect project conventions and use planning for new specifications, RFCs, ADRs, and implementation plans.
---

# Engineering documentation

Preserve useful engineering knowledge with minimal maintenance overhead. Prefer established conventions, concise explanations, and verifiable facts over documentation frameworks or exhaustive descriptions. Match the scope to the request and the intended audience.

## Workflow

1. **Discover.** Identify the audience and purpose. Inspect relevant documentation, repository structure, implementation, and project conventions. Ask a focused question if missing context would materially change the result; otherwise state consequential assumptions.
2. **Select.** Choose the smallest appropriate update or document. Prefer an existing authoritative location over a new file, and follow the requested output and scope. Do not create a separate documentation hierarchy for the skill.
3. **Write.** Explain purpose, behavior, interfaces, constraints, and non-obvious decisions as useful to the reader. Prioritize knowledge that cannot reliably be inferred from code. Distinguish implemented behavior, historical decisions, proposals, and unknowns; do not present an unverified claim as fact.
4. **Connect.** Link to authoritative documentation, relevant source files, and existing decisions where helpful. Avoid copying information that will drift; keep links portable and consistent with the project.
5. **Validate.** Check claims against available implementation and sources. Use existing project checks for links, examples, and technical consistency where appropriate. Identify conflicting or unverified claims and report checks that could not be performed; do not claim an example or command works without verifying it.

## Boundaries

- Respect existing document locations, formats, and statuses. When no convention exists, prefer a project entry-point README and `docs/` for supporting material; use standard Markdown and relative links where practical.
- Use the planning skill and existing project conventions for new specifications, RFCs, ADRs, and implementation plans. When maintaining existing planning documents, preserve their status and distinguish intended changes from current behavior. Use decision-review for an explicit critique of a consequential decision.
- For operational runbooks, complement the runbook skill and existing operational practices rather than inventing competing procedures. For prose-specific audits, use writing-guidelines when appropriate.
- Keep `AGENTS.md` focused on agent-specific instructions and navigation. Do not document every function or implementation detail, duplicate templates, or introduce dependencies, generators, or documentation frameworks without a demonstrated need.
- Perform documentation maintenance when requested or within the authorized scope of a task, not automatically after every code change. Update only documentation affected by meaningful changes; do not create content merely to satisfy a checklist.
- Agent review and ordinary search do not replace deterministic validation, semantic indexing, backlinks, or a knowledge graph. Use existing tooling when available, and do not claim those capabilities have been replaced.

## Load as needed

- For choosing locations and organizing documents, read [structure](references/structure.md).
- For audience, technical clarity, examples, and links, read [writing](references/writing.md).
- For maintenance, reviews, and drift detection, read [maintenance](references/maintenance.md).
