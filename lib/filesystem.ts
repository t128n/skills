import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join } from "node:path";
import { digestHex } from "#lib/lock.ts";
import { fail, sha256 } from "#lib/utils.ts";

export function writeFileAtomic(path: string, data: string | Uint8Array): void {
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.tmp-${process.pid}`;
  try {
    writeFileSync(tmp, data);
    renameSync(tmp, path);
  } finally {
    rmSync(tmp, { force: true });
  }
}

// --- vendor store: approved bytes of website artifacts, addressed by digest ---

export function vendorFile(vendorDir: string, digest: string): string {
  return join(vendorDir, digestHex(digest));
}

export function hasVendored(vendorDir: string, digest: string): boolean {
  return existsSync(vendorFile(vendorDir, digest));
}

/** Read approved bytes and check them against their address. */
export function readVendored(vendorDir: string, digest: string): Buffer {
  const path = vendorFile(vendorDir, digest);
  if (!existsSync(path)) {
    fail(`vendored artifact ${digest} is missing (${path}). Run \`bun run skills:resolve\`.`);
  }
  const bytes = readFileSync(path);
  if (sha256(bytes) !== digest) fail(`${path} does not match its digest ${digest}; restore it from git`);
  return bytes;
}

export function writeVendored(vendorDir: string, digest: string, bytes: Buffer): void {
  if (sha256(bytes) !== digest) fail(`refusing to vendor bytes that do not match ${digest}`);
  const path = vendorFile(vendorDir, digest);
  if (!existsSync(path)) writeFileAtomic(path, bytes);
}

export function pruneVendored(vendorDir: string, keep: Set<string>): string[] {
  if (!existsSync(vendorDir)) return [];
  const removed: string[] = [];
  for (const name of readdirSync(vendorDir)) {
    if (!keep.has(name)) {
      rmSync(join(vendorDir, name), { recursive: true, force: true });
      removed.push(name);
    }
  }
  return removed;
}

// --- dist/: staged build, swap, recovery, lock ---

export function stagingDirFor(dist: string): string {
  return `${dist}.staging-${process.pid}`;
}

/**
 * Repair what a crash during a swap could leave behind. `dist` is only replaced by
 * two renames, so after a crash either `dist.old` holds the last good output
 * (restore it) or `dist` is already the new output (drop `dist.old`).
 */
export function recoverDist(dist: string): void {
  const old = `${dist}.old`;
  if (existsSync(old)) {
    if (existsSync(dist)) rmSync(old, { recursive: true, force: true });
    else renameSync(old, dist);
  }
  const parent = dirname(dist);
  const prefix = `${basename(dist)}.staging-`;
  for (const name of existsSync(parent) ? readdirSync(parent) : []) {
    if (name.startsWith(prefix) && !isAlive(Number(name.slice(prefix.length)))) {
      rmSync(join(parent, name), { recursive: true, force: true });
    }
  }
}

/** Replace `dist` by `staging`. The previous output is kept until the new one is in place. */
export function publishDir(staging: string, dist: string): void {
  const old = `${dist}.old`;
  rmSync(old, { recursive: true, force: true });
  const hadPrevious = existsSync(dist);
  if (hadPrevious) renameSync(dist, old);
  try {
    renameSync(staging, dist);
  } catch (err) {
    if (hadPrevious) renameSync(old, dist);
    throw err;
  }
  rmSync(old, { recursive: true, force: true });
}

function isAlive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return (err as NodeJS.ErrnoException).code === "EPERM";
  }
}

/** Exclusive build lock: `mkdir` is atomic, and a lock of a dead process is taken over. */
export function withDistLock<T>(dist: string, run: () => Promise<T>): Promise<T> {
  const lockDir = `${dist}.lock`;
  const pidFile = join(lockDir, "pid");

  const acquire = (): void => {
    try {
      mkdirSync(lockDir);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "EEXIST") throw err;
      const pid = Number(existsSync(pidFile) ? readFileSync(pidFile, "utf8") : NaN);
      if (isAlive(pid)) fail(`another build (pid ${pid}) is running; lock directory ${lockDir}`);
      rmSync(lockDir, { recursive: true, force: true });
      mkdirSync(lockDir);
    }
    writeFileSync(pidFile, String(process.pid));
  };

  acquire();
  return run().finally(() => rmSync(lockDir, { recursive: true, force: true }));
}
