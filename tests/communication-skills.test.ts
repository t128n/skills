import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { readFrontmatter, listFiles } from "../src/lib/frontmatter.ts";
import { SkillRegistry } from "../src/lib/registry.ts";
import { buildLocalSkills } from "../src/lib/sources/local.ts";

const skills = {
  "meeting-notes": [
    "references/meeting-minutes.md",
    "references/decisions.md",
    "references/action-items.md",
    "templates/meeting-notes.md",
  ],
  briefing: [
    "references/meeting-prep.md",
    "references/executive-summary.md",
    "references/decision-memo.md",
    "references/status-update.md",
    "references/handoff.md",
    "templates/briefing.md",
  ],
};

describe("communication skills", () => {
  for (const [name, resources] of Object.entries(skills)) {
    test(`${name} has valid metadata and local resource links`, () => {
      const dir = join("skills", name);
      const path = join(dir, "SKILL.md");
      const metadata = readFrontmatter(path);
      expect(metadata.name).toBe(name);
      expect(metadata.name).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(metadata.name.length).toBeLessThanOrEqual(64);
      expect(metadata.description.length).toBeGreaterThan(0);
      expect(metadata.description.length).toBeLessThanOrEqual(1024);
      expect(listFiles(dir)).toEqual(["SKILL.md", ...resources].sort());

      const content = readFileSync(path, "utf8");
      const links = [...content.matchAll(/\]\(((?:references|templates)\/[^)#]+)\)/g)]
        .map((match) => match[1]);
      expect(links.sort()).toEqual([...resources].sort());
      for (const link of links) expect(existsSync(resolve(dir, link))).toBe(true);
    });
  }

  test("local discovery includes both skills as independent archives", async () => {
    const registry = new SkillRegistry({ writeFiles: false });
    await buildLocalSkills("skills", registry);
    for (const name of Object.keys(skills)) {
      expect(registry.getEntry(name)?.type).toBe("archive");
      expect(registry.getEntry(name)?.url).toBe(`${name}.tar.gz`);
    }
  });
});
