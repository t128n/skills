import { describe, expect, test } from "bun:test";
import { gzipSync } from "node:zlib";
import { packTar } from "modern-tar";
import { isGzip, packTarGz, readTarGz, type SkillFile } from "#lib/archive.ts";
import { sha256 } from "#lib/utils.ts";

const file = (path: string, text = "x", executable = false): SkillFile => ({ path, data: Buffer.from(text), executable });

async function tarGz(entries: Array<{ name: string; type?: "file" | "symlink" | "directory"; body?: string; linkname?: string }>): Promise<Buffer> {
  const tar = await packTar(
    entries.map((e) => ({
      header: { name: e.name, size: e.body?.length ?? 0, type: e.type ?? "file", linkname: e.linkname },
      body: e.body ?? "",
    })),
  );
  return gzipSync(tar);
}

describe("deterministic archives", () => {
  test("same files give the same bytes, regardless of input order", async () => {
    const a = await packTarGz([file("SKILL.md", "a"), file("references/b.md", "b")]);
    const b = await packTarGz([file("references/b.md", "b"), file("SKILL.md", "a")]);
    expect(sha256(a)).toBe(sha256(b));
    expect(isGzip(a)).toBe(true);
  });

  test("normalises gzip header (OS byte, mtime)", async () => {
    const bytes = await packTarGz([file("SKILL.md")]);
    expect(bytes[9]).toBe(3);
    expect(bytes.subarray(4, 8).equals(Buffer.alloc(4))).toBe(true);
  });

  test("round trips content and executable bit", async () => {
    const bytes = await packTarGz([file("SKILL.md", "hello"), file("scripts/run.sh", "#!/bin/sh\n", true)]);
    const files = await readTarGz(bytes, "t");
    expect(files.map((f) => f.path)).toEqual(["SKILL.md", "scripts/run.sh"]);
    expect(files[0].data.toString()).toBe("hello");
    expect(files[1].executable).toBe(true);
    expect(files[0].executable).toBe(false);
  });

  test("the executable bit changes the digest", async () => {
    const a = await packTarGz([file("SKILL.md"), file("run.sh", "x", false)]);
    const b = await packTarGz([file("SKILL.md"), file("run.sh", "x", true)]);
    expect(sha256(a)).not.toBe(sha256(b));
  });

  test("rejects paths over 100 bytes (ustar limit of the skills CLI)", async () => {
    await expect(packTarGz([file("SKILL.md"), file(`${"d".repeat(60)}/${"f".repeat(60)}.md`)])).rejects.toThrow(/100 bytes/);
  });

  test.each(["../escape.md", "/abs.md", "a//b.md", "a\\b.md", "./x.md"])("rejects unsafe path %p when packing", async (path) => {
    await expect(packTarGz([file("SKILL.md"), file(path)])).rejects.toThrow(/unsafe/);
  });

  test("rejects duplicate paths", async () => {
    await expect(packTarGz([file("SKILL.md"), file("SKILL.md")])).rejects.toThrow(/duplicate/);
  });
});

describe("reading untrusted archives", () => {
  test("rejects path traversal entries", async () => {
    await expect(readTarGz(await tarGz([{ name: "../evil", body: "x" }]), "t")).rejects.toThrow(/unsafe/);
  });

  test("rejects symlink entries", async () => {
    await expect(readTarGz(await tarGz([{ name: "link", type: "symlink", linkname: "/etc/passwd" }]), "t")).rejects.toThrow(/unsupported entry type/);
  });

  test("rejects duplicate entries", async () => {
    await expect(readTarGz(await tarGz([{ name: "a", body: "1" }, { name: "a", body: "2" }]), "t")).rejects.toThrow(/duplicate/);
  });

  test("rejects data that is not gzip", async () => {
    await expect(readTarGz(Buffer.from("plain text"), "t")).rejects.toThrow(/gzip/);
  });

  test("skips directory entries", async () => {
    const files = await readTarGz(await tarGz([{ name: "dir/", type: "directory" }, { name: "dir/a.md", body: "a" }]), "t");
    expect(files.map((f) => f.path)).toEqual(["dir/a.md"]);
  });
});
