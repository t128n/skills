# BDD scenarios

Use for behaviour a user or caller can observe. Put the scenarios in the spec, or in the plan if there is no spec.

- Write three to five scenarios per behaviour: the main path, at least one edge case, and at least one failure case.
- Use the domain's words, not implementation words. "When the customer cancels the order" is good. "When `DELETE /orders/42` returns `204`" is a contract detail and belongs in a contract test.
- Describe one behaviour per scenario, with concrete example values, in `Given / When / Then` form.
- Map every scenario to one automated test and name the test file. Gherkin tooling is optional. A clearly named ordinary test is fine.
- Use the tools the repository already has. If it has none, name a common one for the stack (for example Cucumber) and make installing it an explicit task.
