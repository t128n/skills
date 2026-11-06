import { describe, expect, test } from "bun:test";
import { SkillRegistry, descriptionWithSource } from "../src/lib/registry.ts";
import { githubSourceUrl } from "../src/lib/sources/github.ts";

describe("mirrored skill source attribution", () => {
  test("appends a readable source suffix", () => {
    expect(descriptionWithSource("A skill.", "https://example.com/skill"))
      .toBe("A skill. [source: https://example.com/skill]");
  });

  test("links to the pinned GitHub skill directory", () => {
    expect(githubSourceUrl("owner/repo", "abcdef", "skills/my skill"))
      .toBe("https://github.com/owner/repo/tree/abcdef/skills/my%20skill");
    expect(githubSourceUrl("owner/repo", "abcdef", "."))
      .toBe("https://github.com/owner/repo/tree/abcdef");
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
    const local = new SkillRegistry({ writeFiles: false });
    const mirrored = new SkillRegistry({ writeFiles: false });
    const original = await local.emitDir("skills/calendar");
    const attributed = await mirrored.emitDir("skills/calendar", { sourceUrl: "https://example.com/skill" });
    expect(attributed.digest).toBe(original.digest);
    expect(attributed.url).toBe(original.url);
    expect(attributed.description).toBe(`${original.description} [source: https://example.com/skill]`);
  });
});
