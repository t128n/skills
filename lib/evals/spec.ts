import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * A check is graded by code against what the agent actually did: which skills it invoked,
 * which shell commands it ran, which files it wrote, and what it finally said.
 * `on: "body"` grades the final message without its `— from opencode` trailer line.
 */
export type Check = { description: string } & (
  | { type: "skill_invoked" | "skill_not_invoked"; skill: string }
  | { type: "final_matches" | "final_not_matches"; pattern: string; flags?: string; on?: "final" | "body" }
  | { type: "max_words"; n: number; on?: "final" | "body" }
  | { type: "bash_matches" | "bash_not_matches"; pattern: string; flags?: string }
  | { type: "wrote_file"; path?: string; content?: string; flags?: string }
  | { type: "no_write_matching"; content: string; flags?: string }
  | { type: "no_writes" }
);

export interface TriggerCase {
  id: string;
  prompt: string;
  should_trigger: boolean;
}

export interface BehaviorCase {
  id: string;
  name: string;
  prompt: string;
  /** Git remote URL to configure in the sandbox repo, for host-detection scenarios. */
  remote?: string;
  /** Override the default tool allowlist (Skill, Read, Glob, Grep, Bash, Write, Edit). */
  tools?: string[];
  max_turns?: number;
  checks: Check[];
}

export interface EvalFile {
  skill_name: string;
  triggers: TriggerCase[];
  behaviors: BehaviorCase[];
}

export const EVALS_DIR = join(import.meta.dir, "..", "..", "evals");

export function loadEvalFile(skill: string, dir = EVALS_DIR): EvalFile {
  const path = join(dir, skill, "evals.json");
  if (!existsSync(path)) throw new Error(`${path}: not found`);
  return JSON.parse(readFileSync(path, "utf8")) as EvalFile;
}

const CHECK_TYPES = new Set([
  "skill_invoked", "skill_not_invoked", "final_matches", "final_not_matches", "max_words",
  "bash_matches", "bash_not_matches", "wrote_file", "no_write_matching", "no_writes",
]);

/** Structural validation; returns a list of problems (empty when valid). */
export function validateEvalFile(file: EvalFile): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  const unique = (id: string) => {
    if (ids.has(id)) problems.push(`duplicate id ${id}`);
    ids.add(id);
  };
  if (!file.skill_name) problems.push("missing skill_name");
  for (const t of file.triggers ?? []) {
    unique(t.id);
    if (!t.prompt?.trim()) problems.push(`${t.id}: empty prompt`);
    if (typeof t.should_trigger !== "boolean") problems.push(`${t.id}: should_trigger must be boolean`);
  }
  for (const b of file.behaviors ?? []) {
    unique(b.id);
    if (!b.prompt?.trim()) problems.push(`${b.id}: empty prompt`);
    if (!b.checks?.length) problems.push(`${b.id}: needs at least one check`);
    for (const c of b.checks ?? []) {
      if (!CHECK_TYPES.has(c.type)) problems.push(`${b.id}: unknown check type ${c.type}`);
      if (!c.description) problems.push(`${b.id}: ${c.type} check lacks a description`);
      for (const key of ["pattern", "content", "path"] as const) {
        const source = (c as Record<string, unknown>)[key];
        if (typeof source !== "string") continue;
        try {
          new RegExp(source, (c as { flags?: string }).flags);
        } catch {
          problems.push(`${b.id}: invalid ${key} regex ${source}`);
        }
      }
    }
  }
  return problems;
}
