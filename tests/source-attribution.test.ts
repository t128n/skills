import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { readSkillFiles } from "#lib/archive.ts";
import { descriptionWithSource, packSkill } from "#lib/registry.ts";
import { githubSourceUrl } from "#lib/sources/github.ts";
import { REPO_ROOT } from "./helpers.ts";

describe("mirrored skill source attribution", () => {
  test("appends a readable source suffix", () => {
    expect(descriptionWithSource("A skill.", "https://example.com/skill")).toBe("A skill. [source: https://example.com/skill]");
  });

  test("links to the pinned GitHub skill directory", () => {
    expect(githubSourceUrl("owner/repo", "abcdef", "skills/my skill")).toBe("https://github.com/owner/repo/tree/abcdef/skills/my%20skill");
    expect(githubSourceUrl("owner/repo", "abcdef", ".")).toBe("https://github.com/owner/repo/tree/abcdef");
  });

  test("keeps long descriptions within the index limit", () => {
    const result = descriptionWithSource("Long description ".repeat(100), "https://example.com/skill");
    expect(result.length).toBeLessThanOrEqual(1024);
    expect(result).toEndWith("… [source: https://example.com/skill]");
  });

  test("does not split Unicode surrogate pairs", () => {
    const source = "https://example.com";
    const suffixLength = ` [source: ${source}]`.length;
    const result = descriptionWithSource("a".repeat(1024 - suffixLength - 2) + "😀extra", source);
    expect(result).not.toMatch(/[\uD800-\uDBFF]…/);
    expect(result.length).toBeLessThanOrEqual(1024);
  });

  test("rejects a source URL that cannot fit", () => {
    expect(() => descriptionWithSource("description", "x".repeat(1024))).toThrow();
  });

  test("changes only index metadata, not the archive digest", async () => {
    const files = readSkillFiles(join(REPO_ROOT, "skills", "calendar"));
    const original = await packSkill(files, { name: "calendar" }, "calendar");
    const attributed = await packSkill(files, { name: "calendar", sourceUrl: "https://example.com/skill" }, "calendar");
    expect(Buffer.compare(attributed.bytes, original.bytes)).toBe(0);
    expect(attributed.description).toBe(`${original.description} [source: https://example.com/skill]`);
  });

  test("a lone SKILL.md keeps its own description (no suffix)", async () => {
    const files = [{ path: "SKILL.md", data: Buffer.from("---\nname: x\ndescription: Plain.\n---\n"), executable: false }];
    const published = await packSkill(files, { name: "x", sourceUrl: "https://example.com" }, "x");
    expect(published.type).toBe("skill-md");
    expect(published.description).toBe("Plain.");
  });
});
