import { join } from "node:path";
import { readSkillFiles } from "#lib/archive.ts";
import { publishedName, type GithubDep } from "#lib/config.ts";
import type { Context } from "#lib/context.ts";
import { findSkillDir } from "#lib/git.ts";
import { type Published, packSkill } from "#lib/registry.ts";

export function githubSourceUrl(repo: string, commit: string, relativeDir: string): string {
  const path = relativeDir === "." ? "" : `/${relativeDir.split("/").map(encodeURIComponent).join("/")}`;
  return `https://github.com/${repo}/tree/${commit}${path}`;
}

/** Update only: the commit a branch, tag or the default branch points to now. */
export function resolveGithubCommit(dep: GithubDep, ctx: Context): string {
  return ctx.git.resolveCommit(dep.source, dep.ref);
}

/** Package a skill from one exact commit. */
export async function buildGithubSkill(dep: GithubDep, commit: string, ctx: Context): Promise<Published> {
  const repoDir = ctx.git.checkout(dep.source, commit);
  const relDir = findSkillDir(repoDir, dep.skill, dep.source, dep.path);
  const modes = ctx.git.fileModes(repoDir, relDir);
  // Windows checkouts lose executable bits, so take them from git.
  const files = readSkillFiles(relDir === "." ? repoDir : join(repoDir, relDir)).map((file) => ({
    ...file,
    executable: modes.get(file.path) === "100755",
  }));
  return packSkill(
    files,
    { name: publishedName(dep), skill: dep.skill, sourceUrl: githubSourceUrl(dep.source, commit, relDir) },
    `${dep.source}#${dep.skill}`,
  );
}
