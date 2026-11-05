# @t128n/skills

A thin skills collection with two kinds of skills:

| Kind          | Lives in                  | Installed with                    |
| ------------- | ------------------------- | --------------------------------- |
| Hand-rolled   | `skills/<name>/SKILL.md`  | `npx skills add t128n/skills`     |
| Upstream      | `upstream.txt`            | `install.sh` / `Install.ps1`      |

`npx skills add` only installs skills committed in this repository. The upstream
list is installed separately by the scripts, so third-party skills stay in their
original repositories.

Requires Node.js 22.20 or later.

## Install

### This repository's skills

```bash
npx skills add t128n/skills -y        # project scope
npx skills add t128n/skills -g -y     # global scope
```

`-y` installs every skill without prompting; omit it to pick interactively.
Install one skill with:

```bash
npx skills add t128n/skills -g --skill my-skill -y
```

On Windows, add `--copy` if symlink creation fails.

### Upstream skills

macOS / Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/t128n/skills/HEAD/install.sh | bash
```

Windows (PowerShell):

```powershell
irm https://raw.githubusercontent.com/t128n/skills/HEAD/Install.ps1 | iex
```

Or clone the repository and run the script locally:

```bash
git clone https://github.com/t128n/skills
cd skills
bash install.sh              # macOS / Linux
pwsh -File ./Install.ps1     # Windows
```

Both scripts install globally for the `opencode` agent. Set `SKILLS_COPY=1` to
copy files instead of creating symlinks, or point `SKILLS_MANIFEST` at a
different list.

## Adding a hand-rolled skill

Create `skills/<name>/SKILL.md`:

```markdown
---
name: my-skill
description: What it does and when to use it
---

# My Skill

Instructions for the agent.
```

Keep the name distinct from upstream skills so the two installs do not collide.
Preview what the repository provides with:

```bash
npx skills add t128n/skills --list
```

## Adding an upstream skill

Append a `source@skill` line to [`upstream.txt`](upstream.txt), then run the
install script again.

```txt
owner/repo@skill
owner/repo#v1.2.3@skill          # pinned tag or commit
https://hugorcd.com@document-pr  # well-known host + skill name
```

Blank lines and lines starting with `#` are ignored.
