import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  assertLockMatchesConfig,
  depKey,
  isGithubDep,
  loadConfig,
  loadLock,
  type Config,
  type Lock,
} from "#lib/config.ts";
import { PUBLIC_URL, SITE_PREFIX, WELL_KNOWN, type Paths } from "#lib/constants.ts";
import type { Context } from "#lib/context.ts";
import { publishDir, readVendored, recoverDist, stagingDirFor, withDistLock } from "#lib/filesystem.ts";
import { SkillRegistry } from "#lib/registry.ts";
import { buildGithubSkill } from "#lib/sources/github.ts";
import { buildLocalSkills } from "#lib/sources/local.ts";
import { publishSiteSkill } from "#lib/sources/site.ts";
import { fail } from "#lib/utils.ts";
import { verifyDist } from "#lib/verify.ts";

/** Reads the approved bytes of a website artifact. */
export type VendorReader = (digest: string) => Buffer;

/**
 * Produce every skill in memory from local files, locked commits and approved artifacts.
 * The lock must already match the config. Nothing is written here.
 */
export async function assemble(
  paths: Paths,
  config: Config,
  lock: Lock,
  ctx: Context,
  readVendor: VendorReader,
): Promise<SkillRegistry> {
  const registry = new SkillRegistry();

  console.log("Own skills:");
  for (const skill of await buildLocalSkills(paths.skillsDir)) registry.add(skill, "hosted here");

  console.log("External skills:");
  for (const dep of config.external) {
    const entry = lock[depKey(dep)];
    if (isGithubDep(dep) && "commit" in entry) {
      registry.add(await buildGithubSkill(dep, entry.commit, ctx), `GitHub @ ${entry.commit.slice(0, 7)}`);
    } else if (!isGithubDep(dep) && "digest" in entry) {
      registry.add(await publishSiteSkill(dep, readVendor(entry.digest)), `vendored ${entry.digest.slice(7, 15)}`);
    } else {
      fail(`${depKey(dep)}: lock entry has the wrong resolution type`);
    }
  }
  return registry;
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function renderLandingPage(registry: SkillRegistry): string {
  const template = readFileSync(new URL("./index.html", import.meta.url), "utf8");
  const items = registry
    .all()
    .map((skill) => `<li><code>${escapeHtml(skill.name)}</code> &ndash; ${escapeHtml(skill.description)}</li>`)
    .join("\n                ");
  return template
    .replaceAll("{{PUBLIC_URL}}", PUBLIC_URL)
    .replaceAll("{{INDEX_URL}}", `${WELL_KNOWN}/index.json`)
    .replace("{{SKILLS}}", items);
}

/** Lay out the complete site below `root`: `.nojekyll`, landing page, index and artifacts. */
export function writeSite(root: string, registry: SkillRegistry): void {
  const siteDir = join(root, SITE_PREFIX);
  mkdirSync(siteDir, { recursive: true });
  writeFileSync(join(root, ".nojekyll"), "");
  writeFileSync(join(siteDir, "index.html"), renderLandingPage(registry));
  registry.write(join(siteDir, WELL_KNOWN));
}

/** Write the site into a scratch directory and check it like a deployment would be checked. */
export async function stageAndVerify(root: string, registry: SkillRegistry): Promise<void> {
  writeSite(root, registry);
  const problems = await verifyDist(root);
  if (problems.length > 0) fail(`generated site is invalid:\n${problems.map((p) => `  ${p}`).join("\n")}`);
}

/**
 * Normal build: locked inputs only. The lockfile is never written, and the
 * previous `dist/` stays in place until the new one is complete and verified.
 */
export async function build(paths: Paths, ctx: Context): Promise<void> {
  const config = loadConfig(paths.config);
  const lock = loadLock(paths.lock);
  assertLockMatchesConfig(config, lock);

  await withDistLock(paths.dist, async () => {
    recoverDist(paths.dist);
    const staging = stagingDirFor(paths.dist);
    rmSync(staging, { recursive: true, force: true });
    try {
      const registry = await assemble(paths, config, lock, ctx, (digest) => readVendored(paths.vendor, digest));
      await stageAndVerify(staging, registry);
      publishDir(staging, paths.dist);
      console.log(`\nBuilt ${registry.all().length} skills into ${paths.dist}`);
    } finally {
      rmSync(staging, { recursive: true, force: true });
    }
  });
}
