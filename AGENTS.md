# Engineering

Build the smallest correct solution using established project conventions.

- Inspect relevant code and context before making changes.
- Prefer proven dependencies and existing abstractions.
- Fix root causes, not symptoms.
- Avoid speculative complexity and unrelated refactoring.
- Validate untrusted input at boundaries; trust established internal contracts.
- Preserve intentional behavior and architectural invariants.
- For nontrivial stateful or I/O changes, use the `engineering-principles` skill.
- Use GitHub context when working on issues, PRs, regressions or CI failures.
- Establish expected behavior before significant feature changes.
- Write durable specifications or decisions when future maintainers need the rationale.
- Verify affected behavior with appropriate checks.
- Do not claim tests passed unless they actually ran.
- Keep PRs focused and explain why the change matters.

Use subagents for independent work when parallelism provides clear value.
Do not create plans, documentation or abstractions without a concrete need.
