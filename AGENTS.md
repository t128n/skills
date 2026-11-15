# Skill Pack Notes

## Naming

- Names are lowercase, hyphenated, English, without abbreviations, and at most three words. The directory name equals `name:` in `SKILL.md`.
- Three kinds of skill, each with its own pattern:
  - **Action** (a workflow the agent runs): `<verb>-<object>`, with the verbs `write-`, `review-` and `setup-`. Example: `write-documentation`, `write-rfc`.
  - **Reference** (knowledge the agent applies): `<topic>-principles` or `<topic>-guidelines`. Example: `engineering-principles`, `german-writing-guidelines`.
  - **Integration** (a tool or service): the tool's name. Example: `github`. A skill that overrides an upstream skill keeps the upstream name (`agent-browser`).
- A slash command that wraps a skill has the same name as the skill.

## Frontmatter

- `name:` unquoted. `description:` in double quotes.
- The description starts with an imperative verb, says what the skill does, then "Use when …". It stays under 1024 characters.

## Layout

- Own skills live in `skills/<name>/`. External skills are declared in `skills.config.json`; a `{ "source": "owner/repo" }` entry without `skill` takes every skill of that repository, and `exclude` removes names from it.
- Run `bun run skills:resolve` after changing `skills.config.json`, then `bun run skills:verify` and `bun test`.
