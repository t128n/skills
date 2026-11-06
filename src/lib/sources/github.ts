import { readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { listFiles, readFrontmatter } from "#lib/frontmatter.ts";
import { checkout, findSkillDir } from "#lib/git.ts";
import type { SkillRegistry } from "#lib/registry.ts";
import type { GithubSkillConfig, SkillsLock } from "#lib/types.ts";
import { posix, sha256 } from "#lib/utils.ts";

export interface BuildGithubOptions {
  registry: SkillRegistry;
  currentLock: SkillsLock;
  nextLock: SkillsLock;
  update: boolean;
  createTmpDir: () => string;
}

export function githubSourceUrl(repo: string, commit: string, relativeDir: string): string {
  const path = relativeDir === "." ? "" : `/${relativeDir.split("/").map(encodeURIComponent).join("/")}`;
  return `https://github.com/${repo}/tree/${commit}${path}`;
}

export async function buildGithubSkill(
  item: GithubSkillConfig,
  options: BuildGithubOptions,
): Promise<void> {
  const { registry, currentLock, nextLock, update, createTmpDir } = options;
  const repoUrl = item.source.startsWith("http")
    ? item.source
    : `https://github.com/${item.source}.git`;
  const key = `${item.source}#${item.skill}`;
  const pinned = update ? undefined : currentLock[key]?.commit;

  const { dir: repoDir, commit } = checkout(
    repoUrl,
    createTmpDir,
    item.ref,
    pinned,
  );
  const skillDir = findSkillDir(repoDir, item.skill, item.path);
  nextLock[key] = { commit };

  const files = listFiles(skillDir);
  const ghMatch = repoUrl.match(
    /^https:\/\/github\.com\/([^/]+\/[^/]+?)(?:\.git)?$/,
  );

  // Single-file skills on github.com are linked directly by default.
  // Multi-file skills must be packaged as root-layout .tar.gz archives because
  // v0.2.0 has no "git repo" type and GitHub's own tarballs nest files under a wrapper folder.
  if (files.length === 1 && ghMatch) {
    const skillMdPath = join(skillDir, "SKILL.md");
    const bytes = readFileSync(skillMdPath);
    const fm = readFrontmatter(skillMdPath);
    const rel = posix(relative(repoDir, skillMdPath));
    registry.addEntry(
      {
        name: item.as ?? fm.name,
        type: "skill-md",
        description: fm.description,
        url: `https://raw.githubusercontent.com/${ghMatch[1]}/${commit}/${rel}`,
        digest: sha256(bytes),
      },
      `linked to GitHub @ ${commit.slice(0, 7)}`,
    );
  } else {
    const rel = posix(relative(repoDir, skillDir));
    const sourceUrl = ghMatch
      ? githubSourceUrl(ghMatch[1], commit, rel)
      : repoUrl.replace(/\.git$/, "");
    await registry.emitDir(skillDir, {
      as: item.as,
      how: `multi-file skill archived from GitHub @ ${commit.slice(0, 7)}`,
      sourceUrl,
    });
  }
}
