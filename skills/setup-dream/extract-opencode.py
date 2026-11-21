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
