import * as v from "valibot";
import { NAME_RE } from "#lib/constants.ts";

export const GithubSkillConfigSchema = v.object({
  source: v.pipe(v.string(), v.minLength(1)),
  skill: v.pipe(v.string(), v.minLength(1)),
  ref: v.optional(v.string()),
  path: v.optional(v.string()),
  as: v.optional(v.string()),
});

export const SiteSkillConfigSchema = v.object({
  site: v.pipe(v.string(), v.minLength(1)),
  skill: v.pipe(v.string(), v.minLength(1)),
  as: v.optional(v.string()),
});

export const ExternalSkillConfigSchema = v.union([
  GithubSkillConfigSchema,
  SiteSkillConfigSchema,
]);

export const SkillsConfigSchema = v.object({
  external: v.optional(v.array(ExternalSkillConfigSchema)),
});

export const LockEntrySchema = v.object({
  commit: v.optional(v.string()),
  digest: v.optional(v.string()),
});

export const SkillsLockSchema = v.record(v.string(), LockEntrySchema);

export const SkillEntryTypeSchema = v.picklist(["skill-md", "archive"]);

export const SkillIndexEntrySchema = v.object({
  name: v.pipe(v.string(), v.regex(NAME_RE), v.maxLength(64)),
  type: SkillEntryTypeSchema,
  description: v.pipe(v.string(), v.minLength(1), v.maxLength(1024)),
  url: v.pipe(v.string(), v.minLength(1)),
  digest: v.pipe(v.string(), v.startsWith("sha256:")),
});

export const SkillIndexSchema = v.object({
  $schema: v.string(),
  skills: v.array(SkillIndexEntrySchema),
});

export type GithubSkillConfig = v.InferOutput<typeof GithubSkillConfigSchema>;
export type SiteSkillConfig = v.InferOutput<typeof SiteSkillConfigSchema>;
export type ExternalSkillConfig = v.InferOutput<typeof ExternalSkillConfigSchema>;
export type SkillsConfig = v.InferOutput<typeof SkillsConfigSchema>;
export type LockEntry = v.InferOutput<typeof LockEntrySchema>;
export type SkillsLock = Record<string, LockEntry>;
export type SkillEntryType = v.InferOutput<typeof SkillEntryTypeSchema>;
export type SkillIndexEntry = v.InferOutput<typeof SkillIndexEntrySchema>;
export type SkillIndex = v.InferOutput<typeof SkillIndexSchema>;

export interface Frontmatter {
  name: string;
  description: string;
}

export interface LegacySiteSkillEntry {
  name: string;
  description?: string;
  files: string[];
}

export interface UpstreamSiteIndex {
  $schema?: string;
  skills?: Array<SkillIndexEntry & LegacySiteSkillEntry>;
}
