import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { bodyOf, gradeCheck, parseTranscript, type Transcript } from "#lib/evals/grade.ts";
import { EVALS_DIR, loadEvalFile, validateEvalFile } from "#lib/evals/spec.ts";
import { REPO_ROOT } from "./helpers.ts";

const evalSkills = existsSync(EVALS_DIR)
  ? readdirSync(EVALS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
  : [];

describe("eval definitions", () => {
  for (const skill of evalSkills) {
    describe(skill, () => {
      const file = loadEvalFile(skill);

      test("names an existing skill and is structurally valid", () => {
        expect(file.skill_name).toBe(skill);
        expect(existsSync(join(REPO_ROOT, "skills", skill, "SKILL.md"))).toBe(true);
        expect(validateEvalFile(file)).toEqual([]);
      });

      test("has both positive and negative trigger cases", () => {
        expect(file.triggers.some((t) => t.should_trigger)).toBe(true);
        expect(file.triggers.some((t) => !t.should_trigger)).toBe(true);
      });

      test("has behavior cases", () => {
        expect(file.behaviors.length).toBeGreaterThan(0);
      });

      test("fixture directories belong to a behavior case", () => {
        const dir = join(EVALS_DIR, skill, "fixtures");
        if (!existsSync(dir)) return;
        const ids = new Set(file.behaviors.map((b) => b.id));
        for (const name of readdirSync(dir)) expect(ids.has(name)).toBe(true);
      });
    });
  }
});

const transcript = (over: Partial<Transcript> = {}): Transcript => ({ skills: [], bash: [], writes: [], final: "", available: [], ...over });

describe("transcript parsing", () => {
  test("extracts skills, commands, writes and the final text from stream-json", () => {
    const lines = [
      { type: "system", subtype: "init", skills: ["planning"] },
      { type: "assistant", message: { content: [{ type: "tool_use", name: "Skill", input: { skill: "t128n:planning" } }] } },
      { type: "assistant", message: { content: [{ type: "tool_use", name: "Bash", input: { command: "gh pr view 1" } }, { type: "tool_use", name: "Write", input: { file_path: "a.md", content: "hi" } }] } },
      { type: "result", result: "done" },
    ].map((l) => JSON.stringify(l));
    const t = parseTranscript(["not json", ...lines].join("\n"));
    expect(t).toEqual({ available: ["planning"], skills: ["planning"], bash: ["gh pr view 1"], writes: [{ path: "a.md", content: "hi" }], final: "done" });
  });
});

describe("check grading", () => {
  test("skill checks", () => {
    const t = transcript({ skills: ["planning"] });
    expect(gradeCheck({ type: "skill_invoked", skill: "planning", description: "d" }, t).passed).toBe(true);
    expect(gradeCheck({ type: "skill_not_invoked", skill: "planning", description: "d" }, t).passed).toBe(false);
  });

  test("final text checks, with the trailer excluded from the body", () => {
    const t = transcript({ final: "yes — fine\n\n— from opencode" });
    expect(bodyOf(t.final)).toBe("yes — fine");
    expect(gradeCheck({ type: "final_not_matches", pattern: "—", description: "d" }, t).passed).toBe(false);
    expect(gradeCheck({ type: "final_not_matches", pattern: "—", on: "body", description: "d" }, t).passed).toBe(false);
    expect(gradeCheck({ type: "final_not_matches", pattern: "—", on: "body", description: "d" }, transcript({ final: "yes\n\n— from opencode" })).passed).toBe(true);
    expect(gradeCheck({ type: "max_words", n: 2, on: "body", description: "d" }, t).passed).toBe(false);
  });

  test("bash and write checks", () => {
    const t = transcript({ bash: ["gh pr view 1 -R acme.ghe.com/o/r"], writes: [{ path: "docs/adr/0001.md", content: "Status: Proposed" }] });
    expect(gradeCheck({ type: "bash_matches", pattern: "acme\\.ghe\\.com", description: "d" }, t).passed).toBe(true);
    expect(gradeCheck({ type: "bash_not_matches", pattern: "merge", description: "d" }, t).passed).toBe(true);
    expect(gradeCheck({ type: "wrote_file", path: "adr", content: "status:?\\s*(draft|proposed)", flags: "i", description: "d" }, t).passed).toBe(true);
    expect(gradeCheck({ type: "no_write_matching", content: "accepted", flags: "i", description: "d" }, t).passed).toBe(true);
    expect(gradeCheck({ type: "no_writes", description: "d" }, t).passed).toBe(false);
  });
});
