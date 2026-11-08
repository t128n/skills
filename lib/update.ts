import { appendFileSync, existsSync, readFileSync } from "node:fs";
import {
  assertLockMatchesConfig,
  depKey,
  isGithubDep,
  loadConfig,
  loadLock,
  type Config,
  type Dep,
  type Lock,
} from "#lib/config.ts";
import type { Paths } from "#lib/constants.ts";
import type { Context } from "#lib/context.ts";
import { hasVendored, pruneVendored, readVendored, writeFileAtomic, writeVendored } from "#lib/filesystem.ts";
import { digestHex, diffLocks, serializeLock, type LockChange } from "#lib/lock.ts";
import { type Published } from "#lib/registry.ts";
import { assemble, stageAndVerify } from "#lib/build.ts";
import { buildGithubSkill, resolveGithubCommit } from "#lib/sources/github.ts";
import { fetchSiteArtifact, publishSiteSkill } from "#lib/sources/site.ts";
import { fail, sha256 } from "#lib/utils.ts";

export type Mode = "resolve" | "update";

/** Pick the new resolution of every dependency. Network access happens here and only here. */
async function resolveAll(
  paths: Paths,
  config: Config,
  before: Lock,
  mode: Mode,
  ctx: Context,
  pending: Map<string, Buffer>,
): Promise<Lock> {
  const next: Lock = {};
  for (const dep of config.external) {
    const key = depKey(dep);
    const existing = before[key];
    // `resolve` keeps approved resolutions; `update` replaces all of them.
    const keep = mode === "resolve" && existing !== undefined && "commit" in existing === isGithubDep(dep);

    if (isGithubDep(dep)) {
      next[key] = keep ? existing : { commit: resolveGithubCommit(dep, ctx) };
    } else if (keep && "digest" in existing) {
      if (!hasVendored(paths.vendor, existing.digest)) {
        const artifact = await fetchSiteArtifact(dep, ctx);
        if (artifact.digest !== existing.digest) {
          fail(`${key}: upstream content changed (${existing.digest} -> ${artifact.digest}) and the approved artifact is not vendored. Run \`bun run skills:update\` and review the change.`);
        }
        pending.set(artifact.digest, artifact.bytes);
      }
      next[key] = existing;
    } else {
      const artifact = await fetchSiteArtifact(dep, ctx);
      pending.set(artifact.digest, artifact.bytes);
      next[key] = { digest: artifact.digest };
    }
    console.log(`  resolved ${key}`);
  }
  return next;
}

/**
 * Resolve or update dependencies.
 * Order: resolve, build the whole candidate, write vendor files, write the lock last.
 * Any failure before the last step leaves the approved lockfile untouched.
 */
export async function updateLock(paths: Paths, ctx: Context, mode: Mode): Promise<string> {
  const config = loadConfig(paths.config);
  const before = loadLock(paths.lock);
  const pending = new Map<string, Buffer>();

  console.log(`Resolving dependencies (${mode}):`);
  const next = await resolveAll(paths, config, before, mode, ctx, pending);
  assertLockMatchesConfig(config, next);

  const readVendor = (digest: string): Buffer => pending.get(digest) ?? readVendored(paths.vendor, digest);
  const registry = await assemble(paths, config, next, ctx, readVendor);
  await stageAndVerify(ctx.tmp.create("skills-candidate-"), registry);

  // Needs the old vendored bytes, so it must run before pruning.
  const summary = await summarize(paths, config, before, next, registry.all(), ctx);

  const referenced = new Set<string>();
  for (const entry of Object.values(next)) {
    if ("digest" in entry) {
      referenced.add(digestHex(entry.digest));
      writeVendored(paths.vendor, entry.digest, readVendor(entry.digest));
    }
  }
  const serialized = serializeLock(next);
  const current = existsSync(paths.lock) ? readFileSync(paths.lock, "utf8") : "";
  if (serialized !== current) writeFileAtomic(paths.lock, serialized);
  pruneVendored(paths.vendor, referenced);

  return summary;
}

/** Files that run code or may run code when an agent follows the skill. */
function isScript(file: Published["files"][number]): boolean {
  return file.executable || /(^|\/)scripts\//.test(file.path) || file.data.subarray(0, 2).toString() === "#!";
}

function describeFileChanges(before: Published | undefined, after: Published | undefined): string[] {
  const hashes = (skill?: Published) => new Map((skill?.files ?? []).map((f) => [f.path, f] as const));
  const old = hashes(before);
  const now = hashes(after);
  const lines: string[] = [];
  for (const [path, file] of now) {
    const prev = old.get(path);
    const changed = !prev ? "added" : sha256(prev.data) !== sha256(file.data) || prev.executable !== file.executable ? "modified" : undefined;
    if (changed) lines.push(`- ${changed} \`${path}\`${isScript(file) ? " **(script or executable)**" : ""}`);
  }
  for (const path of old.keys()) if (!now.has(path)) lines.push(`- removed \`${path}\``);
  return lines;
}

async function previousSkill(dep: Dep, before: Lock, paths: Paths, ctx: Context): Promise<Published | undefined> {
  const entry = before[depKey(dep)];
  try {
    if (isGithubDep(dep) && entry && "commit" in entry) return await buildGithubSkill(dep, entry.commit, ctx);
    if (!isGithubDep(dep) && entry && "digest" in entry) return await publishSiteSkill(dep, readVendored(paths.vendor, entry.digest));
  } catch {
    // The old revision may be gone; the summary then lists the new files only.
  }
  return undefined;
}

function link(dep: Dep | undefined, change: LockChange): string {
  if (dep && isGithubDep(dep) && change.from && change.to) {
    return `[compare](https://github.com/${dep.source}/compare/${change.from}...${change.to})`;
  }
  return "";
}

function shorten(value: string | undefined): string {
  if (!value) return "";
  return `\`${value.startsWith("sha256:") ? value.slice(0, 15) : value.slice(0, 12)}\``;
}

/** Markdown for the pull request: what changed, where to look, and what to check first. */
async function summarize(
  paths: Paths,
  config: Config,
  before: Lock,
  after: Lock,
  skills: Published[],
  ctx: Context,
): Promise<string> {
  const diff = diffLocks(before, after);
  const deps = new Map(config.external.map((dep) => [depKey(dep), dep] as const));
  const nameOf = (key: string) => key.slice(key.lastIndexOf("#") + 1);
  const published = new Map(skills.map((s) => [s.name, s] as const));

  const rows: string[] = [];
  for (const [label, changes] of [["added", diff.added], ["removed", diff.removed], ["updated", diff.updated]] as const) {
    for (const change of changes) {
      rows.push(`| ${label} | \`${change.key}\` | ${shorten(change.from)} | ${shorten(change.to)} | ${link(deps.get(change.key), change)} |`);
    }
  }
  if (rows.length === 0) return `## Skills update\n\nNo changes. The lockfile and vendor store are up to date (${skills.length} skills verified).\n`;

  const details: string[] = [];
  for (const change of [...diff.added, ...diff.updated]) {
    const dep = deps.get(change.key);
    if (!dep) continue;
    const prev = change.from ? await previousSkill(dep, before, paths, ctx) : undefined;
    const lines = describeFileChanges(prev, published.get(dep.as ?? dep.skill));
    if (lines.length > 0) details.push(`<details><summary><code>${change.key}</code> (${nameOf(change.key)})</summary>\n\n${lines.join("\n")}\n\n</details>`);
  }
  for (const change of diff.removed) details.push(`- \`${change.key}\` is no longer configured; its lock entry was dropped.`);

  return [
    "## Skills update",
    "",
    "| Change | Dependency | From | To | Diff |",
    "| --- | --- | --- | --- | --- |",
    ...rows,
    "",
    "### Changed files",
    "",
    ...details,
    "",
    "### Verification",
    "",
    `- Candidate build succeeded: ${skills.length} skills, index and digests verified.`,
    "- Review changed scripts first, and check upstream licenses for new dependencies.",
    "",
  ].join("\n");
}

export function publishSummary(summary: string, file?: string): void {
  console.log(`\n${summary}`);
  if (file) writeFileAtomic(file, summary);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + "\n");
}
