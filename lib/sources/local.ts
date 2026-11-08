import { existsSync, lstatSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { readSkillFiles } from "#lib/archive.ts";
import { NAME_RE } from "#lib/constants.ts";
import { type Published, packSkill } from "#lib/registry.ts";
import { compare, fail } from "#lib/utils.ts";

/** Every directory below `skills/` with a SKILL.md is a skill. The directory name is the skill name. */
export async function buildLocalSkills(skillsDir: string): Promise<Published[]> {
  if (!existsSync(skillsDir)) return [];

  const skills: Published[] = [];
  for (const name of readdirSync(skillsDir).sort(compare)) {
    const dir = join(skillsDir, name);
    if (!lstatSync(dir).isDirectory() || !existsSync(join(dir, "SKILL.md"))) continue;
    if (!NAME_RE.test(name) || name.length > 64) fail(`skills/${name}: directory name is not a valid skill name`);
    skills.push(await packSkill(readSkillFiles(dir), { name }, `skills/${name}`));
  }
  return skills;
}
