# GitHub context

Collect the **minimum sufficient, verifiable context** for a downstream engineering task. This workflow is strictly read-only: no comments, labels, reviews, edits, pushes, or merges.

## Read operations

Always scope commands to the resolved host and repository using `-R HOST/OWNER/REPO` (or `GH_HOST=HOST` + `GH_REPO=OWNER/REPO`) to avoid ambiguity or falling back to `github.com`:

```bash
gh issue view 123 -R HOST/OWNER/REPO --json number,title,body,state,labels,assignees,author,url,comments

gh pr view 456 -R HOST/OWNER/REPO --json number,title,body,state,isDraft,baseRefName,headRefName,headRefOid,author,url,files,commits,reviews,reviewDecision,statusCheckRollup

gh pr diff 456 -R HOST/OWNER/REPO --name-only
gh pr checks 456 -R HOST/OWNER/REPO

gh issue list -R HOST/OWNER/REPO --search 'relevant terms' --limit 20
gh pr list -R HOST/OWNER/REPO --search 'relevant terms' --limit 20
```

For large PRs, inspect filenames first, then targeted patches or source files; diff output can be truncated. Use `gh api --hostname HOST` (or `GH_HOST=HOST gh api ...`) for information unavailable in `gh ... --json`, including review threads, check annotations, timelines, or workflow runs. Prefer structured `--jq`/`jq` filtering over forwarding raw API payloads.

For local history:

```bash
git log --oneline -n 25 -- path/to/area
git blame -L START,END -- path/to/file
```

For failures, connect checks to exact `headRefOid`/commit SHA; distinguish PR-head, merge-ref, and base-branch results. For issue links, distinguish explicit references from inferred similarity.

## Optional `ghfs`

If installed and already synchronized, use `ghfs`'s issue/PR index to find potential matches, then confirm titles, status, and facts through `gh` before relying on them. Treat the mirror as a cache, not authority. Do not run `ghfs execute --run`, edit its action queue, or assume cached content is current. For a single object, `gh` alone is usually sufficient.

## Handoff

Return only what the task needs:

- **Target:** repository, object number/URL, relevant SHA(s).
- **Facts:** requirements/observations, current PR/issue/check state, and source links.
- **Related work:** most relevant issues, PRs, commits, with why they matter.
- **Gaps:** missing logs, inaccessible resources, stale evidence, or unresolved ambiguity.

Do not prescribe a root cause based solely on metadata.
