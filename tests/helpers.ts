import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spyOn } from "bun:test";
import { createContext, type Context } from "#lib/context.ts";
import { pathsFor, type Paths } from "#lib/constants.ts";
import { serializeLock } from "#lib/lock.ts";
import type { Lock } from "#lib/config.ts";

export const REPO_ROOT = join(import.meta.dir, "..");

const cleanups: Array<() => void> = [];

export function cleanupAll(): void {
  while (cleanups.length > 0) cleanups.pop()!();
}

export function tempDir(prefix = "skills-test-"): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  cleanups.push(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

/** Silence the progress output of the library while a test runs. */
export function muteConsole(): () => void {
  const spies = [spyOn(console, "log").mockImplementation(() => {})];
  return () => spies.forEach((spy) => spy.mockRestore());
}

export function skillMd(name: string, description = `The ${name} skill.`, body = "Body.\n"): string {
  return `---\nname: ${name}\ndescription: ${description}\n---\n\n${body}`;
}

export function writeTree(root: string, files: Record<string, string | Buffer>): void {
  for (const [path, data] of Object.entries(files)) {
    const full = join(root, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, data);
  }
}

/** A project directory with config, optional lock, and local skills. */
export function makeProject(options: {
  config?: unknown;
  lock?: Lock;
  skills?: Record<string, string | Buffer>;
}): { root: string; paths: Paths } {
  const root = tempDir("skills-project-");
  const paths = pathsFor(root);
  writeTree(root, { "skills.config.json": JSON.stringify(options.config ?? { external: [] }) });
  if (options.lock) writeTree(root, { "skills.lock.json": serializeLock(options.lock) });
  if (options.skills) writeTree(paths.skillsDir, options.skills);
  return { root, paths };
}

const GIT_ENV = {
  ...process.env,
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_AUTHOR_NAME: "t",
  GIT_AUTHOR_EMAIL: "t@example.test",
  GIT_COMMITTER_NAME: "t",
  GIT_COMMITTER_EMAIL: "t@example.test",
};

export function git(cwd: string, ...args: string[]): string {
  return execFileSync("git", ["-c", "core.autocrlf=false", ...args], { cwd, env: GIT_ENV, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

/** A directory of local git repositories laid out as `<base>/owner/repo`. */
export class GitHost {
  readonly base = tempDir("skills-git-host-");

  /** Commit `files`; paths listed in `executable` get mode 100755. Returns the commit SHA. */
  commit(source: string, files: Record<string, string | Buffer>, options: { executable?: string[]; message?: string } = {}): string {
    const dir = join(this.base, source);
    mkdirSync(dir, { recursive: true });
    try {
      git(dir, "rev-parse", "--git-dir");
    } catch {
      git(dir, "init", "-q", "-b", "main");
    }
    writeTree(dir, files);
    git(dir, "add", "-A");
    for (const path of options.executable ?? []) git(dir, "update-index", "--chmod=+x", path);
    git(dir, "commit", "-q", "--allow-empty", "-m", options.message ?? "commit");
    return git(dir, "rev-parse", "HEAD");
  }

  /** Remove a path from the working tree and commit. */
  remove(source: string, path: string): string {
    const dir = join(this.base, source);
    git(dir, "rm", "-q", "-r", path);
    git(dir, "commit", "-q", "-m", `remove ${path}`);
    return git(dir, "rev-parse", "HEAD");
  }

  context(): Context {
    return createContext({
      git: { repoBase: this.base.replaceAll("\\", "/") + "/", protocol: "file", timeoutMs: 30_000 },
    });
  }
}

type FetchHandler = (url: URL) => Response | undefined | Promise<Response | undefined>;

/** Replace `fetch` with an in-memory site. Unknown URLs answer 404. */
export function stubFetch(routes: Record<string, string | Buffer | ((url: URL) => Response)>): { restore: () => void; requests: string[] } {
  const original = globalThis.fetch;
  const requests: string[] = [];
  const handler: FetchHandler = (url) => {
    const route = routes[url.toString()];
    if (route === undefined) return undefined;
    if (typeof route === "function") return route(url);
    return new Response(route, { status: 200 });
  };
  globalThis.fetch = (async (input: Request | string | URL) => {
    const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
    requests.push(url.toString());
    return (await handler(url)) ?? new Response("not found", { status: 404 });
  }) as typeof fetch;
  return { restore: () => void (globalThis.fetch = original), requests };
}

export const FAST_HTTP = { attempts: 2, backoffMs: 1, timeoutMs: 5_000 };
