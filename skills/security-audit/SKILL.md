---
name: security-audit
description: Audit code for security vulnerabilities using local Gitleaks, Semgrep, and Trivy scans plus contextual code review. Use for /security, requests to run a security check or audit vulnerabilities, and security-focused reviews of pull requests or pre-commit changes. Do not use for ordinary PR reviews without a security-audit request, or explicit requests to run deepsec.
---

# Security audit

Combine scoped deterministic scans with a contextual review. Scanners produce leads, not proof that a vulnerability is exploitable or that unreported code is safe. Do not modify code, install tools, upload source, or publish findings without authorization.

## 1. Establish scope and check tools

- By default, audit the net changes to tracked files between `HEAD` and the working tree: `git diff HEAD` includes both staged and unstaged changes as they appear in the working copy. It does not include untracked files or staged content subsequently overwritten in the working tree. State these limitations; include those inputs only when requested. If `HEAD` is unavailable, explain the limitation and agree on a suitable scope rather than silently scanning the repository.
- Honor an explicitly requested PR, commit range, staged-only, or whole-repository scope. Identify the exact base and target; don't substitute the local working tree for a PR. If the requested content is not locally available, explain what is needed rather than fetching private content without authorization.
- Determine changed paths safely, including names containing whitespace or special characters; account for renames and deletions. Read relevant surrounding code for context. Scan existing target versions of changed files, not deleted paths. If there are no in-scope changes, report that and stop instead of expanding scope.
- Check availability and runnable versions of `gitleaks`, `semgrep`, and `trivy`, using the project's mise environment and conventions. Inspect installed help for version-specific flags. Do not install or upgrade tools automatically. If a tool is missing, incompatible, fails, or cannot cover the requested content, continue with available checks and mark its coverage as incomplete.
- Check whether rule retrieval, vulnerability database updates, remote scanning, telemetry, or authentication would require network access or transmit source or findings. Prefer local, cached rules and databases and disable remote submission. Obtain authorization before external communication; if required data is unavailable offline, report the affected check as incomplete. Never treat a stale or unavailable database as a clean result.

## 2. Run deterministic checks

Use non-interactive, machine-readable output and capture each tool's exit status separately from its findings. Check each tool's documented exit codes: findings, execution failures, and incomplete scans are different states. Run independent checks in parallel only when safe and supported. Keep raw output out of the response; protect any temporary output, redact secrets, and remove temporary artifacts when done.

- **Gitleaks — secrets:** Scan the selected content using redaction and a machine-readable report. For the default scope, inspect the `HEAD`-to-working-tree diff for newly introduced secrets, including secrets in non-source files; do not claim that a `--no-git` filesystem scan is a diff scan. If the installed version cannot scan the selected patch reliably, use a safe supported alternative or report the limitation. Whole-repository mode scans the current tree; scan git history only when explicitly requested. Never reproduce secret values in output, logs, or findings.
- **Semgrep — first-party SAST:** Use available local, language-appropriate custom or OWASP-oriented SAST rules, excluding secret rules at selection time when possible. Do not assume `--config auto` is offline, OWASP-only, or excludes secrets. Scan relevant in-scope files, then correlate findings with changed lines or affected behavior; inspect surrounding context before excluding a finding. Report rule coverage and findings outside changed lines when relevant to the change. If secret rules cannot be excluded, identify and deduplicate their results rather than presenting duplicate findings.
- **Trivy — SCA and IaC:** Limit scanners to vulnerabilities and misconfigurations, not secret or experimental code scanning; use HIGH and CRITICAL as the default severity filter. Target relevant dependency manifests, lockfiles, and infrastructure configuration within scope. Dependency resolution may require surrounding project files or a project-root scan; if so, disclose the broader scan and correlate results to the change without claiming that unchanged dependencies are newly introduced. If the installed tool cannot safely scan the requested snapshot or scope, mark the check incomplete rather than silently scanning more broadly. Lower severities are not assessed unless requested.

File-level scans can surface pre-existing issues and cannot by themselves prove that a finding was introduced by a change. Conversely, filtering only to changed lines can hide vulnerabilities caused by a change elsewhere. Use baseline comparison when available and explain attribution uncertainty. Follow tool ignore files and exclusions only after considering whether they hide in-scope coverage; report meaningful exclusions.

## 3. Semantic logic and boundary audit

Focus on the selected changes (by default, `git diff HEAD`), reading surrounding code only as needed to verify implementation flaws. For an explicitly requested whole-repository audit, review relevant entry points in that scope. Avoid generic advice and speculative scenarios.

1. **Trust boundaries:** Trace new or modified entry points to determine whether tenant, organization, and user identifiers are checked against the authenticated context before database queries or mutations.
2. **Input bounds:** Check whether incoming payloads are appropriately validated for size, type, and format before deserialization or storage.
3. **State and concurrency:** Check whether changed multi-step operations introduce race conditions or lack necessary transaction boundaries.

Trace applicable protections before raising an issue. Cite concrete evidence and attack preconditions, and distinguish confirmed vulnerabilities from risks requiring verification. Don't dismiss scanner findings without a reason; disclose missing context.

## 4. Report

Lead with the outcome and scope. Provide a coverage table for secrets, SAST, SCA/IaC, and semantic review, including tool/source, status (completed, incomplete, skipped, or failed), confirmed finding counts by severity, and consequential limitations. A successful execution with findings is not a clean pass; an incomplete check is never a pass. Mark counts as not assessed where filters or missing coverage prevent them. Describe the rule sets, database freshness if known, exclusions, and whether a finding is new or pre-existing when material.

List actionable findings in severity order. For each, include:

- Severity and concise title; source and rule ID, CVE, or CWE when known.
- File and line, or dependency and manifest location; use version-appropriate locations for non-working-tree snapshots.
- Evidence, impact, attack preconditions, and confidence or attribution uncertainty. Do not include secret values.
- A direct, specific remediation and a validation step.

Summarize relevant suspected issues separately from confirmed findings. If no vulnerabilities are confirmed, say so without asserting the code is secure. Include tool failures, missing coverage, skipped checks, and meaningful uncertainty even when there are no findings.
