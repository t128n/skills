/**
 * Live skill evals: run real `claude -p` sessions in a sandbox and grade what the agent did.
 *
 *   bun lib/evals/cli.ts <skill|all> [--triggers|--behaviors] [--baseline] [--reps N]
 *                        [--only ID] [--model M] [--parallel N]
 *
 * Trigger cases check that the skill is (or is not) invoked for a prompt. Behavior cases run
 * with the skill installed and, with --baseline, again without it, so the pass-rate difference
 * shows what the skill changes. Runs cost API usage; they are not part of `bun test`.
 */
import { spawn } from "node:child_process";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { gradeCheck, parseTranscript, type CheckResult, type Transcript } from "#lib/evals/grade.ts";
import { EVALS_DIR, loadEvalFile, validateEvalFile, type BehaviorCase } from "#lib/evals/spec.ts";

const REPO = join(import.meta.dir, "..", "..");
const SKILLS_DIR = join(REPO, "skills");
const DEFAULT_TOOLS = ["Skill", "Read", "Glob", "Grep", "Bash", "Write", "Edit"];
const TRIGGER_TOOLS = ["Skill", "Read", "Glob", "Grep"];

const GH_SHIM = `#!/bin/sh
# Offline stand-in for gh: logs the call and replays canned data. Never touches the network.
echo "gh $*" >> "$EVAL_DIR/gh.log"
if [ "$1" = "auth" ] && [ "$2" = "status" ]; then
  printf 'github.com\\n  Logged in to github.com account torben-personal\\n  Active account: false\\nacme.ghe.com\\n  Logged in to acme.ghe.com account thaack-acme\\n  Active account: true\\n'
  exit 0
fi
if [ -f "$EVAL_DIR/.gh/response.json" ]; then cat "$EVAL_DIR/.gh/response.json"; else echo '{}'; fi
`;

interface Args {
  skills: string[];
  triggers: boolean;
  behaviors: boolean;
  baseline: boolean;
  reps?: number;
  only?: string;
  model?: string;
  parallel: number;
  dump?: string;
}

function parseArgs(argv: string[]): Args {
  const a: Args = { skills: [], triggers: true, behaviors: true, baseline: false, parallel: 4 };
  const rest = [...argv];
  const next = () => rest.shift() ?? "";
  while (rest.length) {
    const arg = next();
    if (arg === "--triggers") a.behaviors = false;
    else if (arg === "--behaviors") a.triggers = false;
    else if (arg === "--baseline") a.baseline = true;
    else if (arg === "--reps") a.reps = Number(next());
    else if (arg === "--only") a.only = next();
    else if (arg === "--model") a.model = next();
    else if (arg === "--parallel") a.parallel = Number(next());
    else if (arg === "--dump") a.dump = next();
    else a.skills.push(arg);
  }
  if (a.skills.length === 0 || a.skills.includes("all")) {
    a.skills = readdirSync(EVALS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(join(EVALS_DIR, d.name, "evals.json")))
      .map((d) => d.name);
  }
  return a;
}

function run(
  cmd: string,
  args: string[],
  opts: { cwd: string; env?: NodeJS.ProcessEnv; stdin?: string; timeoutMs?: number },
): Promise<{ stdout: string; code: number | null }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd: opts.cwd, env: opts.env ?? process.env, shell: process.platform === "win32" && cmd === "claude" });
    let stdout = "";
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", () => {});
    const timer = setTimeout(() => child.kill(), opts.timeoutMs ?? 300_000);
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ stdout, code });
    });
    child.stdin.end(opts.stdin ?? "");
  });
}

interface Sandbox {
  dir: string;
  env: NodeJS.ProcessEnv;
}

/** Fresh project dir with the repo's skills installed (minus the target when `withSkill` is false), fixtures, a git remote and the gh shim. */
async function makeSandbox(skill: string, caseId: string, opts: { withSkill: boolean; remote?: string }): Promise<Sandbox> {
  const dir = mkdtempSync(join(tmpdir(), "skill-eval-"));
  const installed = join(dir, ".claude", "skills");
  mkdirSync(installed, { recursive: true });
  for (const name of readdirSync(SKILLS_DIR)) {
    if (!opts.withSkill && name === skill) continue;
    cpSync(join(SKILLS_DIR, name), join(installed, name), { recursive: true });
  }
  const fixtures = join(EVALS_DIR, skill, "fixtures", caseId);
  if (existsSync(fixtures)) cpSync(fixtures, dir, { recursive: true });
  await run("git", ["init", "-q"], { cwd: dir });
  if (opts.remote) await run("git", ["remote", "add", "origin", opts.remote], { cwd: dir });
  mkdirSync(join(dir, "bin"));
  writeFileSync(join(dir, "bin", "gh"), GH_SHIM);
  chmodSync(join(dir, "bin", "gh"), 0o755);
  return {
    dir,
    env: { ...process.env, EVAL_DIR: dir.replace(/\\/g, "/"), PATH: `${join(dir, "bin")}${delimiter}${process.env.PATH}` },
  };
}

async function runClaude(sb: Sandbox, prompt: string, tools: string[], maxTurns: number, model?: string, dump?: string): Promise<Transcript> {
  const args = [
    "-p", "--output-format", "stream-json", "--verbose",
    "--setting-sources", "project",
    "--tools", tools.join(","),
    "--permission-mode", "bypassPermissions",
    "--max-turns", String(maxTurns),
    "--no-session-persistence",
    ...(model ? ["--model", model] : []),
  ];
  const { stdout } = await run("claude", args, { cwd: sb.dir, env: sb.env, stdin: prompt });
  if (dump) {
    mkdirSync(dump, { recursive: true });
    writeFileSync(join(dump, `${Date.now()}-${Math.random().toString(36).slice(2, 6)}.jsonl`), stdout);
  }
  return parseTranscript(stdout);
}

async function pool<T>(jobs: (() => Promise<T>)[], size: number): Promise<T[]> {
  const out: T[] = new Array(jobs.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, jobs.length) }, async () => {
      while (i < jobs.length) {
        const n = i++;
        out[n] = await jobs[n]!();
      }
    }),
  );
  return out;
}

const frac = (n: number, d: number) => (d === 0 ? "n/a" : `${n}/${d}`);

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  const repoSkills = new Set(readdirSync(SKILLS_DIR));
  const foreign = new Set<string>();
  let failed = false;

  for (const skill of args.skills) {
    const file = loadEvalFile(skill);
    const problems = validateEvalFile(file);
    if (problems.length) throw new Error(`${skill}: invalid evals.json\n  ${problems.join("\n  ")}`);
    const keep = (id: string) => !args.only || id === args.only;
    console.log(`\n== ${skill} ==`);

    if (args.triggers) {
      const reps = args.reps ?? 3;
      const cases = file.triggers.filter((t) => keep(t.id));
      const results = await pool(
        cases.map((c) => async () => {
          let hits = 0;
          for (let r = 0; r < reps; r++) {
            const sb = await makeSandbox(skill, c.id, { withSkill: true });
            const t = await runClaude(sb, c.prompt, TRIGGER_TOOLS, 4, args.model, args.dump);
            for (const s of t.available) if (!repoSkills.has(s.replace(/^.*:/, ""))) foreign.add(s);
            if (t.skills.includes(skill)) hits++;
            rmSync(sb.dir, { recursive: true, force: true });
          }
          return { c, hits };
        }),
        args.parallel,
      );
      console.log("triggers (invoked / runs):");
      for (const { c, hits } of results) {
        const ok = c.should_trigger ? hits > reps / 2 : hits <= reps / 2;
        if (!ok) failed = true;
        console.log(`  ${ok ? "PASS" : "FAIL"} ${c.id.padEnd(26)} expect ${c.should_trigger ? "trigger   " : "no-trigger"} got ${frac(hits, reps)}  "${c.prompt.slice(0, 60)}"`);
      }
    }

    if (args.behaviors) {
      const reps = args.reps ?? 1;
      const cases = file.behaviors.filter((b) => keep(b.id));
      const arms = args.baseline ? [true, false] : [true];
      const one = async (c: BehaviorCase, withSkill: boolean): Promise<CheckResult[]> => {
        const sb = await makeSandbox(skill, c.id, { withSkill, remote: c.remote });
        const t = await runClaude(sb, c.prompt, c.tools ?? DEFAULT_TOOLS, c.max_turns ?? 12, args.model, args.dump);
        rmSync(sb.dir, { recursive: true, force: true });
        if (withSkill && !t.available.includes(skill) && t.available.length) console.warn(`warning: ${c.id}: ${skill} not in the agent's skill list`);
        return c.checks.map((k) => gradeCheck(k, t));
      };
      const jobs = cases.flatMap((c) =>
        arms.flatMap((withSkill) => Array.from({ length: reps }, () => async () => ({ c, withSkill, checks: await one(c, withSkill) }))),
      );
      const results = await pool(jobs, args.parallel);
      console.log("behaviors (checks passed):");
      for (const c of cases) {
        const score = (withSkill: boolean) => {
          const rs = results.filter((r) => r.c === c && r.withSkill === withSkill);
          return { rs, passed: rs.reduce((n, r) => n + r.checks.filter((k) => k.passed).length, 0), total: rs.length * c.checks.length };
        };
        const w = score(true);
        const b = args.baseline ? score(false) : null;
        if (w.passed < w.total) failed = true;
        console.log(`  ${w.passed === w.total ? "PASS" : "FAIL"} ${c.name.padEnd(26)} with skill ${frac(w.passed, w.total)}${b ? `   baseline ${frac(b.passed, b.total)}` : ""}`);
        for (const r of w.rs) for (const k of r.checks) if (!k.passed) console.log(`       x ${k.description} (${k.evidence})`);
      }
    }
  }
  if (foreign.size) console.warn(`\nwarning: the agent saw skills outside this repo (${[...foreign].join(", ")}); trigger results may be skewed.`);
  return failed ? 1 : 0;
}

process.exit(await main());
