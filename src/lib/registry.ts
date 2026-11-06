import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import * as v from "valibot";
import { OUT_DIR, SCHEMA } from "#lib/constants.ts";
import { listFiles, readFrontmatter } from "#lib/frontmatter.ts";
import { packTarGz } from "#lib/tar.ts";
import {
  SkillIndexEntrySchema,
  type SkillIndex,
  type SkillIndexEntry,
} from "#lib/types.ts";
import { fail, sha256 } from "#lib/utils.ts";

export function descriptionWithSource(description: string, sourceUrl: string): string {
  const suffix = ` [source: ${sourceUrl}]`;
  const available = 1024 - suffix.length;
  if (available < 1) fail("source URL is too long for a skill description");
  if (description.length <= available) return description + suffix;
  // Leave room for the ellipsis without splitting a surrogate pair.
  let prefix = description.slice(0, available - 1);
  if (/[\uD800-\uDBFF]$/.test(prefix)) prefix = prefix.slice(0, -1);
  return prefix.trimEnd() + "…" + suffix;
}

export class SkillRegistry {
  private readonly entries = new Map<string, SkillIndexEntry>();
  private readonly outDir: string;
  private readonly writeFiles: boolean;

  constructor(options: { outDir?: string; writeFiles?: boolean } = {}) {
    this.outDir = options.outDir ?? OUT_DIR;
    this.writeFiles = options.writeFiles ?? true;
  }

  addEntry(entry: SkillIndexEntry, how = "hosted here"): void {
    try {
      v.parse(SkillIndexEntrySchema, entry);
    } catch (err) {
      if (v.isValiError(err)) {
        fail(`Invalid skill entry "${entry.name}": ${err.message}`);
      }
      throw err;
    }
    if (this.entries.has(entry.name)) {
      fail(`duplicate skill name "${entry.name}"`);
    }
    this.entries.set(entry.name, entry);
    console.log(`  ✓ ${entry.name} (${entry.type}, ${how})`);
  }

  getEntry(name: string): SkillIndexEntry | undefined {
    return this.entries.get(name);
  }

  writeArtifact(relPath: string, bytes: Buffer | string): void {
    if (!this.writeFiles) return;
    const fullPath = join(this.outDir, relPath);
    mkdirSync(dirname(fullPath), { recursive: true });
    writeFileSync(fullPath, bytes);
  }

  /**
   * Publish a skill directory into the output index:
   * - Single-file (`SKILL.md` only) -> type `"skill-md"`
   * - Multi-file -> type `"archive"` (`.tar.gz` at root)
   */
  async emitDir(
    dir: string,
    options: { as?: string; how?: string; sourceUrl?: string } = {},
  ): Promise<SkillIndexEntry> {
    const fm = readFrontmatter(join(dir, "SKILL.md"));
    const name = options.as ?? fm.name;
    const description = options.sourceUrl
      ? descriptionWithSource(fm.description, options.sourceUrl)
      : fm.description;
    const files = listFiles(dir);
    if (!files.includes("SKILL.md")) {
      fail(`${dir}: no SKILL.md at the skill root`);
    }

    if (files.length === 1) {
      const bytes = readFileSync(join(dir, "SKILL.md"));
      this.writeArtifact(`${name}/SKILL.md`, bytes);
      const entry: SkillIndexEntry = {
        name,
        type: "skill-md",
        description,
        url: `${name}/SKILL.md`,
        digest: sha256(bytes),
      };
      this.addEntry(entry, options.how ?? "hosted here");
      return entry;
    }

    const bytes = await packTarGz(dir, files);
    this.writeArtifact(`${name}.tar.gz`, bytes);
    const entry: SkillIndexEntry = {
      name,
      type: "archive",
      description,
      url: `${name}.tar.gz`,
      digest: sha256(bytes),
    };
    this.addEntry(entry, options.how ?? "archived here");
    return entry;
  }

  toIndex(): SkillIndex {
    const skills = [...this.entries.values()].sort((a, b) =>
      a.name < b.name ? -1 : 1,
    );
    return {
      $schema: SCHEMA,
      skills,
    };
  }
}
