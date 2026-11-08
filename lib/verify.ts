import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { isGzip, readTarGz } from "#lib/archive.ts";
import { parseIndex } from "#lib/config.ts";
import { MAX_ARCHIVE_BYTES, SITE_PREFIX, WELL_KNOWN } from "#lib/constants.ts";
import { parseFrontmatter } from "#lib/frontmatter.ts";
import { compare, safeRelativePath, sha256 } from "#lib/utils.ts";

const ENTRY_KEYS = ["description", "digest", "name", "type", "url"];
const CONTENT_TYPES = {
  index: ["application/json"],
  "skill-md": ["text/markdown", "text/plain"],
  archive: ["application/gzip", "application/x-gzip"],
};

interface Entry {
  name: string;
  type: "skill-md" | "archive";
  description: string;
  url: string;
  digest: string;
}

/** Checks of the parsed index that do not depend on where the artifacts are. */
function checkIndex(raw: unknown, problems: string[]): Entry[] | undefined {
  let index;
  try {
    index = parseIndex(raw, "index.json");
  } catch (err) {
    problems.push((err as Error).message);
    return undefined;
  }

  const names = index.skills.map((s) => s.name);
  if (new Set(names).size !== names.length) problems.push("index.json lists a skill name twice");
  if (names.some((name, i) => i > 0 && compare(names[i - 1], name) > 0)) problems.push("index.json is not sorted by name");
  for (const entry of index.skills) {
    const keys = Object.keys(entry).sort(compare);
    if (keys.join() !== ENTRY_KEYS.join()) problems.push(`${entry.name}: entry has fields other than ${ENTRY_KEYS.join(", ")}`);
    const expected = entry.type === "skill-md" ? `${entry.name}/SKILL.md` : `${entry.name}.tar.gz`;
    if (entry.url !== expected) problems.push(`${entry.name}: url should be ${expected}, got ${entry.url}`);
  }
  return index.skills;
}

async function checkArtifact(entry: Entry, bytes: Buffer, problems: string[]): Promise<void> {
  const where = `${entry.name} (${entry.url})`;
  if (sha256(bytes) !== entry.digest) problems.push(`${where}: digest does not match the bytes (${sha256(bytes)})`);
  try {
    if (entry.type === "skill-md") {
      if (isGzip(bytes)) problems.push(`${where}: type skill-md but content is gzip`);
      else parseFrontmatter(bytes.toString("utf8"), where);
    } else {
      if (!isGzip(bytes)) {
        problems.push(`${where}: type archive but content is not gzip`);
        return;
      }
      const files = await readTarGz(bytes, where);
      const skillMd = files.find((f) => f.path === "SKILL.md");
      if (!skillMd) problems.push(`${where}: no SKILL.md at the archive root`);
      else parseFrontmatter(skillMd.data.toString("utf8"), `${where}/SKILL.md`);
    }
  } catch (err) {
    problems.push((err as Error).message);
  }
}

/** Verify a built site directory (`dist/`, or a staging copy of it). Returns the list of problems. */
export async function verifyDist(dist: string): Promise<string[]> {
  const problems: string[] = [];
  const siteDir = join(dist, SITE_PREFIX);
  const outDir = join(siteDir, WELL_KNOWN);

  if (!existsSync(join(dist, ".nojekyll"))) problems.push(".nojekyll is missing at the site root");
  if (!existsSync(join(siteDir, "index.html"))) problems.push("index.html is missing");

  const indexPath = join(outDir, "index.json");
  if (!existsSync(indexPath)) return [...problems, `${indexPath} is missing`];

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(indexPath, "utf8"));
  } catch (err) {
    return [...problems, `index.json is not valid JSON (${(err as Error).message})`];
  }
  const entries = checkIndex(raw, problems);
  if (!entries) return problems;

  // URLs resolve like a client does: against the index URL, below the project path.
  const indexUrl = new URL(["https://verify.invalid", SITE_PREFIX, WELL_KNOWN, "index.json"].filter(Boolean).join("/"));
  const indexDir = indexUrl.pathname.slice(0, indexUrl.pathname.lastIndexOf("/") + 1);
  for (const entry of entries) {
    const url = new URL(entry.url, indexUrl);
    if (url.origin !== indexUrl.origin || !url.pathname.startsWith(indexDir) || url.search || url.hash) {
      problems.push(`${entry.name}: url ${entry.url} does not stay below the index directory`);
      continue;
    }
    let file: string;
    try {
      file = join(outDir, safeRelativePath(decodeURIComponent(url.pathname.slice(indexDir.length)), `${entry.name} url`));
    } catch (err) {
      problems.push((err as Error).message);
      continue;
    }
    if (!existsSync(file)) {
      problems.push(`${entry.name}: ${entry.url} does not exist in the site`);
      continue;
    }
    await checkArtifact(entry, readFileSync(file), problems);
  }
  return problems;
}

function isLocalHost(url: URL): boolean {
  return url.hostname === "localhost" || url.hostname === "127.0.0.1";
}

/** Check a deployed site over HTTP: status, no redirects, content types, digests. GET and HEAD. */
export async function verifyDeployed(baseUrl: string): Promise<string[]> {
  const problems: string[] = [];
  const base = new URL(baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  if (base.protocol !== "https:" && !(base.protocol === "http:" && isLocalHost(base))) {
    return [`--base-url must be https (or http on localhost), got ${baseUrl}`];
  }

  const get = async (url: URL, kind: keyof typeof CONTENT_TYPES): Promise<Buffer | undefined> => {
    for (const method of ["HEAD", "GET"]) {
      let res: Response;
      try {
        res = await fetch(url, { method, redirect: "manual", signal: AbortSignal.timeout(30_000) });
      } catch (err) {
        problems.push(`${method} ${url}: ${(err as Error).message}`);
        return undefined;
      }
      if (res.status !== 200) {
        problems.push(`${method} ${url} -> ${res.status}${res.headers.get("location") ? ` (redirect to ${res.headers.get("location")})` : ""}`);
        await res.body?.cancel();
        return undefined;
      }
      const type = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
      if (!CONTENT_TYPES[kind].includes(type)) {
        problems.push(`${method} ${url}: content type ${JSON.stringify(type)}, expected ${CONTENT_TYPES[kind].join(" or ")}`);
      }
      if (method === "GET") {
        if (Number(res.headers.get("content-length")) > MAX_ARCHIVE_BYTES) {
          problems.push(`GET ${url}: larger than ${MAX_ARCHIVE_BYTES} bytes`);
          await res.body?.cancel();
          return undefined;
        }
        return Buffer.from(await res.arrayBuffer());
      }
    }
    return undefined;
  };

  const indexUrl = new URL(`${WELL_KNOWN}/index.json`, base);
  const indexBytes = await get(indexUrl, "index");
  if (!indexBytes) return problems;
  let entries: Entry[] | undefined;
  try {
    entries = checkIndex(JSON.parse(indexBytes.toString("utf8")), problems);
  } catch (err) {
    problems.push(`${indexUrl}: not valid JSON (${(err as Error).message})`);
  }

  for (const entry of entries ?? []) {
    const url = new URL(entry.url, indexUrl);
    if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) {
      problems.push(`${entry.name}: url ${entry.url} resolves outside ${base}`);
      continue;
    }
    const bytes = await get(url, entry.type);
    if (bytes) await checkArtifact(entry, bytes, problems);
  }
  return problems;
}
