---
name: lenses
description: "Review a change through role-based lenses (attacker, maintainer, on-call, privacy, etc.). Use before shipping or when asked to look at something from a specific angle."
---

# Lenses

A lens is a role you take on to ask one pointed question about a change. Use lenses to find what normal review misses. Report only what you verify in the code.

## The lenses

| Lens | Question | Look at |
| --- | --- | --- |
| attacker | How would you break this? | Trust boundaries, authn/authz, injection, secrets, dependency changes, leaky errors |
| slow-network | What happens on bad 3G? | Timeouts, retry storms, missing idempotency keys, duplicate requests, optimistic UI that lies |
| first-time-user | Where will you get stuck? | Empty states, defaults, error messages, destructive actions, no data or expired session |
| finance | What does it cost at 100x traffic? | Compute, third-party calls, storage, egress, unbounded loops, missing caching or retention caps |
| maintainer | What hurts to change in 6 months? | Coupling, hidden state, duplicated logic, missing tests, rollback paths |
| dba | Which query dies first? | N+1, unbounded scans, missing indexes, lock duration, migration rollback |
| screen-reader | What can't a user reach? | Keyboard access, focus order, labels, ARIA, contrast, motion, modals |
| tokyo | What breaks across time zones and languages? | Time zones, DST, locale formatting and sorting, CJK, text direction, non-ASCII paths |
| on-call | What pages me at 3 AM? | Silent failures, telemetry, timeouts, partial failure, whether an operator can find and stop it |
| privacy | What personal data do we store, and why? | Collection, logging, retention, deletion, third-party sharing, identifiers in logs and prompts |

## How to use

1. Resolve the scope: the files or diff under review. Default to everything that would ship from the current branch.
2. Pick the lenses that apply. Most changes need two to four. A lens with no surface (no UI, no database) is skipped, not reported as clean. If the user names lenses, use exactly those. Run all ten only when asked.
3. Apply each lens to the scope. Read the code; do not guess. For several lenses on a large change, parallel read-only subagents can help, one per lens.
4. Report findings per lens as `path:line - problem - why it matters - concrete fix`. Label each Blocker, High, or Medium and drop lower items. Say whether the change introduced the problem or exposed an existing one.
5. State which lenses you used, which you skipped and why, and end with a verdict: ship, ship with follow-ups, or do not ship.

## Rules

- Read-only. Do not edit files or change git state.
- Never quote a secret value. Mask it and report the path and kind.
- No finding is a valid result. Do not invent work to look thorough.
