# Group 1: Dated prompt text

Contents: 1a pressure language, 1b scaffolds replaced by API or harness features, 1c over-specification, 1d fossils, 1e prohibition clusters, 1f output-shaping choreography.

## 1a. Pressure language

Older models needed forcefulness; current models are highly responsive to instructions, so the same text over-applies. It cuts both ways: inflated emphasis causes over-triggering and rigidity, while leftover hedges ("try to", "if possible") are read literally as permission to under-deliver.

| Before | After |
|---|---|
| `CRITICAL: You MUST use this tool when...` | `Use this tool when...` |
| `IMPORTANT: NEVER do X` (several per prompt) | The one or two real constraints, plainly, with the reason |
| `If in doubt, use [tool]` / `Default to [tool]` | Delete, or `Use [tool] when it would improve X` |
| `Be thorough. Do not be lazy. Do not stop early.` | Delete: current models are proactive by default |
| `Try to include a summary if possible` (when required) | `Include a summary.` |
| `You have a tendency to over-X` / `Don't be too verbose` | The desired behavior: `Keep responses to the length the question needs.` |

When several instructions carry a critical marker, the markers stop carrying information, and the prompt's register becomes the output's register: an anxious prompt yields a hedging model. Emphasis is a tested, scoped fix for one demonstrably underweighted instruction, not a first-draft register.

**Signals:** caps density of `MUST|NEVER|ALWAYS|CRITICAL|IMPORTANT`; `!!`; emphasis with no adjacent "because"; `try to|if possible|ideally` on real requirements; `you (tend to|often|sometimes)`; `don't be too <adjective>`.

## 1b. Scaffolds replaced by API or harness features

Replace these with the native feature. In a coding agent's configuration file the user writes no request code: still `remove` or `rewrite` the scaffold, but propose a request-parameter replacement only where the agent documents a frontmatter field for it in that kind of file (such as an effort or model field in a skill or subagent definition); otherwise say the agent's runtime settings control it. Never propose a request-code edit for such a file. A keyword the agent's documentation says it acts on is configuration there, not a scaffold; in an application's own prompt the same word is prose and these rows apply.

| Scaffold | Replacement |
|---|---|
| "Think step by step", scratchpad or thinking-tag instructions | The provider's native reasoning setting. On reasoning models the incantation is redundant; control depth through configuration. |
| "Use the think tool to plan", "plan before acting" | Delete: current models plan natively, and these cause over-planning. If behavior is still too aggressive, lower the reasoning effort instead of adding prose. |
| Prose steering thinking depth ("think harder", "don't overthink"), or any rule forbidding thinking | The reasoning-effort parameter. On always-on-reasoning models effort is the only depth control, and it cuts thinking tokens, cost, and latency more reliably than prose; a "don't think" rule cannot be obeyed there. Keep a "reply directly" line only where a measurement on a latency-sensitive route shows it helps. |
| "Show your thinking", required reasoning sections, a `reasoning` or `trace` field in JSON output or tool input | Read native reasoning blocks through the API where supported, or ask for a concise rationale. Verbatim chain-of-thought extraction can degrade accuracy or trigger refusals on models with protected reasoning. |
| Trailing assistant-turn prefill and the JSON-forcing stack around it: stop sequences, regex extraction, retry-on-parse loops, "output ONLY valid JSON" | Native structured outputs with a JSON Schema. Prefill is unsupported or errors on many current endpoints. The surrounding code is cruft too: audit the request builder. Only a **trailing** assistant turn is a prefill (a few-shot block ending on the assistant side counts); assistant turns mid-array are ordinary history and stay. |
| "Summarize progress every N tool calls"; hard word caps | Delete and re-baseline: current models narrate appropriately, and hard caps starve reasoning on hard problems. Prefer qualitative length guidance. |
| Inline lookup tables, point systems, arithmetic rubrics the model computes | Data in files or tool results; arithmetic in code. The model keeps the judgment layer. |
| Legacy token budgets, non-default sampling parameters on reasoning models, stale beta headers, dead error-retry paths | Check the provider's current SDK docs for the target. Reasoning models commonly reject or ignore sampling overrides and replace legacy thinking budgets with an effort setting. Where a parameter errors or is deprecated, remove the retry code around it too. |
| Forced tool use (`required`, `any`, a forced named tool) and JSON-via-forced-tool | A prompt instruction naming the tool under automatic tool choice (steering), or native structured outputs (extraction). Forced calls conflict with extended thinking on several APIs; use strict schema mode under automatic choice. Audit the retry-on-missing-tool loop too. |

**Signals:** `think step by step|take a deep breath`; `think (harder|less)|don'?t overthink|do not think`; `<scratchpad>|<thinking>` in instructions; `stop_sequences` guarding JSON; `json.loads|JSON.parse` in retry loops; `budget_tokens|temperature|top_p`; `every \d+ (tool calls|messages)`; `at most \d+ (words|sentences)`.

## 1c. Over-specification: describe the goal, not the method

| Pattern | Why it is cruft | Fix |
|---|---|---|
| Step-by-step choreography for judgment tasks | Scripts written for prior models are often too prescriptive for current ones; the model's own plan usually beats them | State outcomes, constraints, and how to verify; number steps only where order matters |
| Prohibition lists ("do not X, never Y, avoid Z") | Describing success beats enumerating failure; a ban on a failure the model would not make can anchor it toward that failure | Keep bans whose failure reproduces on the target; restate the rest as positive intent |
| Example over-indexing: a single gold output; stale few-shot blocks | Concrete examples are the strongest signal in a prompt; the model copies length, tone, and structure, and examples written for an older model freeze its behavior | Several deliberately varied examples labeled illustrative; delete examples of judgment the model owns; keep those pinning a format-sensitive shape |
| Bullet walls and heavy formatting for behavioral guidance | Bullets flatten priority and sever rules from reasons; prompt format bleeds into output format | Structure for reference data; prose for behavior, carrying the "because" |
| Padding: generic virtues, repetition as reinforcement, kitchen-sink edge cases, limits with escape hatches | Everything reads as actionable signal; asides get applied where they do not fit; duplicated wordings force reconciliation; bulk inflates reasoning spend | Say it once, in the right place; cover the hard judgment calls, not the easy parts |
| Grader and eval vocabulary ("you will be graded on", "hidden tests") | Describes the scoring apparatus instead of the requirement and pushes effort toward being watched | State every requirement the grader checks; never describe the grader |
| Strategy coaching beside task rules ("it's usually best to...") | The author's heuristics are wrong in some situations | If removing the sentence changes neither what is legal nor how success is measured, it is strategy: delete it |

**Signals:** `STEP \d` or numbered imperatives for non-fragile work; runs of three or more `Do not|Never|Avoid` lines; `do not hallucinate` (removal is low confidence, not a documented harm); single embedded gold outputs; near-duplicate sentences across sections; `Remember,|Again,|As stated above`; `grade|graded|rubric|hidden test`.

## 1d. Fossils: text that outlived its model

| Pattern | Why it is cruft | Fix |
|---|---|---|
| Model-version workarounds: formatting fixes, over-refusal softeners, retry hints, "known issue with [model]", date-conditional guidance | Nobody owns the removal, so prompts accumulate every generation's mitigations | Trace each mitigation to the model it patched; if that model is retired, remove it and re-test one piece at a time |
| Tool-use discouragement: "only use tools when strictly necessary", "minimize tool calls" | Current models follow these literally and fall back on stale parametric knowledge when a tool or local search would verify ground truth | Remove; where connected sources should win, state when to check them |
| Thinking-disabled mitigations: "say a sentence before a tool call", "say so if no tool fits", "no internal XML tags", reasoning in the response as a substitute for thinking | Written for non-thinking models where those artifacts leaked | Re-test and remove what no longer reproduces |
| Visual-input scaffolding: chart-reading steps, OCR or table-extraction pre-passes, mandatory crop or zoom | Built for weaker vision models; current multimodal models read charts and screenshots without hand-holding | Remove one piece at a time and re-test on your own images. Keep image tools (crop, zoom, measure) and higher-resolution inputs for dense technical drawings: the finding is about prompt text and pre-passes, not tools |
| Migration-relative phrasing: "X now works differently", "also counts", "no longer" | A diff against a prompt version the model never saw; it implies phantom alternatives | Write as if the current rules are the only rules that ever existed |
| Patch accretion: many narrow conditionals, each traced to one incident | The model navigates a maze of special cases and fails unpredictably between them; an eval win from adding a line is no evidence the stack should exist | Generalize the principle or fix the underlying context; test removals, not just additions |
| Unenforced instructions: rules no code path, eval, or reviewer checks, visibly violated in transcripts | Nothing checks them and nobody noticed, so they carry no signal; rules that could be hooks, linters, allowlists, or validators are more reliable enforced there | Enforce in code what can be enforced deterministically; delete what nothing enforces and nobody misses |
| Identity stubs standing in for context ("You are a helpful assistant") | The defect is an identity statement substituting for audience, product, and quality bar | Leave a short role line; flag it only when it is the sole context |
| Update suppressors: "hold all findings for the final response", "don't narrate", "no interim updates" | Tuned against over-narrating models; current reasoning models already under-narrate between tool calls, so long runs look frozen | Remove and re-test; if more narration is wanted, state *when* user-facing text is wanted |
| Anti-formatting rules: "never use bullets", "no headers", "no bold" | Written against over-formatting models; current models calibrate structure to context | Remove, or replace with a conditional rule saying when structure is appropriate |
| Instruction re-insertion on a cadence ("reminder: ..." every few turns) | A retention crutch for weak long-context adherence; current models retain once-stated instructions, and mutating earlier messages breaks prompt caching and reasoning continuity | Remove and re-test; where a per-turn runtime notice is required, append it as a new turn-scoped block |

**Signals:** retired model names in prompts or comments; `hold (all )?(findings|results)|don't narrate|no interim`; `internal (XML )?tags|before (each|a) tool call`; `OCR|crop|zoom|axis labels` in image-reading prompts; `never use (bullets|headers|bold)|no (bullet|header)`; `reminder:` on a turn cadence; `before|after [date]` conditionals; `now|no longer|instead of` on behavioral rules; rules whose reason nobody remembers; `^You are (a|an) (helpful|expert)` with nothing task-specific after it.

## 1e. Prohibition clusters: judge by provenance

Audit each unconditional "never / don't / must not" line by asking **does it carry a stated reason or encode a real business or policy constraint?** The question "does the target still need this guardrail?" keeps everything, because nothing is harmful to say.

- Prohibitions encoding observable constraints (refund caps, data rules, compliance language, security boundaries) stay, ideally with the reason beside them.
- Prohibitions that describe an undesirable *output style* with no provenance (banned phrases, tic lists, "don't start with 'Certainly'") are cruft: restate the style positively in one line, or attach the real reason.
- A cluster of reasoned prohibitions does not launder the no-provenance lines mixed into it; classify each line separately.

**Exception: aesthetic anti-defaults.** When a model falls back on recognizable generic defaults in creative or UI generation (boilerplate palettes, filler layouts), a vague "avoid a generic AI look" swaps one default for another: that vague line is the finding. A concrete list naming the specific defaults works: keep it, and rewrite vague lines into named patterns instead of deleting them.

## 1f. Output-shaping choreography: remove every limb

Fixed interim-update cadences ("after every third tool call, post a note"), numeric output ceilings ("under 120 words", "at most five bullets"), and cut-the-detail instructions are one over-constraint pattern, written for models that padded or rambled. Remove them together. A stated operational reason ("queue throughput", "supervisors skim") does not turn a numeric clamp into a keeper: re-express the goal as audience and outcome framing ("replies are scannable and answer only what was asked"), and keep a genuinely format-sensitive requirement as a format instruction, not a word count. Removing the cadence while keeping the ceilings leaves the pattern in place.
