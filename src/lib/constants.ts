import { join } from "node:path";

export const ROOT = process.cwd();
export const DIST_DIR = join(ROOT, "dist");
export const OUT_DIR = join(DIST_DIR, ".well-known", "agent-skills");
export const OWN_SKILLS_DIR = join(ROOT, "skills");
export const CONFIG_PATH = join(ROOT, "skills.config.json");
export const LOCK_PATH = join(ROOT, "skills.lock.json");
export const INDEX_HTML_PATH = join(ROOT, "src", "index.html");

export const SCHEMA = "https://schemas.agentskills.io/discovery/0.2.0/schema.json";
export const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
