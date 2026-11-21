---
name: setup-dream
description: One-time setup for the dream skill. Picks the transcript source (OpenCode v2 by default) and the wiki (plain wiki/ dir by default), then writes docs/agents/dream.md, the extractor script and a pointer block in AGENTS.md/CLAUDE.md. Run only when the user invokes it.
---

# Setup Dream

Scaffold the per-repo configuration that the `dream` skill reads. Run once, then again only to switch harness or wiki.

This is a user-invoked skill. Do not run it on your own. Never edit the `dream` skill's own files: everything you write goes into the repo (`docs/agents/`, `wiki/`, the pointer block).

## Process

### 1. Look first, silently

- Does `docs/agents/dream.md` already exist? If so, show it and ask what to change instead of starting over.
- Is an `opencode` binary on PATH, or does `opencode debug paths db` print an existing file? Is there a `wiki/` directory?
- Which of `AGENTS.md` / `CLAUDE.md` exist at the repo root?
- Are wiki-capable MCP tools in this session (list/read/search/write pages)? Note their exact names.

### 2. Ask, one question at a time, with a recommended default

1. **Transcript source**
   - `opencode-v2` (default): read OpenCode v2's SQLite database through the extractor in step 4. Needs no running server.
   - `command`: any command that prints the JSONL contract described in the `dream` skill. Ask for the command. Offer to help write the extractor if the harness stores sessions locally.
2. **Wiki**
   - `dir` (default): a plain `wiki/` directory of markdown pages with `[[links]]` and an `index.md`. Ask for the path if not `wiki/`.
   - `mcp`: a wiki behind MCP tools (for example an Orbit vault). Ask which tools list, read, search and write pages. Ask whether the server can back up or undo, and whether it can write several pages atomically. Record the answers as capability flags.
3. **Scope**: only sessions whose directory is inside this repo (default), or every project on this machine.
4. **Goal**: one or two sentences on what future sessions should know from past ones. State a purpose, not a procedure. Example: "Keep track of who owns which service, decisions and why they were made, and what broke before."

### 3. Show the draft config, let the user edit, then write

Write `docs/agents/dream.md` using this template, filled in from the answers. Show it first and apply the user's edits before saving.

```markdown
# Dream configuration

Read by the `dream` skill. Edit freely. Re-run /setup-dream only to switch harness or wiki.

## Goal
<purpose, 1-2 sentences>

## Transcript source
- kind: opencode-v2 | command
- command: python3 docs/agents/dream/extract-opencode.py --since {since} --directory {repo_root} --limit 50
- since format: epoch milliseconds; `{since}` is replaced with the watermark (0 on first run)

## Wiki
- kind: dir | mcp
- path: wiki/
- index: wiki/index.md
- mcp_tools: list=<tool>, read=<tool>, search=<tool>, write=<tool>   # kind=mcp only
- can_backup: true
- can_search: true
- can_bulk_write: true
- backup_dir: wiki/.dream/backups/
- watermark: wiki/.dream/watermark
- log: wiki/.dream/log.md

## Limits
- max_sessions_per_run: 50
```

For `kind: dir`, set the three `can_*` flags to true. For `kind: mcp`, use the answers from step 2. When `can_backup` is false, `dream` writes proposals instead of editing pages. If the scope is every project, drop `--directory {repo_root}` from the command.

### 4. Write the extractor (opencode-v2 only)

Save this to `docs/agents/dream/extract-opencode.py`, exactly as shown. It opens the database read-only, drops tool output (about 80% of the bytes), keeps tool names, short input summaries and error text, and redacts common secret patterns.

```python
#!/usr/bin/env python3
"""Read-only OpenCode v2 transcript extractor for /dream.

Prints one JSON object per session (JSONL) for sessions updated after --since.
Never writes to the database. Tool output is dropped; tool name, a short input
summary and error text are kept. Secrets are redacted.
"""
import argparse, datetime, json, os, re, sqlite3, subprocess, sys

REQUIRED = {
    "session_v2": {"id", "parent_id", "directory", "title", "time_created", "time_updated", "project_id"},
    "session_message": {"id", "session_id", "type", "seq", "time_created", "data"},
}

SECRETS = [
    (re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----.*?-----END [A-Z ]*PRIVATE KEY-----", re.S), "[REDACTED:private-key]"),
    (re.compile(r"\b(?:sk|pk|rk)-[A-Za-z0-9_\-]{16,}"), "[REDACTED:key]"),
    (re.compile(r"\bgh[pousr]_[A-Za-z0-9]{20,}"), "[REDACTED:github-token]"),
    (re.compile(r"\bAKIA[0-9A-Z]{16}\b"), "[REDACTED:aws-key]"),
    (re.compile(r"(?i)\bbearer\s+[A-Za-z0-9._\-]{20,}"), "Bearer [REDACTED]"),
    (re.compile(r"(?i)\b((?:api[_-]?key|secret|token|passw(?:or)?d)[\"']?\s*[:=]\s*[\"']?)[^\s\"',;]{8,}"), r"\1[REDACTED]"),
]

def redact(s):
    for pat, rep in SECRETS:
        s = pat.sub(rep, s)
    return s

def clip(s, n):
    s = redact(s or "")
    if len(s) <= n:
        return s
    h = n // 2
    return f"{s[:h]}\n[...{len(s) - n} chars cut...]\n{s[-h:]}"

def find_db(arg):
    if arg:
        return arg
    if os.environ.get("OPENCODE_DB"):
        return os.environ["OPENCODE_DB"]
    try:
        out = subprocess.run(["opencode", "debug", "paths", "db"], capture_output=True, text=True, timeout=15)
        p = out.stdout.strip()
        if out.returncode == 0 and p and os.path.exists(p):
            return p
    except Exception:
        pass
    return os.path.expanduser("~/.local/share/opencode/opencode.db")

def parse_since(v):
    if v in (None, "", "0"):
        return 0
    if v.isdigit():
        return int(v)
    return int(datetime.datetime.fromisoformat(v).timestamp() * 1000)

def check_schema(c):
    have = {r[0] for r in c.execute("select name from sqlite_master where type='table'")}
    for t, cols in REQUIRED.items():
        if t not in have:
            sys.exit(f"dream-extract: table {t} missing. This is not the OpenCode v2 schema. "
                     "Use another transcript source (see docs/agents/dream.md).")
        got = {r[1] for r in c.execute(f"pragma table_info({t})")}
        if cols - got:
            sys.exit(f"dream-extract: {t} lacks columns {sorted(cols - got)}. Schema changed; update this script.")

def short_input(inp, n=160):
    if not isinstance(inp, dict):
        return clip(str(inp), n)
    parts = []
    for k, v in inp.items():
        if isinstance(v, str):
            parts.append(f"{k}={v!r}" if len(v) <= 80 else f"{k}=<{len(v)} chars>")
        elif isinstance(v, (int, float, bool)) or v is None:
            parts.append(f"{k}={v}")
        else:
            parts.append(f"{k}=<{type(v).__name__}>")
    return clip(", ".join(parts), n)

def turns_for(c, sid, a):
    rows = c.execute(
        "select type, seq, time_created, data from session_message "
        "where session_id=? and type in ('user','assistant','compaction','idle') order by seq", (sid,))
    turns = []
    for typ, seq, t, raw in rows:
        try:
            d = json.loads(raw)
        except Exception:
            continue
        if typ == "user":
            turns.append({"seq": seq, "t": t, "role": "user", "text": clip(d.get("text"), a.max_text)})
        elif typ == "compaction":
            turns.append({"seq": seq, "t": t, "role": "compaction", "reason": d.get("reason"),
                          "text": clip(d.get("summary"), a.max_text * 2)})
        elif typ == "idle":
            if d.get("outcome") and d["outcome"] != "succeeded":
                turns.append({"seq": seq, "t": t, "role": "idle", "outcome": d["outcome"]})
        else:
            texts, tools, reasoning = [], [], []
            for b in d.get("content", []):
                bt = b.get("type")
                if bt == "text":
                    texts.append(b.get("text", ""))
                elif bt == "reasoning" and a.include_reasoning:
                    reasoning.append(b.get("text", ""))
                elif bt == "tool":
                    s = b.get("state", {})
                    tool = {"name": b.get("name"), "status": s.get("status"), "input": short_input(s.get("input"))}
                    if s.get("status") == "error":
                        e = s.get("error")
                        tool["error"] = clip(e.get("message") if isinstance(e, dict) else str(e), 300)
                    tools.append(tool)
            if not texts and not tools:
                continue
            turn = {"seq": seq, "t": t, "role": "assistant", "text": clip("\n".join(texts), a.max_text)}
            if tools:
                turn["tools"] = tools
            if reasoning:
                turn["reasoning"] = clip("\n".join(reasoning), a.max_text)
            if d.get("finish") == "error":
                turn["finish"] = "error"
            turns.append(turn)
    return turns

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--db")
    p.add_argument("--since", help="epoch ms or ISO date; only sessions updated after it")
    p.add_argument("--limit", type=int, default=50, help="max sessions per run (oldest first)")
    p.add_argument("--directory", help="only sessions whose directory starts with this path")
    p.add_argument("--max-text", type=int, default=4000)
    p.add_argument("--include-reasoning", action="store_true")
    p.add_argument("--stats", action="store_true", help="print counts only, no transcript content")
    a = p.parse_args()

    path = find_db(a.db)
    if not os.path.exists(path):
        sys.exit(f"dream-extract: database not found at {path}")
    c = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
    c.execute("pragma query_only=1")
    check_schema(c)

    q = ("select id, parent_id, project_id, directory, title, agent, time_created, time_updated "
         "from session_v2 where time_updated > ?")
    args = [parse_since(a.since)]
    if a.directory:
        q += " and directory like ?"
        args.append(a.directory.rstrip("/") + "%")
    q += " order by time_updated asc limit ?"
    args.append(a.limit)

    nsess = nturns = nbytes = 0
    for sid, parent, proj, directory, title, agent, tc, tu in c.execute(q, args).fetchall():
        turns = turns_for(c, sid, a)
        if not turns:
            continue
        rec = {"session_id": sid, "parent_id": parent, "directory": directory, "title": title,
               "agent": agent, "time_created": tc, "time_updated": tu, "turns": turns}
        line = json.dumps(rec, ensure_ascii=False)
        nsess += 1; nturns += len(turns); nbytes += len(line)
        if not a.stats:
            print(line)
    if a.stats:
        print(json.dumps({"sessions": nsess, "turns": nturns, "approx_bytes": nbytes}))

if __name__ == "__main__":
    main()
```

Then verify it without printing transcript content:

```bash
python3 docs/agents/dream/extract-opencode.py --stats --directory "$(pwd)"
```

It should print session, turn and byte counts. If it exits with a schema error, tell the user which table or column is missing and stop; do not patch around it silently. If it finds zero sessions, check that the scope matches where OpenCode was run.

If the user chose `command`, ask them to confirm that the first lines of their command's output match the JSONL contract in the `dream` skill.

### 5. Create the wiki skeleton

- `kind: dir`: create the directory with an `index.md` containing only a title and a line saying it is maintained by /dream. Create `wiki/.dream/` and add `wiki/.dream/backups/` to `.gitignore`.
- `kind: mcp`: create nothing. Check that the list and read tools respond, and say so if they do not.

### 6. Add the pointer block

Add this to the repo's `AGENTS.md` or `CLAUDE.md` (whichever exists; ask if both do; create `AGENTS.md` if neither). Keep it to these lines.

```markdown
## Memory
Past sessions are consolidated into the wiki by the `dream` skill. Start from `wiki/index.md` and follow links for detail. Config: `docs/agents/dream.md`.
```

For an `mcp` wiki, replace the second sentence with how to open the index through the MCP tools.

### 7. Finish

Tell the user setup is complete, that `/dream` is now ready to run, and that `docs/agents/dream.md` can be edited directly later. Mention that no skill files were changed.
