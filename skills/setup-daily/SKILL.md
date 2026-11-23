---
name: setup-daily
description: "Create or update the personal daily standup config that write-daily reads, at ~/.agents/daily.md: tracker, where the previous standup lives, repositories and name. Use when the user invokes /setup-daily, or asks to change where the daily standup draws from."
---

# Setup Daily

Create and maintain the user's **daily standup config**, so `write-daily` never has to ask where to read from. Run once, then again to update.

This is a user-invoked skill. Do not run it on your own.

## File

- Default location: `~/.agents/daily.md`. Ask only if the user wants another path.
- It stays on the user's machine. Never commit it or copy it into a repo.
- Store pointers only: tool names, project keys, channel names, repositories. No tokens, passwords or confidential content.

## Process

### 1. Look first

If the file exists, show it and ask what to change instead of starting over.

### 2. Check what is reachable

List the tracker, chat and GitHub tools available in this session (MCP tools, CLIs). Propose those as defaults.

### 3. Ask, one question at a time, with a recommended default

1. **Name and team** as they appear in the standup. Default: the user's name from the session.
2. **Tracker**: which tool (Jira, Linear, Orbit, ...), the project or board, and how to find the user's items. Default: the reachable tracker, filtered to the user.
3. **Previous standup**: where it is posted (channel, thread, doc) and how to find the latest one. Default: none; `write-daily` falls back to the last working day.
4. **GitHub**: repositories or orgs to check. Default: the current repository.
5. **Agent sessions**: whether to read them, and from which harness. Default: yes, the current one.
6. **Reporting conventions**: for example a review-queue cap, or the standup language. Default: none.

If a tool is not reachable from the agent, record it anyway and mark it `manual`, so `write-daily` asks for that part instead of searching.

### 4. Show the draft, apply edits, then write

```markdown
# Daily standup config

Read by `write-daily`. Edit freely or re-run /setup-daily.

- Name: <...>
- Team: <...>
- Tracker: <tool, project/board, query for the user's items>
- Previous standup: <where, how to find the latest, or none>
- GitHub: <repositories or orgs>
- Agent sessions: <harness, or none>
- Conventions: <review-queue cap, language, ...>
```

Omit lines with no answer. Tell the user where the file was written.

## Updating

When the user corrects a draft from `write-daily` in a way that reveals a changed source ("we moved to Linear"), update the file and say what changed in one sentence.
