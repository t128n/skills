# Decision lenses

These heuristics help generate questions, not conclusions. Their names and memorable formulations are not evidence that they apply to a particular decision. Check the mechanism against the situation and seek relevant evidence; skip any lens that does not add insight.

## Architecture and systems

- **Conway's Law:** Systems often reflect communication structures. For designs spanning teams, ask who owns the boundaries and how coordination affects the architecture. Organizational structure influences design but does not determine it.
- **Gall's Law:** Successful complex systems often evolve from simpler working systems. For migrations or new platforms, ask whether a smaller working slice can validate the design. Incremental evolution is not always feasible or sufficient.
- **Hyrum's Law:** Consumers may rely on any observable behavior of an established interface. Before changing an API or implementation, investigate actual dependencies, compatibility, and migration paths; not every behavior has a dependent user.
- **Occam's Razor:** Prefer the simplest explanation or solution that adequately fits the evidence and requirements. Compare full lifecycle complexity, not just component count; simplicity alone does not establish correctness.
- **Chesterton's Fence:** Understand why existing behavior or infrastructure exists before removing it. Look for its original purpose and current dependents, while recognizing that obsolete safeguards can still be retired with evidence.
- **Tesler's Law:** Some complexity may be inherent and shifted between system, operator, and user rather than eliminated. Ask who bears the complexity and whether a requirement itself can be simplified.
- **Lehman's laws:** Long-lived software needs adaptation, and complexity can accumulate without active management. Consider maintenance and evolution costs, but do not assume a fixed rate or trajectory for every system.

## Delivery and prioritization

- **Brooks's Law:** Adding people to a late software project can increase coordination and onboarding costs before adding capacity. Examine task partitioning and ramp-up time; targeted expertise or independently parallel work can still help.
- **Hofstadter's Law and planning fallacy:** Estimates often miss uncertainty and unknown work. Use comparable historical outcomes, ranges, and explicit assumptions where available; neither rule supplies a justified contingency percentage.
- **Parkinson's Law:** Work can expand to fill available time. Ask whether scope, feedback cadence, or incentives encourage unnecessary work, without assuming every deadline buffer is waste.
- **Pareto principle:** A small share of effort or causes may account for a large share of outcomes. Look for disproportionate opportunities and measure them; do not assume an 80/20 split.
- **Sunk-cost fallacy:** Past expenditure cannot be recovered. Compare future costs and benefits of the available options, while accounting for relevant existing assets, switching costs, and commitments.
- **Law of triviality (bikeshedding):** Familiar minor issues can attract disproportionate discussion. Allocate attention by decision impact and uncertainty, not by ease of participation; small details can still matter.

## Metrics and people

- **Goodhart's Law:** A measure used as a target can lose value as people optimize for it. Check incentives, unintended behavior, and complementary measures; targets do not automatically invalidate metrics.
- **Hanlon's Razor:** Apparent malice may have an ordinary explanation such as misunderstanding or misaligned incentives. Investigate before attributing intent, without dismissing evidence of deliberate harm or excusing its effects.
