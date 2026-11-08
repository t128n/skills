#!/usr/bin/env bun
// Skills pack: builds the Agent Skills Discovery v0.2.0 site in dist/.
//
//   build    Generate dist/ from locked inputs. Never writes the lockfile.
//   resolve  Add missing lock entries, drop stale ones, fill the vendor store. Keeps approved entries.
//   update   Re-resolve every dependency and rewrite the lockfile (review the diff).
//   verify   Check dist/, or a deployed site with --base-url.

import { existsSync } from "node:fs";
import { parseArgs } from "node:util";
import { build } from "#lib/build.ts";
import { pathsFor } from "#lib/constants.ts";
import { createContext } from "#lib/context.ts";
import { publishSummary, updateLock } from "#lib/update.ts";
import { verifyDeployed, verifyDist } from "#lib/verify.ts";

const USAGE = `Usage: bun lib/index.ts <command> [options]

Commands:
  build                     Generate dist/ from skills.lock.json
  resolve                   Resolve missing dependencies, keep approved ones
  update                    Re-resolve all dependencies and rewrite the lockfile
  verify                    Verify dist/ (structure, index, URLs, digests)

Options:
  --summary-file <path>     update/resolve: also write the change summary here
  --base-url <url>          verify: check the deployed site instead of dist/
  -h, --help                Show this help
`;

export async function main(argv: string[]): Promise<number> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      "summary-file": { type: "string" },
      "base-url": { type: "string" },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });
  const [command] = positionals;
  if (values.help || positionals.length !== 1 || !["build", "resolve", "update", "verify"].includes(command)) {
    console.log(USAGE);
    return values.help ? 0 : 2;
  }

  const paths = pathsFor(process.cwd());
  const ctx = createContext();
  try {
    if (command === "build") {
      await build(paths, ctx);
    } else if (command === "resolve" || command === "update") {
      publishSummary(await updateLock(paths, ctx, command), values["summary-file"]);
    } else {
      let problems: string[];
      if (values["base-url"]) {
        problems = await verifyDeployed(values["base-url"]);
      } else if (!existsSync(paths.dist)) {
        problems = [`${paths.dist} does not exist. Run \`bun run build\` first.`];
      } else {
        problems = await verifyDist(paths.dist);
      }
      if (problems.length > 0) {
        console.error(`verify failed:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
        return 1;
      }
      console.log("verify ok");
    }
    return 0;
  } catch (err) {
    console.error(`error: ${(err as Error).message}`);
    return 1;
  } finally {
    ctx.tmp.cleanup();
  }
}

if (import.meta.main) process.exitCode = await main(process.argv.slice(2));
