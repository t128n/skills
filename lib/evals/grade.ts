import type { Check } from "#lib/evals/spec.ts";

export interface Transcript {
  skills: string[];
  bash: string[];
  writes: { path: string; content: string }[];
  final: string;
  /** Skills visible to the agent, from the init message (empty when unknown). */
  available: string[];
}

export const TRAILER = "— from opencode";

/** Reduce Claude Code `stream-json` output to what the checks need. */
export function parseTranscript(stdout: string): Transcript {
  const t: Transcript = { skills: [], bash: [], writes: [], final: "", available: [] };
  for (const line of stdout.split("\n")) {
    if (!line.trim().startsWith("{")) continue;
    let msg: any;
    try {
      msg = JSON.parse(line);
    } catch {
      continue;
    }
    if (msg.type === "system" && msg.subtype === "init" && Array.isArray(msg.skills)) {
      t.available = msg.skills.map(String);
    } else if (msg.type === "assistant") {
      for (const block of msg.message?.content ?? []) {
        if (block.type !== "tool_use") continue;
        const input = block.input ?? {};
        if (block.name === "Skill") t.skills.push(String(input.skill ?? "").replace(/^.*:/, ""));
        else if (block.name === "Bash") t.bash.push(String(input.command ?? ""));
        else if (block.name === "Write") t.writes.push({ path: String(input.file_path ?? ""), content: String(input.content ?? "") });
        else if (block.name === "Edit") t.writes.push({ path: String(input.file_path ?? ""), content: String(input.new_string ?? "") });
      }
    } else if (msg.type === "result" && typeof msg.result === "string") {
      t.final = msg.result;
    }
  }
  return t;
}

/** The final message without a trailing attribution line. */
export function bodyOf(final: string): string {
  return final.split("\n").filter((l) => l.trim() !== TRAILER).join("\n").trim();
}

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

export interface CheckResult {
  description: string;
  passed: boolean;
  evidence: string;
}

export function gradeCheck(check: Check, t: Transcript): CheckResult {
  const result = (passed: boolean, evidence: string): CheckResult => ({ description: check.description, passed, evidence });
  const target = (on?: "final" | "body") => (on === "body" ? bodyOf(t.final) : t.final);

  switch (check.type) {
    case "skill_invoked":
      return result(t.skills.includes(check.skill), `skills invoked: [${t.skills.join(", ")}]`);
    case "skill_not_invoked":
      return result(!t.skills.includes(check.skill), `skills invoked: [${t.skills.join(", ")}]`);
    case "final_matches":
    case "final_not_matches": {
      const m = new RegExp(check.pattern, check.flags).exec(target(check.on));
      const want = check.type === "final_matches";
      return result(!!m === want, m ? `matched "${m[0].slice(0, 80)}"` : "no match");
    }
    case "max_words": {
      const n = words(target(check.on));
      return result(n <= check.n, `${n} words (limit ${check.n})`);
    }
    case "bash_matches":
    case "bash_not_matches": {
      const re = new RegExp(check.pattern, check.flags);
      const hit = t.bash.find((c) => re.test(c));
      const want = check.type === "bash_matches";
      return result(!!hit === want, hit ? `command: ${hit.slice(0, 120)}` : `${t.bash.length} bash commands, none matched`);
    }
    case "wrote_file": {
      const path = check.path ? new RegExp(check.path, "i") : null;
      const content = check.content ? new RegExp(check.content, check.flags) : null;
      const hit = t.writes.find((w) => (!path || path.test(w.path)) && (!content || content.test(w.content)));
      return result(!!hit, hit ? `wrote ${hit.path}` : `writes: [${t.writes.map((w) => w.path).join(", ")}]`);
    }
    case "no_write_matching": {
      const re = new RegExp(check.content, check.flags);
      const hit = t.writes.find((w) => re.test(w.content));
      return result(!hit, hit ? `${hit.path} matches` : "no write matched");
    }
    case "no_writes":
      return result(t.writes.length === 0, `writes: [${t.writes.map((w) => w.path).join(", ")}]`);
  }
}
