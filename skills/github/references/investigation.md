# GitHub investigation

Determine the **most likely root cause** and the **smallest credible corrective action**. Gather focused evidence first (see [context](context.md)). Do not confuse a plausible explanation with a verified cause, and do not implement changes unless requested.

## Investigate

1. **Frame the failure.** Establish expected vs. observed behavior, affected version/commit, environment, reproduction, impact, and when it started. If information is missing, continue with explicit hypotheses rather than inventing details.
2. **Collect focused evidence.** Read the originating issue or PR, relevant comments/reviews, failed checks, commit history, and implementation. Search related incidents/PRs and recent changes only in the affected area.
3. **Reproduce or isolate.** Prefer a minimal reproduction or a targeted failing test. For nondeterministic failures, identify observable invariants, timings, state transitions, and event ordering.
4. **Trace the execution path.** Identify the owning component and input-to-failure sequence. For stateful work inspect retry, idempotency, concurrency, cleanup, and persistence boundaries. Use `engineering-principles` when these concerns materially apply.
5. **Test hypotheses.** Look for observations that would falsify each explanation. Correlate suspected changes with code and logs; temporal proximity alone is not causation.
6. **Recommend a fix.** Prefer the smallest change to the owning boundary, with a regression check that would fail on the faulty behavior. Mention realistic alternative fixes only when trade-offs matter.
7. **Report limitations.** Mark unexecuted tests, unavailable environments, flaky observations, and any unmeasured performance claim.

## CI and workflow failures

Start with the failing check and its exact commit, pinning the resolved host:

```bash
gh pr checks 456 -R HOST/OWNER/REPO
gh run list -R HOST/OWNER/REPO --branch BRANCH --limit 15
gh run view RUN_ID -R HOST/OWNER/REPO --json databaseId,headSha,headBranch,event,status,conclusion,url,jobs
gh run view RUN_ID -R HOST/OWNER/REPO --log-failed
```

When necessary inspect a specific job with `gh run view RUN_ID -R HOST/OWNER/REPO --job JOB_ID --log`, or retrieve API check annotations with `gh api --hostname HOST`. Logs can be incomplete or expired; report that explicitly. Never download or execute workflow artifacts without understanding their provenance.

Distinguish:
- Product regression vs. test failure vs. infrastructure failure.
- Failure on the PR head vs. synthetic merge commit vs. default branch.
- A known baseline failure vs. a failure introduced by the current patch.
- Flaky tests vs. reproducible failures; retries are evidence, not a substitute for diagnosis.

Compare the failing SHA with the last known good SHA and relevant diffs. Prefer targeted tests and source inspection before proposing a full CI rerun. Re-run expensive workflows or mutate CI only when explicitly authorized.

## Engineering quality

- Avoid speculative refactors, sweeping dependencies, and new frameworks without a concrete causal link.
- Validate evidence using authoritative code, test results, and API state; comments and issue descriptions are reports, not proof.
- When asked to implement, perform only the approved scope and verify afterward; do not silently broaden the fix.

## Output

Keep the report concise, proportional to the failure:

1. **Finding:** root cause with confidence (`confirmed`, `probable`, or `unknown`).
2. **Evidence:** observed symptoms, relevant code path, failed checks/SHAs, and linked sources.
3. **Fix:** smallest recommended change, with trade-offs if material.
4. **Verification:** reproducible test/check and actual results; explicitly name anything not run.
5. **Next action:** implement, request missing evidence, or escalate to a maintainer.

If no root cause is established, return ranked hypotheses and specific experiments that distinguish them, not a fabricated diagnosis.
