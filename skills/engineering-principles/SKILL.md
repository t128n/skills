---
name: engineering-principles
description: Apply engineering judgment when designing, implementing, or reviewing nontrivial code involving state transitions, persistence, concurrency, retries, external I/O, or side effects. Identify credible failure modes and protect important invariants without overengineering. Skip trivial edits, styling, copy changes, and straightforward refactors.
---

# Engineering principles

Use these principles to find mistakes that are easy to miss in code that changes state over time or interacts with the outside world. They are **review heuristics**, not an implementation process or a checklist to complete mechanically.

Start with the existing code, contracts, and project conventions. Apply only the principles relevant to the actual change. Prefer the smallest correct solution; do not introduce frameworks, abstractions, safeguards, or tests for hypothetical problems without a credible failure mode.

## The seven principles

1. **State machines and transitions.** Identify meaningful states, who owns them, and valid transitions. Look for implicit states encoded across flags, timestamps, or nullable fields. Prevent illegal transitions only where they can realistically occur; don't introduce a formal state machine when simple control flow suffices.
2. **Invariants and ownership.** State what must remain true before and after an operation. Identify the authoritative owner of mutable state and the boundaries at which invariants are established. Avoid duplicated sources of truth and repeated validation of already trusted internal data.
3. **Idempotency and retries.** Determine whether an operation may be delivered or attempted more than once. Distinguish safe retries from repeated side effects. Where necessary, use stable operation identities, deduplication, or transactional boundaries; do not add them when a caller already guarantees at-most-once execution.
4. **Concurrency and ordering.** Identify genuinely concurrent actors, shared mutable state, and ordering assumptions. Check races, cancellation, stale results, and interleavings that can happen in the deployed system. Prefer explicit ownership, serialization, or existing synchronization mechanisms over speculative locking.
5. **Failures and recovery.** Consider failures at meaningful boundaries: before a side effect, after it but before acknowledgment, and during cleanup. Preserve a recoverable state, define timeouts where required, and avoid silently swallowing errors. Don't build elaborate recovery machinery for consequences the system can safely surface and retry manually.
6. **Persistence and consistency.** Check which facts must survive process restarts, which values can be derived, and whether state changes must be atomic. Consider migration and compatibility only when stored data, external consumers, or deployments are actually affected. Prefer one authoritative representation.
7. **External boundaries and side effects.** Identify calls to databases, filesystems, networks, queues, subprocesses, and third-party APIs. Validate untrusted input once at its owning boundary. Account for partial success and external contracts; isolate side effects enough to reason about and test them, without wrapping every call in new infrastructure.

## How to apply

- **Before implementation:** Identify relevant invariants, real failure modes, and constraints that could affect the design. For an uncertain design, compare the simplest viable alternatives and their trade-offs.
- **During implementation:** Follow existing project patterns. Keep the happy path visible and the code proportional to the problem. Reassess only if new evidence changes the risks.
- **During review:** Trace realistic unhappy paths and check whether the implementation preserves the intended behavior. Look for unnecessary complexity just as actively as missing correctness guarantees.
- **During verification:** Prefer targeted tests for credible regressions, including relevant state transitions or failure boundaries. Report what was actually executed; do not present hypothetical coverage as proof.

## Decision rule

Before proposing any additional abstraction, state, retry, lock, validation layer, or defensive branch, be able to answer:

- **Failure:** What concrete failure or broken invariant does it prevent?
- **Reachability:** Under what realistic conditions can that failure occur?
- **Cost:** What complexity, maintenance burden, or new failure mode does the fix introduce?
- **Alternative:** Can existing guarantees or a smaller change address it?

If the justification is weak, omit the complexity. If the risk is material but outside the requested scope, explain it rather than silently expanding the change.

## Output

Report **only findings that influence the decision or implementation**. For each significant finding, name the affected invariant or failure mode, cite the relevant code or behavior, and suggest the smallest practical fix. If no material issue exists, say so briefly. Do not produce a seven-section report or enumerate principles that do not apply.
