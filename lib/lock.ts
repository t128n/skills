import { DIGEST_RE } from "#lib/constants.ts";
import type { Lock } from "#lib/config.ts";
import { compare } from "#lib/utils.ts";

const LOCK_SCHEMA_PATH = "./schemas/skills.lock.schema.json";

export function serializeLock(lock: Lock): string {
  const sorted: Record<string, unknown> = { $schema: LOCK_SCHEMA_PATH };
  for (const key of Object.keys(lock).sort(compare)) sorted[key] = lock[key];
  return JSON.stringify(sorted, null, 2) + "\n";
}

export interface LockChange {
  key: string;
  from?: string;
  to?: string;
}

export interface LockDiff {
  added: LockChange[];
  removed: LockChange[];
  updated: LockChange[];
}

export function resolutionOf(lock: Lock, key: string): string | undefined {
  const entry = lock[key];
  if (!entry) return undefined;
  return "commit" in entry ? entry.commit : entry.digest;
}

export function diffLocks(before: Lock, after: Lock): LockDiff {
  const diff: LockDiff = { added: [], removed: [], updated: [] };
  for (const key of Object.keys(after).sort(compare)) {
    const from = resolutionOf(before, key);
    const to = resolutionOf(after, key);
    if (from === undefined) diff.added.push({ key, to });
    else if (from !== to) diff.updated.push({ key, from, to });
  }
  for (const key of Object.keys(before).sort(compare)) {
    if (!(key in after)) diff.removed.push({ key, from: resolutionOf(before, key) });
  }
  return diff;
}

export function digestHex(digest: string): string {
  if (!DIGEST_RE.test(digest)) throw new Error(`invalid digest ${JSON.stringify(digest)}`);
  return digest.slice("sha256:".length);
}
