#!/usr/bin/env bun
// Builds dist/.well-known/agent-skills/index.json (Agent Skills Discovery v0.2.0).
//
// Sources:
//   skills/<name>/            your own skills
//   external[].source         GitHub repo   ("owner/repo", pinned to a commit in skills.lock.json)
//   external[].site           website index (legacy /.well-known/skills or v0.2.0 /.well-known/agent-skills)
//
// Linking & Archiving rules:
//   - Single-file external skills (and v0.2.0 site entries) are linked directly to their upstream URL.
//   - Multi-file external skills are packaged into byte-for-byte deterministic .tar.gz archives in dist/.
//   - Local skills in skills/<name>/ are emitted to dist/ as skill-md (single file) or .tar.gz (multi-file).
//
// Usage:
//   bun src/index.ts [--update] [--lock-only]

import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { parseArgs } from "node:util";
import * as v from "valibot";
import {
  CONFIG_PATH,
  DIST_DIR,
  INDEX_HTML_PATH,
  LOCK_PATH,
  OUT_DIR,
  OWN_SKILLS_DIR,
  ROOT,
} from "#lib/constants.ts";
import { SkillRegistry } from "#lib/registry.ts";
import { buildGithubSkill } from "#lib/sources/github.ts";
import { buildLocalSkills } from "#lib/sources/local.ts";
import { buildSiteSkill } from "#lib/sources/site.ts";
import {
  SkillsConfigSchema,
  SkillsLockSchema,
  type ExternalSkillConfig,
  type GithubSkillConfig,
  type SiteSkillConfig,
  type SkillsConfig,
  type SkillsLock,
} from "#lib/types.ts";
import { fail, TempDirManager } from "#lib/utils.ts";

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    update: {
      type: "boolean",
      short: "u",
      default: false,
    },
    "lock-only": {
      type: "boolean",
      default: false,
    },
    help: {
      type: "boolean",
      short: "h",
      default: false,
    },
  },
  strict: true,
  allowPositionals: false,
});

if (values.help) {
  console.log(`Usage: bun src/index.ts [options]

Options:
  -u, --update     Update upstream skills and lockfile entries
      --lock-only  Only update skills.lock.json without generating dist/
  -h, --help       Show this help message
`);
  process.exit(0);
}

const UPDATE = values.update;
const LOCK_ONLY = values["lock-only"];

function isGithubSkill(item: ExternalSkillConfig): item is GithubSkillConfig {
  return "source" in item && typeof item.source === "string";
}

function isSiteSkill(item: ExternalSkillConfig): item is SiteSkillConfig {
  return "site" in item && typeof item.site === "string";
}

function loadConfig(): SkillsConfig {
  try {
    const raw = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
    return v.parse(SkillsConfigSchema, raw);
  } catch (err) {
    if (v.isValiError(err)) {
      fail(`Invalid config in ${CONFIG_PATH}: ${err.message}`);
    }
    throw err;
  }
}

function loadLock(): SkillsLock {
  if (!existsSync(LOCK_PATH)) return {};
  try {
    const raw = JSON.parse(readFileSync(LOCK_PATH, "utf8"));
    return v.parse(SkillsLockSchema, raw);
  } catch (err) {
    if (v.isValiError(err)) {
      fail(`Invalid lockfile in ${LOCK_PATH}: ${err.message}`);
    }
    throw err;
  }
}

async function main(): Promise<void> {
  const config = loadConfig();
  const currentLock = loadLock();
  const nextLock: SkillsLock = {};

  const registry = new SkillRegistry({
    outDir: OUT_DIR,
    writeFiles: !LOCK_ONLY,
  });
  using tmpManager = new TempDirManager();

  if (!LOCK_ONLY) {
    rmSync(DIST_DIR, { recursive: true, force: true });
    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(join(DIST_DIR, ".nojekyll"), "");
  }

  try {
    console.log("Own skills:");
    await buildLocalSkills(OWN_SKILLS_DIR, registry);

    console.log("External skills:");
    for (const item of config.external ?? []) {
      const createTmpDir = () => tmpManager.create();
      if (isGithubSkill(item)) {
        await buildGithubSkill(item, {
          registry,
          currentLock,
          nextLock,
          update: UPDATE,
          createTmpDir,
        });
      } else if (isSiteSkill(item)) {
        await buildSiteSkill(item, {
          registry,
          currentLock,
          nextLock,
          update: UPDATE,
          createTmpDir,
        });
      } else {
        fail(`external entry needs "source" or "site": ${JSON.stringify(item)}`);
      }
    }

    const index = registry.toIndex();
    if (!LOCK_ONLY) {
      writeFileSync(
        join(OUT_DIR, "index.json"),
        JSON.stringify(index, null, 2) + "\n",
      );
      console.log(
        `\nWrote ${index.skills.length} skills to ${relative(ROOT, OUT_DIR)}/index.json`,
      );

      if (existsSync(INDEX_HTML_PATH)) {
        copyFileSync(INDEX_HTML_PATH, join(DIST_DIR, "index.html"));
        console.log(
          `Copied landing page to ${relative(ROOT, DIST_DIR)}/index.html`,
        );
      }
    }

    writeFileSync(LOCK_PATH, JSON.stringify(nextLock, null, 2) + "\n");
    console.log(
      `Updated ${relative(ROOT, LOCK_PATH)} (${Object.keys(nextLock).length} entries)`,
    );
  } finally {
    tmpManager.cleanup();
  }
}

await main();
