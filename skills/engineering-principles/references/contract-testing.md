# Consumer-driven contract tests

Use for a request, response, event, or schema that crosses a service or team boundary. Name the consumers, the contract change, and the provider verification in the spec, or in the plan if there is no spec.

- List every known consumer of the interface being changed. Search the repository and its docs. If consumers live elsewhere and cannot be found, record that as a risk.
- Classify the change as additive or breaking. Removing or renaming a field, tightening a type, and changing semantics are breaking.
- Order the work so the consumer's expectation is written or updated first, the provider is verified against it second, and the implementation comes third.
- A breaking change needs an expand-then-contract migration: add the new shape, move consumers over, and remove the old shape in a later change. Do only the first stage unless the user says otherwise. A breaking change also warrants an ADR.
- Name where provider verification runs in CI and what blocks a deploy.
- Use the tools the repository already has. If it has none, Pact is a common choice. Make installing it an explicit task.
