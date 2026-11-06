import { lstatSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { packTar, type TarEntry } from "modern-tar";

/**
 * Produces a byte-for-byte deterministic `.tar.gz` archive with files at the archive root.
 */
export async function packTarGz(dir: string, files: string[]): Promise<Buffer> {
  const entries: TarEntry[] = [];

  for (const file of files) {
    const full = join(dir, file);
    const data = readFileSync(full);
    const mode = lstatSync(full).mode & 0o111 ? 0o755 : 0o644;
    entries.push({
      header: {
        name: file,
        size: data.length,
        mode,
        mtime: new Date(0),
        uid: 0,
        gid: 0,
        uname: "",
        gname: "",
        type: "file",
      },
      body: data,
    });
  }

  const tarBytes = await packTar(entries);
  const gz = gzipSync(tarBytes, { level: 9 });
  gz[9] = 3; // normalise the gzip OS byte so digests match across platforms
  return gz;
}
