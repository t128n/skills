import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { readTarGz } from "#lib/archive.ts";
import { build } from "#lib/build.ts";
import { DISCOVERY_SCHEMA, type Paths } from "#lib/constants.ts";
import { createContext, type Context } from "#lib/context.ts";
import { recoverDist } from "#lib/filesystem.ts";
import { DEFAULT_HTTP } from "#lib/http.ts";
import { updateLock } from "#lib/update.ts";
import { sha256 } from "#lib/utils.ts";
import { verifyDeployed, verifyDist } from "#lib/verify.ts";
import { cleanupAll, FAST_HTTP, git, GitHost, makeProject, muteConsole, skillMd, stubFetch, tempDir } from "./helpers.ts";

let unmute: () => void;
const contexts: Context[] = [];

beforeEach(() => {
  unmute = muteConsole();
});

afterEach(() => {
  unmute();
  while (contexts.length > 0) contexts.pop()!.tmp.cleanup();
  cleanupAll();
});

function gitContext(host: GitHost): Context {
  const ctx = host.context();
  Object.assign(ctx.http, FAST_HTTP);
  contexts.push(ctx);
  return ctx;
}

function httpContext(): Context {
  const ctx = createContext({ http: FAST_HTTP });
  contexts.push(ctx);
  return ctx;
}

const readLock = (paths: Paths) => JSON.parse(readFileSync(paths.lock, "utf8"));
const readIndex = (paths: Paths) => JSON.parse(readFileSync(join(paths.outDir, "index.json"), "utf8"));
const entryOf = (paths: Paths, name: string) => readIndex(paths).skills.find((s: { name: string }) => s.name === name);

const githubConfig = (...deps: object[]) => ({ external: deps });

describe("GitHub sources", () => {
  test("resolve pins commits, build is reproducible and verifiable", async () => {
    const host = new GitHost();
    const sha = host.commit(
      "o/r",
      {
        "skills/alpha/SKILL.md": skillMd("alpha"),
        "skills/alpha/references/guide.md": "guide\n",
        "skills/alpha/scripts/run.sh": "#!/bin/sh\necho hi\n",
        "skills/solo/SKILL.md": skillMd("solo"),
      },
      { executable: ["skills/alpha/scripts/run.sh"] },
    );
    const { paths } = makeProject({
      config: githubConfig({ source: "o/r", skill: "alpha" }, { source: "o/r", skill: "solo" }),
      skills: { "own/SKILL.md": skillMd("own"), "own/extra.md": "extra\n" },
    });
    const ctx = gitContext(host);

    await updateLock(paths, ctx, "resolve");
    expect(readLock(paths)["o/r#alpha"]).toEqual({ commit: sha });

    await build(paths, ctx);
    expect(await verifyDist(paths.dist)).toEqual([]);
    const first = readFileSync(join(paths.outDir, "index.json"));
    const archive = readFileSync(join(paths.outDir, "alpha.tar.gz"));

    expect(entryOf(paths, "alpha").type).toBe("archive");
    expect(entryOf(paths, "alpha").description).toContain(`[source: https://github.com/o/r/tree/${sha}/skills/alpha]`);
    expect(entryOf(paths, "solo").type).toBe("skill-md");
    expect(entryOf(paths, "solo").description).not.toContain("[source:");
    const files = await readTarGz(archive, "alpha");
    expect(files.find((f) => f.path === "scripts/run.sh")?.executable).toBe(true);
    expect(files.find((f) => f.path === "SKILL.md")?.executable).toBe(false);

    await build(paths, ctx);
    expect(readFileSync(join(paths.outDir, "index.json")).equals(first)).toBe(true);
    expect(readFileSync(join(paths.outDir, "alpha.tar.gz")).equals(archive)).toBe(true);
  });

  test("build uses the locked commit and never writes the lock; update moves it", async () => {
    const host = new GitHost();
    const sha1 = host.commit("o/r", { "alpha/SKILL.md": skillMd("alpha"), "alpha/a.md": "v1\n" });
    const { paths } = makeProject({ config: githubConfig({ source: "o/r", skill: "alpha" }) });
    const ctx = gitContext(host);

    await updateLock(paths, ctx, "resolve");
    await build(paths, ctx);
    const digest1 = entryOf(paths, "alpha").digest;
    const lockText = readFileSync(paths.lock, "utf8");

    const sha2 = host.commit("o/r", { "alpha/a.md": "v2\n", "alpha/scripts/new.sh": "#!/bin/sh\n" });
    await build(paths, ctx);
    expect(entryOf(paths, "alpha").digest).toBe(digest1);
    expect(readFileSync(paths.lock, "utf8")).toBe(lockText);

    await updateLock(paths, ctx, "resolve");
    expect(readLock(paths)["o/r#alpha"].commit).toBe(sha1);

    const summary = await updateLock(paths, ctx, "update");
    expect(readLock(paths)["o/r#alpha"].commit).toBe(sha2);
    expect(summary).toContain(`compare/${sha1}...${sha2}`);
    expect(summary).toContain("added `scripts/new.sh`");
    expect(summary).toContain("(script or executable)");
    expect(summary).toContain("modified `a.md`");

    await build(paths, ctx);
    expect(entryOf(paths, "alpha").digest).not.toBe(digest1);
  });

  test("a failed resolve leaves the lockfile and vendor store untouched", async () => {
    const host = new GitHost();
    host.commit("o/r", { "alpha/SKILL.md": skillMd("alpha") });
    const { paths } = makeProject({ config: githubConfig({ source: "o/r", skill: "alpha" }) });
    const ctx = gitContext(host);
    await updateLock(paths, ctx, "resolve");
    const before = readFileSync(paths.lock, "utf8");

    writeFileSync(paths.config, JSON.stringify(githubConfig({ source: "o/r", skill: "alpha" }, { source: "o/missing", skill: "nope" })));
    await expect(updateLock(paths, ctx, "resolve")).rejects.toThrow();
    expect(readFileSync(paths.lock, "utf8")).toBe(before);

    writeFileSync(paths.config, JSON.stringify(githubConfig({ source: "o/r", skill: "not-there" })));
    await expect(updateLock(paths, ctx, "update")).rejects.toThrow(/not found/);
    expect(readFileSync(paths.lock, "utf8")).toBe(before);
  });

  test("build fails with a clear message when the lock is missing or stale", async () => {
    const host = new GitHost();
    const sha = host.commit("o/r", { "alpha/SKILL.md": skillMd("alpha") });
    const ctx = gitContext(host);

    const missing = makeProject({ config: githubConfig({ source: "o/r", skill: "alpha" }) });
    await expect(build(missing.paths, ctx)).rejects.toThrow(/missing: o\/r#alpha[\s\S]*skills:resolve/);
    expect(existsSync(missing.paths.lock)).toBe(false);
    expect(existsSync(missing.paths.dist)).toBe(false);

    const stale = makeProject({ config: githubConfig(), lock: { "o/r#alpha": { commit: sha } } });
    await expect(build(stale.paths, ctx)).rejects.toThrow(/stale: o\/r#alpha/);
  });

  test("resolve drops stale lock entries", async () => {
    const host = new GitHost();
    const sha = host.commit("o/r", { "alpha/SKILL.md": skillMd("alpha") });
    const { paths } = makeProject({ config: githubConfig(), lock: { "o/r#alpha": { commit: sha } } });
    const summary = await updateLock(paths, gitContext(host), "resolve");
    expect(readLock(paths)["o/r#alpha"]).toBeUndefined();
    expect(summary).toContain("removed");
  });

  test("honours ref, path and as", async () => {
    const host = new GitHost();
    host.commit("o/r", { "one/SKILL.md": skillMd("dup", "first"), "two/SKILL.md": skillMd("dup", "second") });
    const dir = join(host.base, "o/r");
    git(dir, "branch", "release");
    const { paths } = makeProject({
      config: githubConfig({ source: "o/r", skill: "dup", path: "two", ref: "release", as: "renamed" }),
    });
    const ctx = gitContext(host);
    await updateLock(paths, ctx, "resolve");
    await build(paths, ctx);
    expect(entryOf(paths, "renamed").description).toBe("second");
    expect(entryOf(paths, "dup")).toBeUndefined();
  });

  test("an ambiguous skill name needs an explicit path", async () => {
    const host = new GitHost();
    host.commit("o/r", { "one/SKILL.md": skillMd("dup"), "two/SKILL.md": skillMd("dup") });
    const { paths } = makeProject({ config: githubConfig({ source: "o/r", skill: "dup" }) });
    const ctx = gitContext(host);
    await expect(updateLock(paths, ctx, "resolve")).rejects.toThrow(/ambiguous/);
    expect(existsSync(paths.lock)).toBe(false);
  });

  test("rejects symlinks inside a skill", async () => {
    const host = new GitHost();
    host.commit("o/r", { "alpha/SKILL.md": skillMd("alpha"), "target.txt": "/etc/passwd" });
    const dir = join(host.base, "o/r");
    const blob = git(dir, "hash-object", "-w", "target.txt");
    git(dir, "update-index", "--add", "--cacheinfo", `120000,${blob},alpha/link`);
    git(dir, "commit", "-q", "-m", "add symlink");
    const { paths } = makeProject({ config: githubConfig({ source: "o/r", skill: "alpha" }) });
    await expect(updateLock(paths, gitContext(host), "resolve")).rejects.toThrow(/symlink/);
  });

  test("rejects a skill whose frontmatter name differs from the configured name", async () => {
    const host = new GitHost();
    host.commit("o/r", { "alpha/SKILL.md": skillMd("other") });
    const { paths } = makeProject({ config: githubConfig({ source: "o/r", skill: "alpha", path: "alpha" }) });
    await expect(updateLock(paths, gitContext(host), "resolve")).rejects.toThrow(/named "other", not "alpha"/);
  });
});

describe("website sources", () => {
  const base = "https://example.test";
  const dir = `${base}/.well-known/agent-skills`;
  const config = { external: [{ site: base, skill: "remote" }] };

  function v02Site(text: string) {
    const bytes = Buffer.from(text);
    return {
      [`${dir}/index.json`]: JSON.stringify({
        $schema: DISCOVERY_SCHEMA,
        skills: [{ name: "remote", type: "skill-md", description: "Remote skill.", url: "remote/SKILL.md", digest: sha256(bytes) }],
      }),
      [`${dir}/remote/SKILL.md`]: bytes,
    };
  }

  test("resolve vendors approved bytes; build works offline", async () => {
    const text = skillMd("remote", "Remote skill.");
    const stub = stubFetch(v02Site(text));
    const { paths } = makeProject({ config });
    const ctx = httpContext();
    try {
      await updateLock(paths, ctx, "resolve");
      const digest = sha256(text);
      expect(readLock(paths)[`${base}#remote`]).toEqual({ digest });
      expect(existsSync(join(paths.vendor, digest.slice(7)))).toBe(true);
    } finally {
      stub.restore();
    }

    const offline = stubFetch({});
    try {
      await build(paths, ctx);
      expect(offline.requests).toEqual([]);
    } finally {
      offline.restore();
    }
    expect(readFileSync(join(paths.outDir, "remote/SKILL.md"), "utf8")).toBe(text);
  });

  test("a changed upstream is not picked up by resolve or build, only by update", async () => {
    const v1 = skillMd("remote", "Remote skill.", "one\n");
    const v2 = skillMd("remote", "Remote skill.", "two\n");
    const { paths } = makeProject({ config });
    const ctx = httpContext();

    let stub = stubFetch(v02Site(v1));
    await updateLock(paths, ctx, "resolve");
    stub.restore();

    stub = stubFetch(v02Site(v2));
    try {
      await updateLock(paths, ctx, "resolve");
      expect(stub.requests).toEqual([]);
      await build(paths, ctx);
      expect(readFileSync(join(paths.outDir, "remote/SKILL.md"), "utf8")).toBe(v1);

      const summary = await updateLock(paths, ctx, "update");
      expect(readLock(paths)[`${base}#remote`].digest).toBe(sha256(v2));
      expect(summary).toContain("updated");
      // The old artifact is pruned once nothing references it.
      expect(readdirSync(paths.vendor)).toEqual([sha256(v2).slice(7)]);
    } finally {
      stub.restore();
    }
  });

  test("rejects an artifact whose bytes do not match the index digest", async () => {
    const routes = v02Site(skillMd("remote"));
    routes[`${dir}/remote/SKILL.md`] = Buffer.from(skillMd("remote", "tampered"));
    const stub = stubFetch(routes);
    try {
      const { paths } = makeProject({ config });
      await expect(updateLock(paths, httpContext(), "resolve")).rejects.toThrow(/does not match the index/);
      expect(existsSync(paths.lock)).toBe(false);
    } finally {
      stub.restore();
    }
  });

  test("fails when an approved artifact is missing from the vendor store and upstream changed", async () => {
    const v1 = skillMd("remote", "Remote skill.", "one\n");
    const { paths } = makeProject({ config, lock: { [`${base}#remote`]: { digest: sha256(v1) } } });
    const stub = stubFetch(v02Site(skillMd("remote", "Remote skill.", "two\n")));
    try {
      await expect(updateLock(paths, httpContext(), "resolve")).rejects.toThrow(/upstream content changed/);
      await expect(build(paths, httpContext())).rejects.toThrow(/vendored artifact .* is missing/);
    } finally {
      stub.restore();
    }
  });

  test("detects a vendored file that was modified", async () => {
    const text = skillMd("remote");
    const stub = stubFetch(v02Site(text));
    const { paths } = makeProject({ config });
    const ctx = httpContext();
    try {
      await updateLock(paths, ctx, "resolve");
    } finally {
      stub.restore();
    }
    writeFileSync(join(paths.vendor, sha256(text).slice(7)), "tampered");
    await expect(build(paths, ctx)).rejects.toThrow(/does not match its digest/);
  });

  test("legacy v0.1.0 sites are packed deterministically and vendored", async () => {
    const routes = {
      [`${dir}/index.json`]: JSON.stringify({ skills: [{ name: "remote", description: "x", files: ["SKILL.md", "references/a.md"] }] }),
      [`${dir}/remote/SKILL.md`]: skillMd("remote"),
      [`${dir}/remote/references/a.md`]: "a\n",
    };
    const stub = stubFetch(routes);
    const { paths } = makeProject({ config });
    const ctx = httpContext();
    try {
      await updateLock(paths, ctx, "resolve");
      const first = readLock(paths)[`${base}#remote`].digest;
      await updateLock(paths, ctx, "update");
      expect(readLock(paths)[`${base}#remote`].digest).toBe(first);
      await build(paths, ctx);
      expect(entryOf(paths, "remote").type).toBe("archive");
      expect(entryOf(paths, "remote").description).toContain(`[source: ${base}]`);
      expect(await verifyDist(paths.dist)).toEqual([]);
    } finally {
      stub.restore();
    }
  });

  test.each(["../escape.md", "/abs.md", "a//b.md"])("legacy index with unsafe file %p is rejected", async (file) => {
    const stub = stubFetch({
      [`${dir}/index.json`]: JSON.stringify({ skills: [{ name: "remote", description: "x", files: ["SKILL.md", file] }] }),
    });
    try {
      const { paths } = makeProject({ config });
      await expect(updateLock(paths, httpContext(), "resolve")).rejects.toThrow(/unsafe/);
    } finally {
      stub.restore();
    }
  });
});

describe("dist output", () => {
  const twoSkills = {
    "multi/SKILL.md": skillMd("multi"),
    "multi/ref.md": "ref\n",
    "single/SKILL.md": skillMd("single"),
  };

  test("a failed build keeps the previous dist and leaves no scratch directories", async () => {
    const { root, paths } = makeProject({ skills: twoSkills });
    const ctx = httpContext();
    await build(paths, ctx);
    const index = readFileSync(join(paths.outDir, "index.json"));

    writeFileSync(join(paths.skillsDir, "single/SKILL.md"), "no frontmatter");
    await expect(build(paths, ctx)).rejects.toThrow(/frontmatter/);

    expect(readFileSync(join(paths.outDir, "index.json")).equals(index)).toBe(true);
    expect(readdirSync(root).filter((n) => n.startsWith("dist")).sort()).toEqual(["dist"]);
  });

  test("a local skill directory must match its frontmatter name", async () => {
    const { paths } = makeProject({ skills: { "folder/SKILL.md": skillMd("different") } });
    await expect(build(paths, httpContext())).rejects.toThrow(/differs from/);
  });

  test("recoverDist restores or cleans up after a crashed swap", () => {
    const root = tempDir();
    const dist = join(root, "dist");

    mkdirSync(`${dist}.old`);
    writeFileSync(join(`${dist}.old`, "marker"), "old");
    recoverDist(dist);
    expect(readFileSync(join(dist, "marker"), "utf8")).toBe("old");
    expect(existsSync(`${dist}.old`)).toBe(false);

    mkdirSync(`${dist}.old`);
    mkdirSync(`${dist}.staging-99999999`);
    recoverDist(dist);
    expect(existsSync(`${dist}.old`)).toBe(false);
    expect(existsSync(`${dist}.staging-99999999`)).toBe(false);
    expect(existsSync(dist)).toBe(true);
  });

  test("a lock of a dead process is taken over, a live one blocks the build", async () => {
    const { paths } = makeProject({ skills: twoSkills });
    const ctx = httpContext();
    const lockDir = `${paths.dist}.lock`;

    mkdirSync(lockDir);
    writeFileSync(join(lockDir, "pid"), "99999999");
    await build(paths, ctx);
    expect(existsSync(lockDir)).toBe(false);

    mkdirSync(lockDir);
    writeFileSync(join(lockDir, "pid"), String(process.pid));
    await expect(build(paths, ctx)).rejects.toThrow(/another build/);
    expect(existsSync(lockDir)).toBe(true);
  });

  test("builds are byte-identical across runs", async () => {
    const { paths } = makeProject({ skills: twoSkills });
    const ctx = httpContext();
    await build(paths, ctx);
    const a = readFileSync(join(paths.outDir, "multi.tar.gz"));
    await build(paths, ctx);
    expect(readFileSync(join(paths.outDir, "multi.tar.gz")).equals(a)).toBe(true);
  });
});

describe("verify", () => {
  const skills = { "multi/SKILL.md": skillMd("multi"), "multi/ref.md": "ref\n", "single/SKILL.md": skillMd("single") };

  async function built() {
    const project = makeProject({ skills });
    await build(project.paths, httpContext());
    return project.paths;
  }

  test("passes for a fresh build", async () => {
    expect(await verifyDist((await built()).dist)).toEqual([]);
  });

  test("detects a corrupted byte", async () => {
    const paths = await built();
    const file = join(paths.outDir, "multi.tar.gz");
    const bytes = readFileSync(file);
    bytes[bytes.length - 12] ^= 0xff;
    writeFileSync(file, bytes);
    expect((await verifyDist(paths.dist)).join("\n")).toMatch(/digest does not match/);
  });

  test("detects a missing artifact, a missing .nojekyll and an unsorted index", async () => {
    const paths = await built();
    const indexFile = join(paths.outDir, "index.json");
    const index = readIndex(paths);
    writeFileSync(indexFile, JSON.stringify({ ...index, skills: [...index.skills].reverse() }));
    writeFileSync(join(paths.outDir, "single/SKILL.md"), "changed");
    const problems = (await verifyDist(paths.dist)).join("\n");
    expect(problems).toMatch(/not sorted/);

    const gone = await built();
    expect(existsSync(join(gone.dist, ".nojekyll"))).toBe(true);
    writeFileSync(join(gone.outDir, "multi.tar.gz"), "");
    expect((await verifyDist(gone.dist)).join("\n")).toMatch(/multi/);
  });

  test("verifyDeployed checks status, content types and digests over HTTP", async () => {
    const paths = await built();
    const types: Record<string, string> = { ".json": "application/json", ".md": "text/markdown", ".gz": "application/gzip" };
    let tamper = false;
    const server = Bun.serve({
      port: 0,
      fetch(req) {
        const path = decodeURIComponent(new URL(req.url).pathname);
        const file = join(paths.dist, path);
        if (path.includes("..") || !existsSync(file) || path.endsWith("/")) return new Response("nf", { status: 404 });
        const ext = path.slice(path.lastIndexOf("."));
        let body: Buffer = readFileSync(file);
        if (tamper && path.endsWith("multi.tar.gz")) body = Buffer.concat([body, Buffer.from("x")]);
        return new Response(body, { headers: { "content-type": types[ext] ?? "text/plain" } });
      },
    });
    try {
      const url = `http://127.0.0.1:${server.port}/`;
      expect(await verifyDeployed(url)).toEqual([]);
      tamper = true;
      expect((await verifyDeployed(url)).join("\n")).toMatch(/digest does not match/);
      expect((await verifyDeployed("http://example.com/")).join("\n")).toMatch(/https/);
    } finally {
      await server.stop(true);
    }
  });

  test("rejects an index entry whose url leaves the site", async () => {
    const paths = await built();
    const index = readIndex(paths);
    index.skills[0].url = "../outside.tar.gz";
    writeFileSync(join(paths.outDir, "index.json"), JSON.stringify(index));
    expect((await verifyDist(paths.dist)).join("\n")).toMatch(/url/);
  });
});

describe("http client", () => {
  const opts = { ...DEFAULT_HTTP, ...FAST_HTTP };

  test("retries transient errors but not client errors", async () => {
    const { fetchBytes } = await import("#lib/http.ts");
    let calls = 0;
    const stub = stubFetch({
      "https://e.test/flaky": () => (++calls === 1 ? new Response("x", { status: 503 }) : new Response("ok")),
      "https://e.test/gone": () => new Response("x", { status: 404 }),
    });
    try {
      expect((await fetchBytes("https://e.test/flaky", opts)).toString()).toBe("ok");
      expect(calls).toBe(2);
      await expect(fetchBytes("https://e.test/gone", opts)).rejects.toThrow(/404/);
      expect(stub.requests.filter((u) => u.endsWith("/gone"))).toHaveLength(1);
    } finally {
      stub.restore();
    }
  });

  test("rejects http URLs, http redirects and oversized bodies", async () => {
    const { fetchBytes } = await import("#lib/http.ts");
    const stub = stubFetch({
      "https://e.test/redirect": () => new Response(null, { status: 302, headers: { location: "http://e.test/plain" } }),
      "https://e.test/hop": () => new Response(null, { status: 302, headers: { location: "/final" } }),
      "https://e.test/final": "done",
      "https://e.test/big": "x".repeat(100),
    });
    try {
      await expect(fetchBytes("http://e.test/plain", opts)).rejects.toThrow(/only https/);
      await expect(fetchBytes("https://e.test/redirect", opts)).rejects.toThrow(/only https/);
      expect((await fetchBytes("https://e.test/hop", opts)).toString()).toBe("done");
      await expect(fetchBytes("https://e.test/big", opts, 10)).rejects.toThrow(/bytes/);
    } finally {
      stub.restore();
    }
  });
});
