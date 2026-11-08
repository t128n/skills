import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  type SkillFile,
  isGzip,
  packTarGz,
  readTarGz,
} from "#lib/archive.ts";
import { parseIndex, type IndexEntry, type SkillIndex } from "#lib/config.ts";
import { DISCOVERY_SCHEMA, NAME_RE } from "#lib/constants.ts";
import { parseFrontmatter } from "#lib/frontmatter.ts";
import { compare, fail, sha256 } from "#lib/utils.ts";

/** A skill ready to publish: the exact artifact bytes plus what the index says about it. */
export interface Published {
  name: string;
  type: "skill-md" | "archive";
  description: string;
  bytes: Buffer;
  /** The files inside the artifact. Used for update summaries. */
  files: SkillFile[];
}

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

export interface PackOptions {
  /** Published name (the `as` rename, else the upstream skill name). */
  name: string;
  /** Upstream location. Added to the index description of archives only, never to the skill itself. */
  sourceUrl?: string;
  /** Name in the SKILL.md frontmatter. Defaults to `name`. */
  skill?: string;
}

function requireSkillMd(files: SkillFile[], label: string): SkillFile {
  const skillMd = files.find((file) => file.path === "SKILL.md");
  if (!skillMd) fail(`${label}: no SKILL.md at the skill root`);
  return skillMd;
}

function checkName(label: string, frontmatterName: string, name: string): void {
  if (!NAME_RE.test(name) || name.length > 64) fail(`${label}: invalid skill name ${JSON.stringify(name)}`);
  if (frontmatterName !== name) {
    fail(`${label}: frontmatter name ${JSON.stringify(frontmatterName)} differs from ${JSON.stringify(name)}`);
  }
}

/**
 * Turn a set of files into the artifact we publish:
 * only SKILL.md -> `skill-md`, otherwise a deterministic `.tar.gz`.
 */
export async function packSkill(files: SkillFile[], options: PackOptions, label: string): Promise<Published> {
  const skillMd = requireSkillMd(files, label);
  const fm = parseFrontmatter(skillMd.data.toString("utf8"), `${label}/SKILL.md`);
  checkName(label, fm.name, options.skill ?? options.name);

  if (files.length === 1) {
    return { name: options.name, type: "skill-md", description: fm.description, bytes: skillMd.data, files };
  }
  const description = options.sourceUrl ? descriptionWithSource(fm.description, options.sourceUrl) : fm.description;
  return { name: options.name, type: "archive", description, bytes: await packTarGz(files), files };
}

/** Inspect approved artifact bytes (a vendored file) and turn them into a Published skill. */
export async function publishBytes(bytes: Buffer, options: PackOptions, label: string): Promise<Published> {
  if (!isGzip(bytes)) {
    const fm = parseFrontmatter(bytes.toString("utf8"), label);
    checkName(label, fm.name, options.skill ?? options.name);
    return {
      name: options.name,
      type: "skill-md",
      description: fm.description,
      bytes,
      files: [{ path: "SKILL.md", data: bytes, executable: false }],
    };
  }
  const files = await readTarGz(bytes, label);
  const fm = parseFrontmatter(requireSkillMd(files, label).data.toString("utf8"), `${label}/SKILL.md`);
  checkName(label, fm.name, options.skill ?? options.name);
  const description = options.sourceUrl ? descriptionWithSource(fm.description, options.sourceUrl) : fm.description;
  return { name: options.name, type: "archive", description, bytes, files };
}

export function artifactPath(skill: Pick<Published, "name" | "type">): string {
  return skill.type === "skill-md" ? `${skill.name}/SKILL.md` : `${skill.name}.tar.gz`;
}

export class SkillRegistry {
  private readonly skills = new Map<string, Published>();

  add(skill: Published, how: string): void {
    if (this.skills.has(skill.name)) fail(`duplicate skill name "${skill.name}" (${how})`);
    this.skills.set(skill.name, skill);
    console.log(`  ✓ ${skill.name} (${skill.type}, ${how})`);
  }

  get(name: string): Published | undefined {
    return this.skills.get(name);
  }

  all(): Published[] {
    return [...this.skills.values()].sort((a, b) => compare(a.name, b.name));
  }

  toIndex(): SkillIndex {
    const skills: IndexEntry[] = this.all().map((skill) => ({
      name: skill.name,
      type: skill.type,
      description: skill.description,
      url: artifactPath(skill),
      digest: sha256(skill.bytes),
    }));
    const index: SkillIndex = { $schema: DISCOVERY_SCHEMA, skills };
    return parseIndex(index, "generated index");
  }

  /** Write artifacts and `index.json` below `outDir`. */
  write(outDir: string): void {
    const put = (path: string, data: string | Uint8Array): void => {
      const full = join(outDir, path);
      mkdirSync(dirname(full), { recursive: true });
      writeFileSync(full, data);
    };
    for (const skill of this.all()) put(artifactPath(skill), skill.bytes);
    put("index.json", JSON.stringify(this.toIndex(), null, 2) + "\n");
  }
}
