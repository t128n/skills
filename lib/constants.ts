import { join } from "node:path";

/** Discovery format identifier required by Agent Skills Discovery v0.2.0. */
export const DISCOVERY_SCHEMA = "https://schemas.agentskills.io/discovery/0.2.0/schema.json";
export const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const COMMIT_RE = /^[a-f0-9]{40}$/;
export const DIGEST_RE = /^sha256:[a-f0-9]{64}$/;

/** Site path below `dist/`. The Pages site is `https://t128n.github.io/skills/`, so `dist/` is the root. */
export const SITE_PREFIX = "";
export const PUBLIC_URL = "https://t128n.github.io/skills/";
export const WELL_KNOWN = ".well-known/agent-skills";

/** Archive limits shared with the `skills` CLI (50 MB unpacked, 1000 files). */
export const MAX_ARCHIVE_BYTES = 50 * 1024 * 1024;
export const MAX_ARCHIVE_FILES = 1000;
/** The `skills` CLI reads ustar archives only, so a path must fit the 100 byte name field. */
export const MAX_ARCHIVE_PATH_BYTES = 100;

export interface Paths {
  root: string;
  dist: string;
  siteDir: string;
  outDir: string;
  skillsDir: string;
  config: string;
  lock: string;
  vendor: string;
}

export function pathsFor(root: string): Paths {
  const dist = join(root, "dist");
  const siteDir = join(dist, SITE_PREFIX);
  return {
    root,
    dist,
    siteDir,
    outDir: join(siteDir, WELL_KNOWN),
    skillsDir: join(root, "skills"),
    config: join(root, "skills.config.json"),
    lock: join(root, "skills.lock.json"),
    vendor: join(root, "vendor", "sha256"),
  };
}
