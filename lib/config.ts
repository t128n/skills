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

/** Every skill in a repository. The lockfile lists the skills it resolved to. */
export interface RepoDep {
  source: string;
  ref?: string;
  exclude?: string[];
}

export type ConcreteDep = GithubDep | SiteDep;
export type Dep = ConcreteDep | RepoDep;
export type LockEntry = { commit: string } | { digest: string };
export type Lock = Record<string, LockEntry>;

export interface Config {
  $schema?: string;
  external: Dep[];
}

/** The config with every repository entry replaced by the skills the lockfile resolved for it. */
export interface ExpandedConfig {
  external: ConcreteDep[];
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

export function isRepoDep(dep: Dep): dep is RepoDep {
  return "source" in dep && !("skill" in dep);
}

export function isGithubDep(dep: Dep): dep is GithubDep {
  return "source" in dep && "skill" in dep;
}

/** Does a repository entry cover this lockfile key? */
export function coveredBy(repo: RepoDep, key: string): boolean {
  const prefix = `${repo.source}#`;
  return key.startsWith(prefix) && !(repo.exclude ?? []).includes(key.slice(prefix.length));
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
  if (isRepoDep(dep)) return `${dep.source}#*`;
  return `${isGithubDep(dep) ? dep.source : normalizeSite(dep.site)}#${dep.skill}`;
}

export function publishedName(dep: ConcreteDep): string {
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
    if (isRepoDep(dep)) continue; // its skill names are known only after resolving
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
  const repos = config.external.filter(isRepoDep);
  for (const dep of config.external) {
    const key = depKey(dep);
    if (isRepoDep(dep)) {
      const covered = Object.keys(lock).filter((k) => coveredBy(dep, k));
      if (covered.length === 0) problems.missing.push(key);
      for (const k of covered) if (!("commit" in lock[k])) problems.wrongType.push(k);
      continue;
    }
    wanted.add(key);
    const entry = lock[key];
    if (!entry) problems.missing.push(key);
    else if ("commit" in entry !== isGithubDep(dep)) problems.wrongType.push(key);
  }
  for (const key of Object.keys(lock)) {
    if (!wanted.has(key) && !repos.some((repo) => coveredBy(repo, key))) problems.stale.push(key);
  }
  for (const list of Object.values(problems)) list.sort(compare);
  return problems;
}

/** Replace each repository entry by one dependency per skill the lockfile resolved for it. */
export function expandConfig(config: Config, lock: Lock): ExpandedConfig {
  const explicit = new Set(config.external.filter((dep) => !isRepoDep(dep)).map(depKey));
  const external: ConcreteDep[] = [];
  for (const dep of config.external) {
    if (!isRepoDep(dep)) {
      external.push(dep);
      continue;
    }
    for (const key of Object.keys(lock).sort(compare)) {
      if (!coveredBy(dep, key) || explicit.has(key)) continue;
      external.push({ source: dep.source, skill: key.slice(dep.source.length + 1), ...(dep.ref ? { ref: dep.ref } : {}) });
    }
  }
  const names = new Map<string, string>();
  for (const dep of external) {
    const name = publishedName(dep);
    const other = names.get(name);
    if (other) fail(`${depKey(dep)} and ${other} both publish the name "${name}"; use "exclude" or "as" to resolve it`);
    names.set(name, depKey(dep));
  }
  return { external };
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
