import matter from "@11ty/gray-matter";
import { readFileSync } from "node:fs";
import { globSync } from "tinyglobby";
import type { Frontmatter } from "#lib/types.ts";
import { fail } from "#lib/utils.ts";

export function readFrontmatter(skillMdPath: string): Frontmatter {
  const text = readFileSync(skillMdPath, "utf8");
  const parsed = matter(text);
  const data = parsed.data as Record<string, unknown>;

  if (typeof data?.name !== "string" || typeof data?.description !== "string") {
    fail(`${skillMdPath}: frontmatter needs string "name" and "description"`);
  }

  return {
    name: data.name,
    description: data.description.trim(),
  };
}

/**
 * All regular files below `dir` (relative POSIX paths, sorted by code unit).
 * Symlinks and standard ignored directories are skipped.
 */
export function listFiles(dir: string): string[] {
  return globSync("**/*", {
    cwd: dir,
    dot: true,
    onlyFiles: true,
    followSymbolicLinks: false,
    ignore: [".git/**", "node_modules/**", "**/.DS_Store"],
  }).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}
