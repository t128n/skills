---
name: meeting-notes
description: Turn rough notes, transcripts, chats, workshops, or existing minutes into accurate, actionable meeting records. Use when asked to summarize or organize meeting discussions, decisions, follow-ups, and unresolved questions; preserve uncertainty and do not turn proposals into commitments.
---

# Meeting notes

Produce a reliable record of the meeting, not a transcript or a set of unsolicited recommendations. Match the depth, language, and format to the source, audience, and request; a short conversation may need only a paragraph.

## Workflow

1. Identify the meeting's purpose, topics, source boundaries, and any available metadata. Preserve names, identifiers, quantities, and relevant links or timestamps. Do not expand ambiguous abbreviations without support.
2. Classify material before summarizing: supported facts and discussion; explicitly confirmed decisions; unapproved proposals; confirmed follow-up commitments; suggested or unassigned work; open questions; risks or blockers; and interpretations requiring verification. Keep these distinctions visible. Silence is not approval, and a suggested owner has not necessarily accepted an assignment.
3. Organize by outcome and topic rather than chronology. Lead with material outcomes; include only the discussion context needed to understand them. Record contradictions and identify their sources when available rather than choosing a version. Attribute claims where the speaker matters, and preserve conditions and uncertainty.
4. Ask a focused question if missing information materially changes the record; otherwise produce a useful record and mark what remains unknown. Never invent decisions, consensus, approvals, owners, dates, rationale, or action status. Do not add recommendations as if they were meeting outcomes.
5. Check every decision and action against the source, including its wording, owner, deadline, and dependencies. Check that unresolved matters and material risks remain visible and that the record does not repeat itself or imply absent agreement.

## Output and boundaries

- Respond in conversation by default; create or update a Markdown document only when requested. Follow existing document conventions and link authoritative ADRs, RFCs, issues, and other sources instead of duplicating them. Do not contact participants or update external systems without explicit authorization.
- Use the requested language, otherwise that of the intended audience or source. Preserve meaningful mixed-language terminology and technical identifiers. Follow formal minutes rules when applicable; working notes may include relevant discussion context.
- Adapt [the default template](templates/meeting-notes.md), omitting empty sections and unavailable optional metadata. Show material risks or blockers, and cite source locations where available and useful. For an identified action with missing details, use `Unassigned` or `Not specified` as appropriate; never add placeholder rows.

## Load as needed

- For structure and neutral topic summaries, read [meeting minutes](references/meeting-minutes.md).
- For decision status, approvals, and existing decision records, read [decisions](references/decisions.md).
- For commitments, suggestions, owners, and deadlines, read [action items](references/action-items.md).
