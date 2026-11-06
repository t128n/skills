import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { SCHEMA } from "#lib/constants.ts";
import { readFrontmatter } from "#lib/frontmatter.ts";
import type { SkillRegistry } from "#lib/registry.ts";
import type {
  SiteSkillConfig,
  SkillsLock,
  UpstreamSiteIndex,
} from "#lib/types.ts";
import { assertContainedPath, fail, sha256 } from "#lib/utils.ts";

export interface BuildSiteOptions {
  registry: SkillRegistry;
  currentLock: SkillsLock;
  nextLock: SkillsLock;
  update: boolean;
  createTmpDir: () => string;
}

async function fetchBytes(url: string): Promise<Buffer> {
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) fail(`GET ${url} -> ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

export async function buildSiteSkill(
  item: SiteSkillConfig,
  options: BuildSiteOptions,
): Promise<void> {
  const { registry, currentLock, nextLock, update, createTmpDir } = options;
  const base = item.site.replace(/\/$/, "");

  let index: UpstreamSiteIndex | undefined;
  let dirUrl = "";

  for (const prefix of [".well-known/agent-skills", ".well-known/skills"]) {
    try {
      const raw = await fetchBytes(`${base}/${prefix}/index.json`);
      index = JSON.parse(raw.toString("utf8")) as UpstreamSiteIndex;
      dirUrl = `${base}/${prefix}`;
      break;
    } catch {
      // try next well-known path
    }
  }

  if (!index) fail(`no skills index found at ${base}`);
  const entry = index.skills?.find((s) => s.name === item.skill);
  if (!entry) fail(`skill "${item.skill}" not listed at ${base}`);
  const key = `${item.site}#${item.skill}`;

  let digest: string;

  if (index.$schema === SCHEMA) {
    // v0.2.0 upstream site: verify the digest, then link directly to the upstream artifact URL.
    const artifactUrl = new URL(entry.url, `${dirUrl}/index.json`).toString();
    const bytes = await fetchBytes(artifactUrl);
    if (sha256(bytes) !== entry.digest) {
      fail(`${key}: upstream digest mismatch`);
    }
    const name = item.as ?? entry.name;
    registry.addEntry(
      {
        name,
        type: entry.type,
        description: entry.description,
        url: artifactUrl,
        digest: entry.digest,
      },
      `linked to ${new URL(artifactUrl).host}`,
    );
    digest = entry.digest;
  } else if (index.$schema === undefined) {
    // Legacy v0.1.0 index has no digests.
    // Single-file SKILL.md skills are linked directly with a computed digest;
    // multi-file skills are packaged into a .tar.gz archive in dist/.
    const singleFile =
      entry.files.length === 1 && entry.files[0].toLowerCase() === "skill.md";

    if (singleFile) {
      const url = `${dirUrl}/${entry.name}/${entry.files[0]}`;
      const bytes = await fetchBytes(url);
      const dir = createTmpDir();
      const skillMdPath = join(dir, "SKILL.md");
      writeFileSync(skillMdPath, bytes);
      const fm = readFrontmatter(skillMdPath);
      digest = sha256(bytes);

      registry.addEntry(
        {
          name: item.as ?? entry.name,
          type: "skill-md",
          description: fm.description,
          url,
          digest,
        },
        `linked to ${new URL(url).host}`,
      );
    } else {
      const dir = createTmpDir();
      for (const file of entry.files) {
        const target = assertContainedPath(dir, file);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, await fetchBytes(`${dirUrl}/${entry.name}/${file}`));
      }
      const emitted = await registry.emitDir(dir, {
        as: item.as ?? entry.name,
        how: `multi-file skill archived from ${new URL(base).host}`,
        sourceUrl: `${dirUrl}/${encodeURIComponent(entry.name)}/${encodeURIComponent(entry.files.find((file) => file.toLowerCase() === "skill.md") ?? "SKILL.md")}`,
      });
      digest = emitted.digest;
    }
  } else {
    fail(`${key}: unknown $schema ${index.$schema}`);
  }

  // Sites cannot be pinned by commit, so pin by content digest instead.
  const locked = currentLock[key]?.digest;
  if (!update && locked && locked !== digest) {
    fail(
      `${key}: upstream content changed (${locked} -> ${digest}). Review it, then run with --update.`,
    );
  }
  nextLock[key] = { digest };
}
