# Group 3: Tool descriptions

The rubric is **precision and contract accuracy, not brevity**. Detailed descriptions are the largest factor in tool performance, and the most common failure is *under*-description. What changed on current models is which content belongs there: contract and mechanics in, behavioral steering and worked examples out. A description is a man page: what the tool does, when to use it and when not to, what each parameter means, caveats, what it does not return.

| Pattern | Direction | Fix |
|---|---|---|
| Vague one-liners; parameters without descriptions; no when-not-to-use | Under-described: `add` | Three or four sentences minimum; the description must match actual behavior, because a contract/behavior mismatch sends the model down paths no prompt text can fix |
| `CRITICAL: You MUST use this tool when...` | Over-steered: dial back | `Use this tool when...`; boosters written against under-triggering models now cause over-triggering |
| Worked examples, fake dialogue turns, embedded protocols (numbered workflows, heredocs), in any quantity, even ones that "measurably lift the call rate" | Misplaced: `move` | Examples constrain exploration and cost tokens on every request; move teaching material to skills or progressive disclosure; make parameters expressive (well-named enums carry intent) |
| Scolding cross-references (`ALWAYS use X, NEVER use Y for this`) and behavior smuggling ("after showing results, always recommend...") | Misplaced: `move` or `remove` | A description is a contract about functionality, not a channel for conversational instructions; put a preference for tool X in X's description, not scattered across its rivals |
| Tool names in the system prompt; prose lists shadowing the real tool list | Duplicated: `remove` | The system prompt names no tools, so enabling or disabling one never leaves a dangling reference. Do not expose tools invalid in the current configuration |
| Near-duplicate overlapping tools; bloated response payloads; catalogs of 30+ always-loaded tools | Structural | Fewer, clearly bounded tools with explicit boundaries in both descriptions; high-signal responses; past a few dozen tools use tool search or deferred loading |

## Trigger text is not behavioral text

Text whose job is routing (a skill's frontmatter `description`, a trigger block) may carry calibrated urgency, because skills can under-trigger; ideally it is tuned against a trigger eval. Text whose job is behavior explains rather than shouts. The two look identical to a grep, so classify by function before flagging.

**Signals:** descriptions under about three sentences (add); `MUST|ALWAYS|NEVER` steering behavior inside descriptions (dial back); fake dialogue or worked examples in descriptions (move); tool names in system-prompt prose (delete).
