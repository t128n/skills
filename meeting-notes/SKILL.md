---
name: meeting-notes
description: Convert rough meeting notes into structured GitHub issues, decisions, and action items. Gathers repo context (existing issues, docs, recent commits) before processing. Use when user pastes call notes, standup notes, or raw meeting text and wants to extract tasks, create issues, or produce a structured summary.
---

# Meeting Notes → Structured Output

## Quick start

Paste your raw notes. The skill will:
1. Gather repo context (existing issues, docs, recent work)
2. Extract action items, decisions, and questions
3. Deduplicate against existing issues
4. Present structured output for review
5. Create GitHub issues on confirmation

## Workflow

### Step 1 — Gather repo context

Run these in parallel before reading the notes:

```bash
# Existing issues (open + recently closed)
gh issue list --limit 50 --state open --json number,title,labels,assignees
gh issue list --limit 20 --state closed --json number,title

# Recent work
git log --oneline -20

# Project docs
ls docs/ 2>/dev/null; cat README.md 2>/dev/null | head -80; cat CLAUDE.md 2>/dev/null | head -60
```

Also check for a `CODEOWNERS`, `CONTRIBUTING.md`, or `.github/ISSUE_TEMPLATE/` to learn label conventions and team ownership.

### Step 2 — Parse the notes

Extract into three buckets:

| Bucket | What goes here |
|--------|----------------|
| **Issues** | Bugs, features, tasks with a clear owner or outcome |
| **Decisions** | Things that were agreed — no action needed but worth recording |
| **Questions / Parking lot** | Unresolved items needing follow-up |

For each issue candidate, check against existing issues. If a match exists, note the number (`#42`) rather than creating a duplicate.

### Step 3 — Present structured output

Show the user (see [REFERENCE.md](REFERENCE.md) for full templates):

```
## Meeting: <inferred title> — <date>

### Decisions
- ...

### New Issues (N)
1. **[type] Title** — body preview — suggested labels
   → New issue

2. **[type] Title** — maps to existing #42

### Questions / Parking lot
- ...
```

Ask: _"Should I create the N new issues? Any changes before I do?"_

### Step 4 — Create issues

On confirmation, create issues one at a time:

```bash
gh issue create \
  --title "<title>" \
  --body "<body>" \
  --label "<label>" \
  --assignee "<handle or blank>"
```

Report each created issue URL as it's made.

## Key behaviours

- **Never create issues silently** — always show the full list and get confirmation first.
- **Infer labels** from existing label set (`gh label list`), don't invent new ones.
- **Preserve verbatim quotes** from notes in issue bodies under a `> Meeting notes` blockquote.
- **If no git/gh context** (not a repo, not authenticated) — produce markdown output only, skip the creation step.
- **Tone** — issue titles should be imperative and specific ("Add retry logic to webhook handler"), not meeting-speak ("We discussed retries").

See [REFERENCE.md](REFERENCE.md) for issue body template and decision log format.
