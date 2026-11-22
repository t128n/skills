---
name: setup-writing-style
description: "Create or update the personal writing style file that write-message reads, at ~/.agents/writing-style.md, from a style summary or pasted writing samples. Use when the user invokes /setup-writing-style, or asks to update their writing style."
---

# Setup Writing Style

Create and maintain the user's **personal writing style file**. `write-message` reads it when drafting a message in the user's name. Run once, then again to update.

This is a user-invoked skill. Do not run it on your own.

## Scope

- In scope: messages written in the user's name, such as chat messages, emails and comments.
- Out of scope: PR descriptions, commit messages, issues filed for the work, newsletters and documents. They follow their own skills and conventions. Say so if the user asks to cover them.

## File

- Default location: `~/.agents/writing-style.md`. Ask only if the user wants another path.
- It stays on the user's machine. Never commit it, never copy it into a repo, never edit `write-message` to include its content.
- One file, one `##` section per language, plus a `## General` section for habits that hold in every language.
- Keep patterns only: tone, sentence length, greetings, sign-offs, form of address, words to use or never use, formatting habits. No confidential facts, names, customers, projects or quotes from the source messages. Strip them before writing.

## Process

### 1. Look first

If the file exists, show it and ask what to change instead of starting over.

### 2. Get the input

Ask for one of:

- A style summary the user produced elsewhere, for example from an assistant that can read their own sent mail and messages. This is the default; this skill needs no access to mail or chat.
- Pasted writing samples. Derive patterns from them and discard the samples.

### 3. Ask, one question at a time, with a recommended default

Skip what the input already answers.

1. **Languages**: which languages the user writes in. Default: the languages seen in the input.
2. **Sign-off per language**: the closing line and the name used. Default: none for short chat replies, the input's usual sign-off for emails.
3. **Form of address** per language, where the language has one (for example du/Sie). Default: match the recipient.
4. **Words and phrases to never use.** Default: none.

### 4. Show the draft, apply edits, then write

Show the draft file using this layout, apply the user's edits, then write it.

```markdown
# Writing style

Read by `write-message`. Edit freely or re-run /setup-writing-style.

## General
- <habits that apply everywhere: tone, length, formatting>

## English
- Greeting: <...>
- Sign-off: <...>
- Form of address: <...>
- Never use: <...>
- Formatting: <capitalization, topic markers for multi-topic emails, ...>

## German
- ...
```

Omit lines with no answer. Tell the user where the file was written.

## Updating

When the user corrects a draft from `write-message` in a way that reveals a preference ("I prefer 'Hi' over 'Hey'"), update the file and say what changed in one sentence. Apply the same pattern rule: no confidential facts.
