# Task decomposition

Trace work from the requirements and chosen architecture to deliverables and verification. Make tasks cohesive enough to deliver meaningful progress, small enough to review and verify, and few enough to understand. Include migration, integration, rollout, and cross-cutting verification when relevant; discovery can be a task with an explicit decision or evidence as its deliverable.

Give each task a stable ID such as `T1`, unchanged within the plan and shared by tables and diagrams. Describe its deliverable and boundary, explicit prerequisite IDs (or `none`), consumed and produced interfaces or contracts when relevant, and observable completion and verification criteria. Note ownership boundaries or file areas when known without inventing owners. Distinguish task acceptance from the overall requirement it satisfies; link the authoritative requirement where available.

For example:

| ID | Deliverable and boundary | Prerequisites | Completion and verification |
| --- | --- | --- | --- |
| T1 | Agree on the API contract | none | Contract reviewed; request and response examples cover the required behavior. |
| T2 | Implement the producer against the contract | T1 | Contract tests pass for the producer. |
| T3 | Implement the consumer against the contract | T1 | Consumer tests pass using contract fixtures. |
| T4 | Integrate producer and consumer | T2, T3 | End-to-end test passes against both components. |

Model a prerequisite edge from prerequisite to dependent. Check that all IDs exist and the graph is acyclic. Derive execution waves by topological ordering: wave 1 contains tasks with no prerequisites; each later wave contains tasks whose prerequisites are all in earlier waves. In the example, the waves are `T1`, then `T2` and `T3`, then `T4`. Identify critical dependencies and integration points; without reliable durations, do not claim a time-based critical path.

Parallelize only when deliverables and interfaces are sufficiently independent. Establish the interface contract before producer and consumer implementations run in parallel; test each against it and integrate afterward. Avoid concurrent modification of the same files where practical; otherwise coordinate ownership or serialize the work. A shared prerequisite does not make its downstream tasks independent if they also compete for the same resources or mutable files.

Effort estimates are uncertain amounts of work, not calendar commitments. Actual schedules require agreed availability, durations, dependencies, and constraints. Do not invent estimates, people, or dates. Do not build or operate a scheduler: the plan describes possible work, not an execution engine.
