---
name: review-slop
description: "Remove AI-generated slop from the current branch's diff so it reads like a human wrote it in the style of the surrounding code, without changing behavior. Use when the user explicitly asks to remove slop, clean up AI-written changes, or invokes /review-slop. Never run unprompted, because it edits code."
disable-model-invocation: true
---

# Review Slop

Strip the tells of machine-written code from what this branch introduced, so the diff matches the code around it. Inspired by the `rmslop` command in [nexxeln/dots](https://github.com/nexxeln/dots).

## Scope

Compare the branch against `main` and change only lines the branch added or modified. Leave everything else alone, even if it looks sloppy. If `main` does not exist, say so and ask which base to use.

Honor the user's carve-outs ("leave the comments in the parser alone") over everything below.

## Remove

- Comments a human wouldn't write, or that don't match the commenting style of the file.
- Defensive checks and try/catch blocks that are abnormal for that area, especially on trusted or already validated paths.
- Casts to `any` (or the language's equivalent) that only get around a type problem. Fix the type instead.
- Emoji that carry no meaning.
- Any other style that is inconsistent with the file: naming, formatting, error handling, verbosity.

Read the surrounding code first and treat its conventions as the standard.

## Don't change behavior

After editing, run the relevant tests and type checks. Report any that could not run.

## Report

Reply in 1 to 3 sentences: what changed. Nothing more.
