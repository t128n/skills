import { existsSync, readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020";
import configSchema from "../schemas/skills.config.schema.json" with { type: "json" };
import indexSchema from "../schemas/discovery-index.schema.json" with { type: "json" };
import lockSchema from "../schemas/skills.lock.schema.json" with { type: "json" };
import { compare, fail, safeRelativePath } from "#lib/utils.ts";

export interface GithubDep {
  source: string;
  skill: string;
  ref?: string;
  path?: string;
  as?: string;
}

export interface SiteDep {
  site: string;
  skill: string;
  as?: string;
}

export type Dep = GithubDep | SiteDep;
export type LockEntry = { commit: string } | { digest: string };
export type Lock = Record<string, LockEntry>;

export interface Config {
  $schema?: string;
  external: Dep[];
}

export interface IndexEntry {
  name: string;
  type: "skill-md" | "archive";
  description: string;
  url: string;
  digest: string;
}

export interface SkillIndex {
  $schema: string;
  skills: IndexEntry[];
}

const ajv = new Ajv2020({ strict: true });
const validateConfig = ajv.compile(configSchema);
const validateLock = ajv.compile(lockSchema);
const validateIndex = ajv.compile(indexSchema);

function schemaErrors(validate: { errors?: unknown }): string {
  return ajv.errorsText(validate.errors as never, { dataVar: "", separator: "; " }).trim();
}

export function isGithubDep(dep: Dep): dep is GithubDep {
  return "source" in dep;
}

/** Strip the trailing slash so that one site has one identity. */
export function normalizeSite(site: string): string {
  const url = new URL(site);
  if (url.protocol !== "https:") fail(`site ${JSON.stringify(site)} must use https`);
  if (url.username || url.password || url.search || url.hash) {
    fail(`site ${JSON.stringify(site)} must not contain credentials, a query or a fragment`);
  }
  return url.origin + url.pathname.replace(/\/+$/, "");
}

export function depKey(dep: Dep): string {
  return `${isGithubDep(dep) ? dep.source : normalizeSite(dep.site)}#${dep.skill}`;
}

export function publishedName(dep: Dep): string {
  return dep.as ?? dep.skill;
}

export function parseConfig(raw: unknown, label = "skills.config.json"): Config {
  if (!validateConfig(raw)) fail(`${label}: ${schemaErrors(validateConfig)}`);
  const config = raw as unknown as Config;

  const keys = new Set<string>();
  const names = new Map<string, string>();
  for (const dep of config.external) {
    if (isGithubDep(dep) && dep.path !== undefined) safeRelativePath(dep.path, `${label} "path"`);
    const key = depKey(dep);
    if (keys.has(key)) fail(`${label}: duplicate dependency ${key}`);
    keys.add(key);
    const name = publishedName(dep);
    const other = names.get(name);
    if (other) fail(`${label}: ${key} and ${other} both publish the name "${name}"; use "as" to rename one`);
    names.set(name, key);
  }
  return config;
}

export function parseLock(raw: unknown, label = "skills.lock.json"): Lock {
  if (!validateLock(raw)) fail(`${label}: ${schemaErrors(validateLock)}`);
  const { $schema: _ignored, ...entries } = raw as Record<string, unknown>;
  return entries as Lock;
}

export function parseIndex(raw: unknown, label: string): SkillIndex {
  if (!validateIndex(raw)) fail(`${label}: ${schemaErrors(validateIndex)}`);
  return raw as unknown as SkillIndex;
}

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    return fail(`${path}: cannot read JSON (${(err as Error).message})`);
  }
}

export function loadConfig(path: string): Config {
  return parseConfig(readJson(path), path);
}

/** A missing lockfile is the same as an empty one. */
export function loadLock(path: string): Lock {
  return existsSync(path) ? parseLock(readJson(path), path) : {};
}

export interface LockProblems {
  missing: string[];
  stale: string[];
  wrongType: string[];
}

export function checkLock(config: Config, lock: Lock): LockProblems {
  const problems: LockProblems = { missing: [], stale: [], wrongType: [] };
  const wanted = new Set<string>();
  for (const dep of config.external) {
    const key = depKey(dep);
    wanted.add(key);
    const entry = lock[key];
    if (!entry) problems.missing.push(key);
    else if ("commit" in entry !== isGithubDep(dep)) problems.wrongType.push(key);
  }
  for (const key of Object.keys(lock)) if (!wanted.has(key)) problems.stale.push(key);
  for (const list of Object.values(problems)) list.sort(compare);
  return problems;
}

/** Throw an error that names every problem and the command that fixes it. */
export function assertLockMatchesConfig(config: Config, lock: Lock): void {
  const { missing, stale, wrongType } = checkLock(config, lock);
  const lines = [
    ...missing.map((k) => `  missing: ${k}`),
    ...stale.map((k) => `  stale: ${k}`),
    ...wrongType.map((k) => `  wrong resolution type: ${k}`),
  ];
  if (lines.length > 0) {
    fail(`skills.lock.json does not match skills.config.json:\n${lines.join("\n")}\nRun \`bun run skills:resolve\` and review the lockfile change.`);
  }
}
