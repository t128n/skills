# Property-based tests

Use for pure logic, parsers, serializers, data transforms, and state machines. Put the named properties and generators in the spec, or in the plan if there is no spec.

State each property as one sentence that holds for all valid inputs, then describe the generator. Look for these shapes:

- **Round trip:** decoding an encoded value returns the original.
- **Idempotence:** applying the operation twice equals applying it once.
- **Invariant:** something stays true after every operation, such as a balance never going negative or a list staying sorted.
- **Model comparison:** the fast implementation agrees with a simple, obviously correct one.
- **Metamorphic:** a known change to the input causes a known change to the output.

Describe generators precisely, including awkward inputs: empty, very large, unicode, duplicates, and boundary values. When a property test finds a failing case, the shrunk case becomes a permanent example test.

Do not force properties onto glue code, UI wiring, or code whose only behaviour is calling other services. Example tests serve those better.

Use the tools the repository already has. If it has none, name a common one for the stack (Hypothesis, fast-check, jqwik, or proptest) and make installing it an explicit task.
