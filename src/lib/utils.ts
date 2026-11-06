import { createHash, type BinaryLike } from "node:crypto";
import { mkdtempDisposableSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, posix as posixPath, resolve, sep } from "node:path";

export function sha256(buf: BinaryLike): string {
  return "sha256:" + createHash("sha256").update(buf).digest("hex");
}

export function posix(p: string): string {
  return posixPath.normalize(p.replace(/\\/g, "/"));
}

export function fail(msg: string): never {
  throw new Error(msg);
}

export function assertContainedPath(baseDir: string, relativePath: string): string {
  const root = resolve(baseDir);
  const target = resolve(root, relativePath);
  if (target !== root && !target.startsWith(root + sep)) {
    fail(`unsafe path "${relativePath}" outside "${baseDir}"`);
  }
  return target;
}

export class TempDirManager {
  private readonly disposables: Array<{ path: string; [Symbol.dispose](): void }> = [];

  create(prefix = "skills-build-"): string {
    const disposable = mkdtempDisposableSync(join(tmpdir(), prefix));
    this.disposables.push(disposable);
    return disposable.path;
  }

  cleanup(): void {
    for (const d of this.disposables) {
      d[Symbol.dispose]();
    }
    this.disposables.length = 0;
  }

  [Symbol.dispose](): void {
    this.cleanup();
  }
}
