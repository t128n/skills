---
name: briefing
description: Synthesize raw notes, documents, discussions, or investigations into concise, audience-specific briefings. Use for meeting pre-reads, executive summaries, decision memos, status updates, and handoff notes that help an audience understand a situation, decide, prepare, or take over work.
---

# Briefing

Make the situation, conclusion, or request useful to the intended reader. A briefing can synthesize and recommend, but must distinguish evidence from interpretation and recommendations from approved decisions. It works directly from raw material; no preliminary meeting record or other skill is required.

## Workflow

1. Identify purpose, audience, desired action, and format from the request and available context. Ask a focused question if the audience or a missing fact would materially change the result; otherwise state a consequential assumption and proceed. Match technical detail to the decision, not stereotypes about the audience.
2. Review the provided sources and relevant existing project conventions. Extract material facts, dates, context, constraints, dependencies, and provenance. Distinguish newer from older information when supported, but do not assume newer necessarily supersedes older. Flag conflicting claims and missing evidence; repeated versions of the same claim are not independent corroboration.
3. Select the relevant format reference below. Lead with the essential conclusion or request when useful (BLUF), group supporting points beneath it, and put detail later. Use 3P for routine status by default; use mutually exclusive groupings when helpful, not as a rigid requirement. A short request may need only a paragraph.
4. Separate confirmed findings, assumptions, inferences, and recommendations. Compare viable options fairly when a decision is required; if the evidence is insufficient, say so rather than manufacture a favorite. Do not imply a proposal is approved or invent progress, deadlines, owners, metrics, or citations.
5. Check audience relevance, meaningful omissions, factual fidelity, traceability, uncertainty, and identifiable requests or next steps. Retain essential technical details for nontechnical audiences when they affect the outcome. Remove repetition, unsupported confidence, and framework-driven filler.

## Output and boundaries

- Respond in conversation by default. Create or update a standalone Markdown document only when requested, using the project's existing locations, formats, and authoritative source links. Do not update external systems or contact people without explicit authorization.
- Use the requested language, otherwise that of the intended audience or source. Preserve technical identifiers, precise values, and relevant source links. Never imply sources were consulted when they were not.
- Adapt [the shared template](templates/briefing.md) only when helpful; omit or replace headings to suit the format. A management briefing can explain business impact only where evidence supports it.

## Choose a format

- Meeting preparation: [meeting pre-read](references/meeting-prep.md).
- Concise findings for a particular audience: [executive summary](references/executive-summary.md).
- An unresolved choice: [decision memo](references/decision-memo.md).
- Periodic or project reporting: [status update](references/status-update.md).
- Transfer of responsibility or context: [handoff note](references/handoff.md).

Choose the closest fit or adapt when a request spans formats. Use the project's existing ADR or RFC conventions for architectural decisions rather than creating a competing authoritative record.
