# Domain & Conceptual Glossary Reference

Use this format when readers need more than a translation table—for example when onboarding new team members, documenting a complex domain, or aligning product, engineering, and support on shared concepts.

## When to prefer this over a table

- Concepts need multi-sentence definitions, concrete examples, or counter-examples.
- Terms have subtle relationships (*is a type of*, *contains*, *replaces*) that do not fit in a narrow `Notes` column.
- The project is single-language, or each language maintains its own conceptual glossary.

## Entry structure

Keep every entry uniform so readers can scan quickly:

```markdown
### <Canonical Term>

<One- to two-sentence definition starting with what it is, not "A <term> is...".>

- **Context / Example:** <Concrete example from this project.>
- **Avoid:** <Rejected synonyms, legacy names, or confused terms.>
- **Related:** [<Other Term>](#other-term)
```

Omit `Avoid` or `Related` on an entry only if there is genuinely nothing to say; keep `Definition` and `Context / Example` for every entry.

## Good example

```markdown
# Domain Glossary

Shared vocabulary for the Skill Registry project. For bilingual documentation rules, see [the writing glossary](../writing/glossary.md).

## Core concepts

### Lockfile

A machine-generated JSON file (`skills.lock.json`) that pins the exact resolved source, version, and integrity hash for every installed skill.

- **Context / Example:** Running `bun run skills:resolve` updates `skills.lock.json` without modifying `skills.config.json`.
- **Avoid:** manifest, config file (those refer to `skills.config.json`).
- **Related:** [Skill Manifest](#skill-manifest), [Source](#source)

### Skill Manifest

The YAML frontmatter at the top of a `SKILL.md` file declaring the skill's `name` and `description` used for discovery and triggering.

- **Context / Example:** `skills/write-doc/SKILL.md` begins with a manifest naming `write-doc`.
- **Avoid:** skill header, skill config.
- **Related:** [Lockfile](#lockfile)

### Workspace

An isolated directory tree where an agent or developer reads and modifies files for a single task or repository.

- **Context / Example:** A subagent invoked with `workspace: "branch"` receives its own cloned workspace.
- **Avoid:** repo folder, sandbox (a sandbox restricts execution; a workspace is the directory tree).
- **Related:** [Sandbox](#sandbox)
```

## Organization rules

- **Group by domain or sort A–Z:** For 15 or fewer entries, a flat alphabetical list works best. Above that, group into 3–5 domain sections (`## Core concepts`, `## Lifecycle & state`, `## Infrastructure`) and alphabetize within each section.
- **Link related terms:** Use markdown anchor links (`[Term](#term)`) so readers can jump between related concepts.
- **Keep definitions self-contained:** Avoid defining Term A purely in terms of Term B if Term B hasn't been introduced yet.
- **Add a quick-reference table if bilingual:** If the project also needs EN/DE term mapping, link to `docs/writing/glossary.md` rather than duplicating translation rules inside every conceptual entry.
