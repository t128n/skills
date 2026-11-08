# @t128n/skills

A curated, reproducible skill pack. It publishes my own skills and a pinned selection of upstream skills as an Agent Skills Discovery v0.2.0 site on GitHub Pages.

## Install

```sh
npx skills add https://t128n.github.io/skills/ -g
```

List the skills first with `npx skills add https://t128n.github.io/skills/ --list`. The machine-readable index is at <https://t128n.github.io/skills/.well-known/agent-skills/index.json>.

## Repository layout

| Path                    | Purpose                                                                 |
| ----------------------- | ----------------------------------------------------------------------- |
| `skills/<name>/`        | Own skills. The directory name is the skill name.                       |
| `skills.config.json`    | Wanted external skills (what, not which version).                       |
| `skills.lock.json`      | Approved resolution of each external skill: a commit or an artifact digest. |
| `vendor/sha256/<hex>`   | Approved bytes of website skills, named by their digest.                |
| `schemas/`              | JSON Schemas for the config, the lockfile and the discovery index.      |
| `lib/`                  | The build tool (Bun, TypeScript).                                       |
| `tests/`                | Tests. They use local git repositories and stubbed HTTP, no network.    |
| `dist/`                 | Generated site. Not committed.                                          |

## Add a skill

**Own skill.** Create `skills/<name>/SKILL.md` with `name` (same as the directory) and `description` in the frontmatter. Add any `references/`, `templates/` or `scripts/` next to it. A skill with only `SKILL.md` is published as a plain `SKILL.md`; any other skill is published as a `.tar.gz` archive.

**GitHub skill.** Add an entry to `skills.config.json`:

```json
{ "source": "owner/repo", "skill": "skill-name" }
```

Optional fields: `ref` (branch, tag or commit; default is the default branch), `path` (directory of the skill when the name is ambiguous), `as` (publish under another name).

**Website skill.** Add a site that publishes a skill index:

```json
{ "site": "https://example.com", "skill": "skill-name" }
```

The site must serve `/.well-known/agent-skills/index.json` (v0.2.0), or the older `/.well-known/skills/index.json` with a `files` list.

After editing the config run `bun run skills:resolve`, review `skills.lock.json` and `vendor/`, and commit them with the config change.

## How resolution and locking work

- `skills.config.json` says which skills are wanted. `skills.lock.json` says which exact version is approved. A GitHub skill is locked to a full commit SHA. A website skill is locked to the SHA-256 digest of its artifact, and the approved bytes are stored in `vendor/sha256/`.
- **`bun run build` never uses the network for website skills and never changes the lockfile.** It fetches only the locked commits from GitHub. If the lock does not match the config, it fails and tells you to run `skills:resolve`.
- **`bun run skills:resolve`** adds missing entries and removes entries that are no longer in the config. It keeps entries that were already approved.
- **`bun run skills:update`** looks up the newest upstream version of every dependency and rewrites the lock. It prints a summary with old and new SHAs or digests, compare links and changed scripts. Review the diff before you merge.
- The lockfile and the vendor files are written only after the complete new site has been built and verified, and the lockfile is written last. A failed run leaves the approved state unchanged.

External content is untrusted. The tool uses hardened git (no prompts, no hooks, no user config, one transport), HTTPS only (also for redirects), size and time limits, and rejects symlinks, submodules, path traversal and unsafe archive entries.

## Update dependencies

The workflow `.github/workflows/update-skills.yml` runs `skills:update` every day. It runs typecheck, tests, a complete build and verification, and then opens or updates **one pull request** (`chore/update-skills`). It does nothing when there are no changes. It never merges and never deploys. Merging the pull request runs the deploy workflow.

Pull requests that GitHub Actions opens with the default token do not start other workflows. For that reason the update workflow runs the checks itself.

Run it locally with `bun run skills:update`.

## Build and verify

```sh
bun install --frozen-lockfile
bun run typecheck
bun test
bun run build            # writes dist/
bun run skills:verify    # checks dist/: structure, index, URLs, digests, archive contents
bun run skills:verify --base-url https://t128n.github.io/skills/   # checks a deployed site
```

`build` writes to a staging directory, verifies it, and then replaces `dist/`. If anything fails, the previous `dist/` stays. A build lock stops two builds from running at the same time, and an interrupted swap is repaired on the next run.

The output is byte-for-byte reproducible: archives are sorted, have fixed time stamps and owners, and use a normalised gzip header.

Tool versions are pinned in `mise.toml` (Bun 1.4.4) and `package.json`.

## Deployment

`.github/workflows/pages.yml` runs on every push to `main` that changes skills, the tool, the lock or the vendor store. It installs with a frozen lockfile, typechecks, tests, builds, verifies, uploads `dist/` (including hidden files) and deploys with the official Pages actions. Pull requests run the same build and verification but do not deploy. After the deployment, a job checks the live site over HTTP (GET and HEAD, no redirects, content types, digests). If a build fails, the last good deployment stays live.

The site is a GitHub Pages project site: `dist/` is the root of `https://t128n.github.io/skills/`. Index URLs are relative to the index directory, so the site does not depend on its host name. All actions are pinned to commit SHAs.

## Intentional behavior changes from v1

- `bun run build` no longer updates the lockfile and does not use the network for website skills. Use `skills:resolve` and `skills:update`.
- The lockfile is sorted, validated with a JSON Schema, and now has a `$schema` field. Entries have the same keys and values as before (`{ "commit": ... }` or `{ "digest": ... }`).
- Website skills are served from `vendor/` bytes. If upstream changes, nothing changes until you run `skills:update`.
- Archives are created with `modern-tar` and `node:zlib` and are deterministic. The digests of archives can therefore differ from the v1 archives.
- The `[source: ...]` text is added to the index description of archives only. It is not added to a lone `SKILL.md`, because that file is served unchanged and its description comes from the file itself. The source of a website skill in the description is now the site, not the `SKILL.md` URL.
- Executable bits of GitHub skills come from git file modes, so archives are the same on every platform. Executable bits of own skills come from the local file system. A build on Windows can therefore differ from a build in CI for own skills with scripts.
- A website skill without a v0.2.0 index must list the file `SKILL.md` exactly.
- Updates arrive as one reviewed pull request (`chore/update-skills`) instead of a bare lockfile change.

## Licenses

Mirrored skills belong to their authors and keep their original files and license notices. The index description of an archive names the upstream source. Check the license of each new upstream dependency before you publish it.
