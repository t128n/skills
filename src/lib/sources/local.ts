import { existsSync, lstatSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { SkillRegistry } from "#lib/registry.ts";

export async function buildLocalSkills(
  ownSkillsDir: string,
  registry: SkillRegistry,
): Promise<void> {
  if (!existsSync(ownSkillsDir)) return;

  for (const name of readdirSync(ownSkillsDir).sort()) {
    const dir = join(ownSkillsDir, name);
    if (lstatSync(dir).isDirectory() && existsSync(join(dir, "SKILL.md"))) {
      await registry.emitDir(dir, { as: name });
    }
  }
}
