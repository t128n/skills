import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { readSkillFiles } from "#lib/archive.ts";
import { parseFrontmatter } from "#lib/frontmatter.ts";
import { buildLocalSkills } from "#lib/sources/local.ts";
import { REPO_ROOT } from "./helpers.ts";

const skills = {
  communicate: [],
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
      const dir = join(REPO_ROOT, "skills", name);
      const path = join(dir, "SKILL.md");
      const metadata = parseFrontmatter(readFileSync(path, "utf8"), path);
      expect(metadata.name).toBe(name);
      expect(metadata.name).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(metadata.name.length).toBeLessThanOrEqual(64);
      expect(metadata.description.length).toBeGreaterThan(0);
      expect(metadata.description.length).toBeLessThanOrEqual(1024);
      expect(readSkillFiles(dir).map((f) => f.path).sort()).toEqual(["SKILL.md", ...resources].sort());

      const content = readFileSync(path, "utf8");
      const links = [...content.matchAll(/\]\(((?:references|templates)\/[^)#]+)\)/g)].map((match) => match[1]);
      expect(links.sort()).toEqual([...resources].sort());
      for (const link of links) expect(existsSync(resolve(dir, link))).toBe(true);
    });
  }

  test("local discovery publishes every communication skill", async () => {
    const published = await buildLocalSkills(join(REPO_ROOT, "skills"));
    for (const name of Object.keys(skills)) {
      const expected = name === "communicate" ? "skill-md" : "archive";
      expect(published.find((s) => s.name === name)?.type).toBe(expected);
    }
  });
});
