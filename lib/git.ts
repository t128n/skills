import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join, sep } from "node:path";
import { COMMIT_RE } from "#lib/constants.ts";
import { parseFrontmatter } from "#lib/frontmatter.ts";
import { compare, fail, TempDirManager } from "#lib/utils.ts";

export interface GitOptions {
  /** Where `owner/repo` lives. Tests point this at local repositories. */
  repoBase: string;
  /** The only transport git may use. */
  protocol: "https" | "file";
  timeoutMs: number;
}

export const DEFAULT_GIT: GitOptions = {
  repoBase: "https://github.com/",
  protocol: "https",
  timeoutMs: 60_000,
};

const MAX_SKILL_DEPTH = 7;

/**
 * Runs git against untrusted repositories. No prompts, no user or system config,
 * no hooks, one transport, no submodules, no LFS download, bounded time and output.
 */
export class Git {
  private readonly env: NodeJS.ProcessEnv;
  private readonly hardening: string[];
  private readonly scratch: string;
  private readonly checkouts = new Map<string, string>();

  constructor(
    private readonly options: GitOptions,
    private readonly tmp: TempDirManager,
  ) {
    const scratch = (this.scratch = tmp.create("skills-git-"));
    const emptyConfig = join(scratch, "gitconfig");
    const hooksDir = join(scratch, "hooks");
    writeFileSync(emptyConfig, "");
    mkdirSync(hooksDir);
    this.env = {
      ...process.env,
      GIT_TERMINAL_PROMPT: "0",
      GCM_INTERACTIVE: "never",
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_CONFIG_GLOBAL: emptyConfig,
      GIT_LFS_SKIP_SMUDGE: "1",
    };
    this.hardening = [
      "-c", `core.hooksPath=${hooksDir}`,
      "-c", "protocol.allow=never",
      "-c", `protocol.${options.protocol}.allow=always`,
      "-c", "core.fsmonitor=false",
    ];
  }

  repoUrl(source: string): string {
    return `${this.options.repoBase}${source}${this.options.protocol === "file" ? "" : ".git"}`;
  }

  run(args: string[], cwd: string, what: string): string {
    try {
      return execFileSync("git", [...this.hardening, ...args], {
        cwd,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        env: this.env,
        timeout: this.options.timeoutMs,
        maxBuffer: 16 * 1024 * 1024,
      }).trim();
    } catch (err) {
      const e = err as { stderr?: string; code?: string; message: string };
      const reason = e.code === "ETIMEDOUT" ? `timed out after ${this.options.timeoutMs} ms` : (e.stderr ?? e.message).trim();
      return fail(`${what} failed: ${reason}`);
    }
  }

  /** Resolve a branch, tag or commit (default: remote HEAD) to a full commit SHA. */
  resolveCommit(source: string, ref?: string): string {
    if (ref && COMMIT_RE.test(ref)) return ref;
    const wanted = ref ? [`refs/heads/${ref}`, `refs/tags/${ref}^{}`, `refs/tags/${ref}`] : ["HEAD"];
    const out = this.run(["ls-remote", this.repoUrl(source), ...wanted], this.scratch, `git ls-remote ${source}`);
    const refs = new Map<string, string>();
    for (const line of out.split("\n")) {
      const [sha, name] = line.split("\t");
      if (sha && name) refs.set(name, sha);
    }
    for (const name of wanted) {
      const sha = refs.get(name);
      if (sha && COMMIT_RE.test(sha)) return sha;
    }
    return fail(`${source}: ${ref ? `ref ${JSON.stringify(ref)} not found as branch or tag` : "no HEAD found"}`);
  }

  /** Check out exactly one commit (shallow). The result is cached per repository and commit. */
  checkout(source: string, commit: string): string {
    if (!COMMIT_RE.test(commit)) fail(`${source}: ${JSON.stringify(commit)} is not a full commit SHA`);
    const cacheKey = `${source}@${commit}`;
    const cached = this.checkouts.get(cacheKey);
    if (cached) return cached;

    const dir = this.tmp.create();
    const op = (name: string) => `git ${name} ${source}@${commit.slice(0, 7)}`;
    this.run(["init", "-q"], dir, op("init"));
    this.run(["remote", "add", "origin", this.repoUrl(source)], dir, op("remote add"));
    this.run(["fetch", "-q", "--depth", "1", "--no-recurse-submodules", "origin", commit], dir, op("fetch"));
    this.run(["checkout", "-q", "FETCH_HEAD"], dir, op("checkout"));
    const head = this.run(["rev-parse", "HEAD"], dir, op("rev-parse"));
    if (head !== commit) fail(`${source}: fetched ${head} but ${commit} was requested`);

    this.checkouts.set(cacheKey, dir);
    return dir;
  }

  /**
   * Git file modes (e.g. "100755") below `relDir`, keyed by path relative to `relDir`.
   * Rejects symlinks and submodules, which a skill must not contain.
   */
  fileModes(repoDir: string, relDir: string): Map<string, string> {
    const pathspec = relDir === "." ? [] : ["--", relDir];
    const out = this.run(["ls-tree", "-r", "-z", "HEAD", ...pathspec], repoDir, "git ls-tree");
    const modes = new Map<string, string>();
    const prefix = relDir === "." ? "" : `${relDir}/`;
    for (const record of out.split("\0")) {
      if (!record) continue;
      const [meta, path] = record.split("\t");
      const mode = meta.split(" ")[0];
      if (mode === "120000" || mode === "160000") fail(`${path}: symlinks and submodules are not allowed in a skill`);
      modes.set(path.slice(prefix.length), mode);
    }
    return modes;
  }
}

function skillMdFiles(repoDir: string): string[] {
  const found: string[] = [];
  const visit = (rel: string, depth: number): void => {
    for (const entry of readdirSync(join(repoDir, rel), { withFileTypes: true })) {
      if (entry.name === ".git" || entry.name === "node_modules") continue;
      const path = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory() && depth < MAX_SKILL_DEPTH) visit(path, depth + 1);
      else if (entry.isFile() && entry.name === "SKILL.md") found.push(path);
    }
  };
  visit("", 0);
  return found.sort(compare);
}

function nameOf(skillMd: string): string | undefined {
  try {
    return parseFrontmatter(readFileSync(skillMd, "utf8"), skillMd).name;
  } catch {
    return undefined;
  }
}

/** Find the directory of a skill, by explicit path or else by the frontmatter name. Returns it relative to the repository. */
export function findSkillDir(repoDir: string, skill: string, source: string, explicitPath?: string): string {
  if (explicitPath) {
    const full = join(repoDir, explicitPath);
    const skillMd = join(full, "SKILL.md");
    if (!existsSync(skillMd)) fail(`${source}: no SKILL.md at path "${explicitPath}"`);
    const realRepo = realpathSync(repoDir);
    const realDir = realpathSync(full);
    if (realDir !== realRepo && !realDir.startsWith(realRepo + sep)) fail(`${source}: path "${explicitPath}" leaves the repository`);
    if (lstatSync(skillMd).isSymbolicLink()) fail(`${source}: SKILL.md at "${explicitPath}" is a symlink`);
    const name = nameOf(skillMd);
    if (name !== skill) fail(`${source}: SKILL.md at "${explicitPath}" is named ${JSON.stringify(name)}, not "${skill}"`);
    return explicitPath;
  }

  const hits = skillMdFiles(repoDir)
    .filter((path) => nameOf(join(repoDir, path)) === skill)
    .map((path) => dirname(path).replace(/^\.$/, "."));
  if (hits.length === 0) fail(`${source}: skill "${skill}" not found`);
  if (hits.length > 1) fail(`${source}: skill "${skill}" is ambiguous, set "path" to one of: ${hits.join(", ")}`);
  return hits[0];
}
