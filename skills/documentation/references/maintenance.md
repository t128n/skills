# Documentation maintenance and drift

When maintenance or a review is in scope:

1. Identify the relevant documents, their audience and status, and the code, configuration, tests, or decisions that can substantiate their claims. Limit the investigation to the requested scope.
2. Compare meaningful claims and examples with available evidence, including interfaces, defaults, prerequisites, behavior, and operational procedures where relevant. A lack of evidence is not proof of incorrectness; record uncertainty and conflicting sources.
3. Update affected authoritative documents or report findings as requested. Preserve proposals and historical decisions as such; do not silently rewrite history or assert that intended behavior is implemented. Remove redundant material only when its useful content is preserved or genuinely obsolete.
4. Run appropriate existing checks for links, formatting, examples, and technical consistency when feasible. Report broken or unverified references, untested commands, and validation limitations. Do not add tools or dependencies solely to create a checklist.

Code search and agent judgment can help locate drift but cannot guarantee completeness. Documentation guidance does not provide semantic indexing, backlinks, graph validation, or automated code-reference checks; use existing deterministic tools where available and describe their actual coverage.
