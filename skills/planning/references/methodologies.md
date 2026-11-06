# Planning methods and document types

Choose the smallest useful artifact set, following project conventions first. These names describe different things, not mandatory phases or interchangeable documents.

| Item | Kind and use | Avoid when |
| --- | --- | --- |
| Product Requirements Document (PRD) | Product requirements document: users, problems, outcomes, scope, and success measures. | The product intent is already clear or the work is a narrowly technical fix. |
| Software Requirements Specification (SRS) | Requirements document: precise functional and nonfunctional behavior, interfaces, and verification; useful for complex or contractual requirements. | A lightweight specification captures the needed behavior without extra formality. |
| Request for Comments (RFC) | Review process and usually a proposal document: invite feedback on a consequential change, alternatives, and trade-offs before deciding. | The approach is routine, already agreed, or does not need broad review. |
| Technical Design Document (TDD) | Design document: technical solution, interfaces, behavior, and trade-offs for implementation. | A concise plan or existing design communicates the solution. TDD here does not mean test-driven development. |
| Software Design Document (SDD) | Design document: software structure, components, interfaces, and behavior; often used where detailed design is expected. | A TDD or existing design already covers the same material; do not duplicate it. |
| Architecture Decision Record (ADR) | Decision record: context, decision, consequences, and status for a consequential architectural choice. | The choice is routine, temporary, or lacks a meaningful decision to preserve. |
| Definition of Ready (DoR) | Readiness criteria: agreed conditions for starting work, such as sufficiently clear scope and dependencies. | Used as a bureaucratic gate for a simple task or to demand certainty where discovery is the work. |
| Definition of Done (DoD) | Completion quality criteria: shared expectations such as tests and documentation, supplemented by task-specific acceptance criteria. | Treated as a substitute for verifying the specific requirement, or applied without regard to project practice. |

An RFC can lead to an ADR after a decision, but neither automatically requires the other. A specification describes what is needed; a design explains how; an implementation plan explains execution. Link authoritative documents rather than repeating them. A direct request for one artifact does not authorize creating the others.
