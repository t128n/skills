import { createHash, type BinaryLike } from "node:crypto";
import { mkdtempDisposableSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function sha256(buf: BinaryLike): string {
  return "sha256:" + createHash("sha256").update(buf).digest("hex");
}

export function fail(msg: string): never {
  throw new Error(msg);
}

export function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Check a relative path from untrusted input (archive entry, legacy file list, config).
 * Returns the path unchanged when it is a normal POSIX relative path.
 */
export function safeRelativePath(path: string, label = "path"): string {
  const bad = (why: string): never => fail(`unsafe ${label} ${JSON.stringify(path)}: ${why}`);
  if (path === "") bad("empty");
  if (path.includes("\\")) bad("backslash");
  if (path.includes("\0")) bad("NUL byte");
  if (path.startsWith("/") || /^[a-zA-Z]:/.test(path)) bad("absolute");
  for (const segment of path.split("/")) {
    if (segment === "" || segment === "." || segment === "..") bad("empty, '.' or '..' segment");
  }
  return path;
}

export class TempDirManager {
  private readonly disposables: Array<{ path: string; [Symbol.dispose](): void }> = [];

  create(prefix = "skills-build-"): string {
    const disposable = mkdtempDisposableSync(join(tmpdir(), prefix));
    this.disposables.push(disposable);
    return disposable.path;
  }

  cleanup(): void {
    for (const d of this.disposables) d[Symbol.dispose]();
    this.disposables.length = 0;
  }

  [Symbol.dispose](): void {
    this.cleanup();
  }
}
