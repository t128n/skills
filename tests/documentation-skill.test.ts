import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { readFrontmatter, listFiles } from "../src/lib/frontmatter.ts";
import { SkillRegistry } from "../src/lib/registry.ts";
import { buildLocalSkills } from "../src/lib/sources/local.ts";

describe("documentation skill", () => {
  test("has valid metadata and local resource links", () => {
    const dir = join("skills", "documentation");
    const path = join(dir, "SKILL.md");
    const metadata = readFrontmatter(path);
    const resources = [
      "references/maintenance.md",
      "references/structure.md",
      "references/writing.md",
    ];
    expect(metadata.name).toBe("documentation");
    expect(metadata.description.length).toBeGreaterThan(0);
    expect(metadata.description.length).toBeLessThanOrEqual(1024);
    expect(listFiles(dir)).toEqual(["SKILL.md", ...resources].sort());

    const content = readFileSync(path, "utf8");
    const links = [...content.matchAll(/\]\(((?:references|templates)\/[^)#]+)\)/g)]
      .map((match) => match[1]);
    expect(links.sort()).toEqual(resources.sort());
    for (const link of links) expect(existsSync(resolve(dir, link))).toBe(true);
  });

  test("is discovered as a local archive", async () => {
    const registry = new SkillRegistry({ writeFiles: false });
    await buildLocalSkills("skills", registry);
    expect(registry.getEntry("documentation")?.type).toBe("archive");
    expect(registry.getEntry("documentation")?.url).toBe("documentation.tar.gz");
  });

  test("Lat is absent from the external configuration and lockfile", () => {
    const config = JSON.parse(readFileSync("skills.config.json", "utf8"));
    const lock = JSON.parse(readFileSync("skills.lock.json", "utf8"));
    expect(config.external.some((entry: { source?: string; skill?: string }) =>
      entry.source === "vercel-labs/lat.md" && entry.skill === "lat-md"
    )).toBe(false);
    expect(lock["vercel-labs/lat.md#lat-md"]).toBeUndefined();
  });
});
