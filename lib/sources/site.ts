import { type SkillFile, isGzip, packTarGz } from "#lib/archive.ts";
import { type SiteDep, normalizeSite, parseIndex, publishedName } from "#lib/config.ts";
import { DISCOVERY_SCHEMA, MAX_ARCHIVE_BYTES, MAX_ARCHIVE_FILES } from "#lib/constants.ts";
import type { Context } from "#lib/context.ts";
import { assertSafeUrl, fetchBytes } from "#lib/http.ts";
import { type Published, publishBytes } from "#lib/registry.ts";
import { fail, safeRelativePath, sha256 } from "#lib/utils.ts";

const WELL_KNOWN_PATHS = [".well-known/agent-skills", ".well-known/skills"];
const MAX_INDEX_BYTES = 1024 * 1024;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

export interface SiteArtifact {
  bytes: Buffer;
  digest: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function fetchIndex(base: string, ctx: Context): Promise<{ raw: unknown; dirUrl: string }> {
  const tried: string[] = [];
  for (const prefix of WELL_KNOWN_PATHS) {
    const indexUrl = `${base}/${prefix}/index.json`;
    try {
      const raw = JSON.parse((await fetchBytes(indexUrl, ctx.http, MAX_INDEX_BYTES)).toString("utf8")) as unknown;
      return { raw, dirUrl: `${base}/${prefix}` };
    } catch (err) {
      tried.push(`  ${indexUrl}: ${(err as Error).message}`);
    }
  }
  return fail(`${base}: no skills index found. Tried:\n${tried.join("\n")}`);
}

async function fetchV02(raw: unknown, dep: SiteDep, dirUrl: string, ctx: Context): Promise<SiteArtifact> {
  const indexUrl = `${dirUrl}/index.json`;
  const index = parseIndex(raw, indexUrl);
  const entry = index.skills.find((s) => s.name === dep.skill);
  if (!entry) fail(`${indexUrl}: skill "${dep.skill}" is not listed`);

  const artifactUrl = assertSafeUrl(new URL(entry.url, indexUrl).toString(), ctx.http.allowHttp).toString();
  const bytes = await fetchBytes(artifactUrl, ctx.http, entry.type === "archive" ? MAX_ARCHIVE_BYTES : MAX_FILE_BYTES);
  if (sha256(bytes) !== entry.digest) fail(`${artifactUrl}: digest ${sha256(bytes)} does not match the index (${entry.digest})`);
  if (isGzip(bytes) !== (entry.type === "archive")) fail(`${artifactUrl}: content does not match type "${entry.type}"`);
  return { bytes, digest: entry.digest };
}

/** Check the legacy v0.1.0 file list of one skill and return its safe relative paths. */
function legacyFiles(raw: unknown, dep: SiteDep, indexUrl: string): string[] {
  const skills = isRecord(raw) ? raw.skills : undefined;
  if (!Array.isArray(skills)) fail(`${indexUrl}: "skills" must be an array`);
  const entry = skills.find((s) => isRecord(s) && s.name === dep.skill);
  if (!isRecord(entry)) fail(`${indexUrl}: skill "${dep.skill}" is not listed`);
  const files = entry.files;
  if (!Array.isArray(files) || files.length === 0 || files.some((f) => typeof f !== "string")) {
    fail(`${indexUrl}: skill "${dep.skill}" needs a non-empty "files" array of strings`);
  }
  if (files.length > MAX_ARCHIVE_FILES) fail(`${indexUrl}: skill "${dep.skill}" lists more than ${MAX_ARCHIVE_FILES} files`);
  const paths = (files as string[]).map((f) => safeRelativePath(f, `${indexUrl} file`));
  if (new Set(paths).size !== paths.length) fail(`${indexUrl}: skill "${dep.skill}" lists a file twice`);
  if (!paths.includes("SKILL.md")) fail(`${indexUrl}: skill "${dep.skill}" has no SKILL.md`);
  return paths;
}

/** Legacy v0.1.0 indexes have no digests: download the files and package them deterministically. */
async function fetchLegacy(raw: unknown, dep: SiteDep, dirUrl: string, ctx: Context): Promise<SiteArtifact> {
  const paths = legacyFiles(raw, dep, `${dirUrl}/index.json`);
  const files: SkillFile[] = [];
  let total = 0;
  for (const path of paths) {
    const url = `${dirUrl}/${encodeURIComponent(dep.skill)}/${path.split("/").map(encodeURIComponent).join("/")}`;
    const data = await fetchBytes(url, ctx.http, MAX_FILE_BYTES);
    total += data.length;
    if (total > MAX_ARCHIVE_BYTES) fail(`${dirUrl}: skill "${dep.skill}" is larger than ${MAX_ARCHIVE_BYTES} bytes`);
    files.push({ path, data, executable: false });
  }
  const bytes = files.length === 1 ? files[0].data : await packTarGz(files);
  return { bytes, digest: sha256(bytes) };
}

/** Update only: download the current upstream artifact and compute its digest. */
export async function fetchSiteArtifact(dep: SiteDep, ctx: Context): Promise<SiteArtifact> {
  const base = normalizeSite(dep.site);
  const { raw, dirUrl } = await fetchIndex(base, ctx);
  const schema = isRecord(raw) ? raw.$schema : undefined;
  if (schema === DISCOVERY_SCHEMA) return fetchV02(raw, dep, dirUrl, ctx);
  if (schema === undefined) return fetchLegacy(raw, dep, dirUrl, ctx);
  return fail(`${dirUrl}/index.json: unsupported $schema ${JSON.stringify(schema)}`);
}

/** Package approved (vendored) bytes. Never touches the network. */
export function publishSiteSkill(dep: SiteDep, bytes: Buffer): Promise<Published> {
  const site = normalizeSite(dep.site);
  return publishBytes(bytes, { name: publishedName(dep), skill: dep.skill, sourceUrl: site }, `${site}#${dep.skill}`);
}
