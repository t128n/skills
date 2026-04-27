# Meeting Notes — Reference

## Issue body template

```markdown
## Context
<!-- One sentence on why this matters, derived from meeting discussion -->

## Description
<!-- What needs to happen -->

## Acceptance criteria
- [ ] ...

## Meeting notes
> <verbatim excerpt from raw notes>

**Meeting:** <title> — <date>
**Participants:** <names if mentioned>
```

## Decision log format (for DECISIONS.md or comment on relevant issue)

```markdown
## Decision: <short title>
**Date:** <YYYY-MM-DD>
**Meeting:** <call title>
**Decision:** <what was agreed>
**Rationale:** <why — if mentioned>
**Owners:** <names>
```

## Label inference rules

Run `gh label list` and match against these heuristics:

| Note pattern | Likely label |
|---|---|
| "bug", "broken", "error", "failing" | `bug` |
| "add", "build", "implement", "create" | `enhancement` or `feature` |
| "docs", "document", "write up" | `documentation` |
| "investigate", "look into", "spike" | `research` or `spike` |
| "refactor", "clean up", "tech debt" | `tech-debt` or `refactor` |
| "urgent", "ASAP", "blocking" | `priority` or `high-priority` |

If no matching label exists, omit rather than create.

## Deduplication heuristics

Consider an issue a likely duplicate if:
- Title similarity > ~70% (same verb + noun)
- Same file/component mentioned in both
- Same person assigned or mentioned

When in doubt, list as "possible duplicate of #N — confirm?" and let the user decide.

## Handling ambiguous notes

If a note item is unclear, include it in the output with `[?]` prefix and ask the user to clarify inline. Don't silently drop content.

Example:
```
[?] "Sort out the thing with Dave" — unclear scope, skipped. What should this become?
```

## Multi-repo scenarios

If participants mention work in a different repo, note it clearly:

```
→ Cross-repo: this may belong in `org/other-repo` — verify before creating
```

## No gh / no repo

If `gh` is unavailable or not authenticated, output a clean markdown file:

```
meeting-notes-YYYY-MM-DD.md
```

with all three sections (Issues, Decisions, Questions) formatted for copy-paste into GitHub, Notion, or Linear.
