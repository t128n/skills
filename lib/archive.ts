import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";
import { packTar, unpackTar, type TarEntry } from "modern-tar";
import { MAX_ARCHIVE_BYTES, MAX_ARCHIVE_FILES, MAX_ARCHIVE_PATH_BYTES } from "#lib/constants.ts";
import { compare, fail, safeRelativePath } from "#lib/utils.ts";

export interface SkillFile {
  /** Relative POSIX path, e.g. `references/guide.md`. */
  path: string;
  data: Buffer;
  executable: boolean;
}

const IGNORED = new Set([".git", "node_modules", ".DS_Store"]);

export function isGzip(bytes: Uint8Array): boolean {
  return bytes.length > 2 && bytes[0] === 0x1f && bytes[1] === 0x8b;
}

/**
 * Read every file below a skill directory. Symlinks and special files are rejected,
 * because they could point outside the skill.
 */
export function readSkillFiles(dir: string): SkillFile[] {
  const files: SkillFile[] = [];
  let total = 0;

  const visit = (rel: string): void => {
    for (const name of readdirSync(join(dir, rel)).sort(compare)) {
      if (IGNORED.has(name)) continue;
      const path = rel ? `${rel}/${name}` : name;
      const full = join(dir, path);
      const stat = lstatSync(full);
      if (stat.isSymbolicLink()) fail(`${full}: symlinks are not allowed in a skill`);
      if (stat.isDirectory()) {
        visit(path);
      } else if (stat.isFile()) {
        total += stat.size;
        if (files.length >= MAX_ARCHIVE_FILES || total > MAX_ARCHIVE_BYTES) {
          fail(`${dir}: skill is larger than ${MAX_ARCHIVE_FILES} files or ${MAX_ARCHIVE_BYTES} bytes`);
        }
        files.push({ path, data: readFileSync(full), executable: (stat.mode & 0o111) !== 0 });
      } else {
        fail(`${full}: unsupported file type`);
      }
    }
  };

  visit("");
  return files;
}

/** Produce a byte-for-byte deterministic `.tar.gz` with the files at the archive root. */
export async function packTarGz(files: SkillFile[]): Promise<Buffer> {
  const sorted = [...files].sort((a, b) => compare(a.path, b.path));
  const seen = new Set<string>();
  const entries: TarEntry[] = sorted.map((file) => {
    safeRelativePath(file.path, "archive path");
    if (Buffer.byteLength(file.path) > MAX_ARCHIVE_PATH_BYTES) {
      fail(`archive path ${JSON.stringify(file.path)} is longer than ${MAX_ARCHIVE_PATH_BYTES} bytes (the skills CLI reads ustar only)`);
    }
    if (seen.has(file.path)) fail(`duplicate archive path ${JSON.stringify(file.path)}`);
    seen.add(file.path);
    return {
      header: {
        name: file.path,
        size: file.data.length,
        mode: file.executable ? 0o755 : 0o644,
        mtime: new Date(0),
        uid: 0,
        gid: 0,
        uname: "",
        gname: "",
        type: "file",
      },
      body: file.data,
    };
  });

  const gz = gzipSync(await packTar(entries), { level: 9 });
  gz[9] = 3; // normalise the gzip OS byte so digests match across platforms
  return gz;
}

/** Read an untrusted `.tar.gz`. Rejects unsafe paths, links, special entries and oversized content. */
export async function readTarGz(bytes: Uint8Array, label: string): Promise<SkillFile[]> {
  let tar: Buffer;
  try {
    tar = gunzipSync(bytes, { maxOutputLength: MAX_ARCHIVE_BYTES + 4 * 1024 * 1024 });
  } catch (err) {
    return fail(`${label}: not a valid gzip stream or larger than ${MAX_ARCHIVE_BYTES} bytes unpacked (${(err as Error).message})`);
  }

  let entries;
  try {
    entries = await unpackTar(tar, { strict: true });
  } catch (err) {
    return fail(`${label}: invalid tar data (${(err as Error).message})`);
  }

  const files: SkillFile[] = [];
  const seen = new Set<string>();
  let total = 0;
  for (const { header, data } of entries) {
    const type = header.type ?? "file";
    if (type === "directory") continue;
    if (type !== "file") fail(`${label}: unsupported entry type "${type}" for ${JSON.stringify(header.name)}`);
    const path = safeRelativePath(header.name.replace(/^\.\//, ""), `${label} entry`);
    if (seen.has(path)) fail(`${label}: duplicate entry ${JSON.stringify(path)}`);
    seen.add(path);
    total += data?.length ?? 0;
    if (files.length >= MAX_ARCHIVE_FILES || total > MAX_ARCHIVE_BYTES) {
      fail(`${label}: more than ${MAX_ARCHIVE_FILES} files or ${MAX_ARCHIVE_BYTES} bytes`);
    }
    files.push({
      path,
      data: Buffer.from(data ?? new Uint8Array()),
      executable: ((header.mode ?? 0) & 0o111) !== 0,
    });
  }
  return files;
}
