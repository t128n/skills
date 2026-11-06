import { execFileSync } from "node:child_process";
import { dirname, join, relative } from "node:path";
import { globSync } from "tinyglobby";
import { readFrontmatter } from "#lib/frontmatter.ts";
import { fail } from "#lib/utils.ts";

export function git(args: string[], cwd: string): string {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: "0",
      GIT_LFS_SKIP_SMUDGE: "1",
    },
  }).trim();
}

export function checkout(
  repoUrl: string,
  createTmpDir: () => string,
  ref?: string,
  commit?: string,
): { dir: string; commit: string } {
  const dir = createTmpDir();
  if (commit) {
    git(["init", "-q"], dir);
    git(["remote", "add", "origin", repoUrl], dir);
    git(["fetch", "-q", "--depth", "1", "origin", commit], dir);
    git(["checkout", "-q", "FETCH_HEAD"], dir);
  } else {
    git(
      [
        "clone",
        "-q",
        "--depth",
        "1",
        ...(ref ? ["--branch", ref] : []),
        repoUrl,
        dir,
      ],
      dir,
    );
  }
  return { dir, commit: git(["rev-parse", "HEAD"], dir) };
}

/**
 * Find the directory holding the wanted skill (by explicit path, else by frontmatter name).
 */
export function findSkillDir(
  repoDir: string,
  skill: string,
  explicitPath?: string,
): string {
  if (explicitPath) return join(repoDir, explicitPath);

  const matches = globSync("**/SKILL.md", {
    cwd: repoDir,
    deep: 7,
    dot: true,
    ignore: [".git/**", "node_modules/**"],
  });

  const hits: string[] = [];
  for (const match of matches) {
    const fullSkillMd = join(repoDir, match);
    try {
      if (readFrontmatter(fullSkillMd).name === skill) {
        hits.push(dirname(fullSkillMd));
      }
    } catch {
      // skip invalid SKILL.md files
    }
  }

  if (hits.length === 0) fail(`skill "${skill}" not found in repo`);
  if (hits.length > 1) {
    fail(
      `skill "${skill}" is ambiguous, set "path": ${hits.map((h) => relative(repoDir, h)).join(", ")}`,
    );
  }
  return hits[0];
}
