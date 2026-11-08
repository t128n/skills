import { describe, expect, test } from "bun:test";
import { assertLockMatchesConfig, checkLock, depKey, normalizeSite, parseConfig, parseIndex, parseLock } from "#lib/config.ts";
import { DISCOVERY_SCHEMA } from "#lib/constants.ts";
import { diffLocks, serializeLock } from "#lib/lock.ts";

const SHA = "a".repeat(40);
const DIGEST = `sha256:${"b".repeat(64)}`;

describe("config schema", () => {
  test("accepts GitHub and site sources", () => {
    const config = parseConfig({
      external: [
        { source: "owner/repo", skill: "one", ref: "main", path: "skills/one" },
        { site: "https://example.com", skill: "two", as: "two-renamed" },
      ],
    });
    expect(config.external).toHaveLength(2);
  });

  test.each([
    ["unknown field", { external: [{ source: "o/r", skill: "a", extra: 1 }] }],
    ["uppercase skill name", { external: [{ source: "o/r", skill: "Bad" }] }],
    ["http site", { external: [{ site: "http://example.com", skill: "a" }] }],
    ["site with credentials", { external: [{ site: "https://user@example.com", skill: "a" }] }],
    ["bad repository", { external: [{ source: "not-a-repo", skill: "a" }] }],
    ["both source and site", { external: [{ source: "o/r", site: "https://e.com", skill: "a" }] }],
    ["missing external", {}],
  ])("rejects %s", (_name, raw) => {
    expect(() => parseConfig(raw)).toThrow();
  });

  test("rejects a path that leaves the skill repository", () => {
    expect(() => parseConfig({ external: [{ source: "o/r", skill: "a", path: "../x" }] })).toThrow(/unsafe/);
    expect(() => parseConfig({ external: [{ source: "o/r", skill: "a", path: "/etc" }] })).toThrow(/unsafe/);
  });

  test("rejects duplicate dependencies and duplicate published names", () => {
    expect(() => parseConfig({ external: [{ source: "o/r", skill: "a" }, { source: "o/r", skill: "a" }] })).toThrow(/duplicate dependency/);
    expect(() => parseConfig({ external: [{ source: "o/r", skill: "a" }, { source: "p/q", skill: "a" }] })).toThrow(/both publish the name/);
    expect(() => parseConfig({ external: [{ source: "o/r", skill: "a" }, { source: "p/q", skill: "a", as: "b" }] })).not.toThrow();
  });

  test("a site with and without trailing slash is the same dependency", () => {
    expect(normalizeSite("https://example.com/")).toBe("https://example.com");
    expect(() => parseConfig({ external: [{ site: "https://example.com", skill: "a" }, { site: "https://example.com/", skill: "a" }] })).toThrow(/duplicate/);
  });
});

describe("lock schema", () => {
  test("accepts commit and digest entries and ignores $schema", () => {
    const lock = parseLock({ $schema: "./x.json", "o/r#a": { commit: SHA }, "https://e.com#b": { digest: DIGEST } });
    expect(Object.keys(lock).sort()).toEqual(["https://e.com#b", "o/r#a"]);
  });

  test.each([
    ["short commit", { "o/r#a": { commit: "abc123" } }],
    ["uppercase commit", { "o/r#a": { commit: "A".repeat(40) } }],
    ["bad digest", { "o/r#a": { digest: "sha256:zz" } }],
    ["extra field", { "o/r#a": { commit: SHA, extra: true } }],
    ["both fields", { "o/r#a": { commit: SHA, digest: DIGEST } }],
    ["not an object", { "o/r#a": SHA }],
  ])("rejects %s", (_name, raw) => {
    expect(() => parseLock(raw)).toThrow();
  });

  test("serializes with sorted keys and a trailing newline", () => {
    const text = serializeLock({ "z/z#a": { commit: SHA }, "a/a#a": { commit: SHA } });
    expect(text.endsWith("\n")).toBe(true);
    expect(Object.keys(JSON.parse(text))).toEqual(["$schema", "a/a#a", "z/z#a"]);
  });

  test("reports missing, stale and wrong-type entries", () => {
    const config = parseConfig({ external: [{ source: "o/r", skill: "a" }, { site: "https://e.com", skill: "b" }, { source: "o/r", skill: "c" }] });
    const lock = parseLock({ "o/r#a": { commit: SHA }, "https://e.com#b": { commit: SHA }, "gone/repo#x": { commit: SHA } });
    expect(checkLock(config, lock)).toEqual({ missing: ["o/r#c"], stale: ["gone/repo#x"], wrongType: ["https://e.com#b"] });
    expect(() => assertLockMatchesConfig(config, lock)).toThrow(/skills:resolve/);
    expect(depKey(config.external[1])).toBe("https://e.com#b");
  });

  test("diffLocks lists added, removed and updated entries", () => {
    const before = parseLock({ "o/r#a": { commit: SHA }, "o/r#b": { commit: SHA } });
    const after = parseLock({ "o/r#a": { commit: "c".repeat(40) }, "o/r#c": { commit: SHA } });
    const diff = diffLocks(before, after);
    expect(diff.added.map((c) => c.key)).toEqual(["o/r#c"]);
    expect(diff.removed.map((c) => c.key)).toEqual(["o/r#b"]);
    expect(diff.updated.map((c) => c.key)).toEqual(["o/r#a"]);
  });
});

describe("index schema", () => {
  const entry = { name: "a", type: "skill-md", description: "d", url: "a/SKILL.md", digest: DIGEST };

  test("accepts a valid index", () => {
    expect(parseIndex({ $schema: DISCOVERY_SCHEMA, skills: [entry] }, "i").skills).toHaveLength(1);
  });

  test.each([
    ["wrong $schema", { $schema: "https://example.com/other.json", skills: [entry] }],
    ["unknown type", { $schema: DISCOVERY_SCHEMA, skills: [{ ...entry, type: "zip" }] }],
    ["bad digest", { $schema: DISCOVERY_SCHEMA, skills: [{ ...entry, digest: "md5:1" }] }],
    ["missing description", { $schema: DISCOVERY_SCHEMA, skills: [{ ...entry, description: undefined }] }],
    ["description over 1024 characters", { $schema: DISCOVERY_SCHEMA, skills: [{ ...entry, description: "x".repeat(1025) }] }],
  ])("rejects %s", (_name, raw) => {
    expect(() => parseIndex(raw, "i")).toThrow();
  });
});
