---
name: write-daily
description: "Draft the user's daily standup as a 3P update (Progress, Plans, Problems), inferred from the tracker, GitHub and agent sessions, and ask only for the gaps. Use when the user asks to write, update or shorten their daily or standup."
---

# Daily standup

Draft the user's daily standup as a 3P update: Progress, Plans, Problems. Infer as much as you can, ask only for the gaps, and hand over a draft. Never post or send it. A standup is a message to colleagues, so the user approves first.

## Setup

Read `~/.agents/daily.md` first. It names the tracker, where the previous standup lives, the repositories to check, and the user's name and team. If it is missing, tell the user to run `/setup-daily` and continue by asking once for those details. Don't guess a tracker or a name.

## Workflow

1. **Find the time window.** Use the user's previous standup if you can read it. Otherwise use the last working day and say so, so the user can correct it. If the user names days ("Friday too, I was out Thursday"), cover those.
2. **Infer from the sources in the setup file, plus any other you can reach.** Never ask for something you can find.
   - Tracker: Stories the user finished, moved or started in the window, and what is in progress or in review. Note blockers and cycle time.
   - GitHub: the user's PRs that were opened, merged or wait for review, and review requests waiting on the user.
   - Agent sessions: the user's sessions since the window start, for what was worked on and where it got stuck.
3. **Report an unreachable source once.** Say which one in a single line, continue with the others, and ask the user for that part in step 4.
4. **Interview for the gaps in one batched request.** Typical gaps: blockers and waiting-on-someone, what comes next, anything outside the tracked systems. Give a proposed answer for each question so the user can reply "yes" or correct it. Don't ask what the sources already answer. If nothing is missing, skip the interview and draft.
5. **Draft the update** in the format below, then wait for approval or edits.

## Content rules

- **Progress:** what was finished, moved or started in the window. Add numbers where available: Stories finished, cycle time, items waiting in review. No story points or estimates.
- **Plans:** default to what is in progress plus the top of the ready list. The user confirms or changes it.
- **Problems:** blockers on Stories, a review queue above the soft cap of 4 unreviewed results, and anything the user adds. Write "None" if there is nothing.
- Never invent work, blockers, dates or numbers. If a figure can't be derived, leave it out.

## Format

The format is fixed. If the user's personal writing style applies, it shapes the sentences only, never the structure.

- First line: one fitting emoji, the name and the date, for example `🔧 Anna (Mon 23 Nov)`.
- Then `Progress:`, `Plans:` and `Problems:`, each with 1 to 3 short bullets.
- Matter-of-fact, no filler, readable in 30 to 60 seconds.
- Output only the update, with no intro or closing remarks.

```
🔧 Anna (Mon 23 Nov)

Progress:
- Finished invoice export Story (PR merged) and SSO redirect fix, both in about 1.5 days
- 1 Story waits in review

Plans:
- Review the invoice PR from Ben
- Delegate the audit-log Story to a lead agent
- Triage 2 new bug reports from Teams

Problems:
- Audit-log Story is blocked on staging access (asked Ops on Friday)
- Review queue is at 4, our cap, so I won't start anything else before I clear it
```

## Follow-ups

- "Make it shorter": cut bullets and words, keep the three sections.
- "Same as yesterday, but the review queue is cleared": reuse the previous update, change only what the user states, and re-check numbers that depend on it.
- To cover several days, write one update per day unless the user asks for one combined update.

## Boundaries

- Read-only. Do not post, send or schedule the update, and do not change the tracker or GitHub.
- Only hand the final text to the user. If they then ask you to send it, use `write-message`.
