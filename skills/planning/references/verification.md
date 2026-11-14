# Verification techniques

State how each piece of work will be verified before saying how to build it. Pick techniques by what the change touches; a change may need more than one row, and many need none beyond ordinary example tests.

| The change touches | Technique | Put in the spec (or plan if no spec) |
| --- | --- | --- |
| Behaviour a user or caller can observe | BDD scenarios | `Given/When/Then` scenarios |
| Pure logic, parsers, serializers, data transforms, state machines | Property-based tests | Named properties and generators |
| A request, response, event, or schema that crosses a service or team boundary | Consumer-driven contract tests | Consumers, contract change, provider verification |

Use the tools the repository already has. If it has none for a chosen technique, name a common one for the stack (for example Hypothesis, fast-check, jqwik, or proptest for properties; Cucumber or plain test names for scenarios; Pact for contracts) and make installing it an explicit task.

In a specification or plan, a verification section may say `Not applicable: <reason>` only with an explicit reason so skipping is a deliberate, reviewable choice.

## BDD scenarios

- Write three to five scenarios per behaviour: the main path, at least one edge case, and at least one failure case.
- Use the domain's words, not implementation words. "When the customer cancels the order" is good; "when `DELETE /orders/42` returns `204`" is a contract detail and belongs in the contract section.
- Describe one behaviour per scenario, with concrete example values.
- Map every scenario to one automated test and name the test file. Gherkin tooling is optional; a clearly named ordinary test is fine.

## Property-based tests

State each property as one sentence that holds for all valid inputs, then describe the generator. Look for these shapes:

- **Round trip:** decoding an encoded value returns the original.
- **Idempotence:** applying the operation twice equals applying it once.
- **Invariant:** something stays true after every operation, such as a balance never going negative or a list staying sorted.
- **Model comparison:** the fast implementation agrees with a simple, obviously correct one.
- **Metamorphic:** a known change to the input causes a known change to the output.

Describe generators precisely, including awkward inputs: empty, very large, unicode, duplicates, and boundary values. When a property test finds a failing case, the shrunk case becomes a permanent example test—include that rule in the plan.

Do not force properties onto glue code, UI wiring, or code whose only behaviour is calling other services; example tests serve those better.

## Consumer-driven contract tests

- List every known consumer of the interface being changed. Search the repository and its docs; if consumers live elsewhere and cannot be found, record that as a risk.
- Classify the change as additive or breaking. Removing or renaming a field, tightening a type, and changing semantics are breaking.
- Order tasks so the consumer's expectation is written or updated first, the provider is verified against it second, and the implementation comes third.
- A breaking change needs an expand-then-contract migration: add the new shape, move consumers over, and remove the old shape in a later change. Plan only the first stage unless the user says otherwise. A breaking change also warrants an ADR.
- Name where provider verification runs in CI and what blocks a deploy.
