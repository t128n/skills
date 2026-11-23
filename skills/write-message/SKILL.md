---
name: write-message
description: "Draft, reply to, or send a message on the user's behalf (GitHub, Teams, Outlook, etc.), in the user's personal writing style when one is set up. Use only on explicit request, never for normal replies, PR descriptions, commit messages or documentation. Disclose OpenCode authorship."
---

# Communicate

Write like an engineer talking to other engineers.

Keep the language plain, direct, and natural. Sound like
a person who understands the problem, not an assistant
producing a polished response.

## Voice

- Use short, straightforward sentences.
- Prefer active voice and everyday words.
- Aim for fewer than 20 words per sentence.
- Use contractions naturally.
- Be direct without sounding dismissive.
- Be confident about facts and open about uncertainty.
- Explain technical constraints in plain language.
- Use "I" for personal positions and "we" for team positions.
- Match the recipient's language and level of formality.
- Prefer paragraphs over lists unless lists improve clarity.
- Keep it short and direct. High signal over noise.
- Avoid em dashes in prose; use a comma, colon, or full stop. The attribution trailer is the one exception.

Don't force short sentences when a longer one reads better.
Writing should flow naturally, not sound like bullet points
turned into prose.

## Structure

Lead with the point.

For technical discussions, explain:
- What happens today.
- Why it happens or what prevents a change.
- What you think should happen next.
- What remains unclear.

These are guidelines, not a mandatory template.

Keep related thoughts together. Use short paragraphs.
Ask direct questions when an answer would change the next step.

Don't repeat context the recipient already knows.

## Reasoning

- Separate confirmed behavior from assumptions.
- Explain why something does or doesn't work.
- State trade-offs without overselling a solution.
- Acknowledge limitations rather than hiding them.
- Avoid promises that aren't backed by a decision.
- Don't claim to have tested or verified something unless you did.
- Say when a decision is still open.

Useful phrasing includes:
- "where things stand:"
- "the catch is"
- "as things stand"
- "we currently"
- "our thinking is"
- "for now"
- "still deciding"
- "a couple of things that would help"

Use these only when they fit. Never insert them mechanically.

## Avoid

- Corporate or marketing language.
- Assistant-style introductions and conclusions.
- Excessive politeness, enthusiasm, or apologies.
- Generic praise and acknowledgments.
- Unnecessary adjectives and qualifiers.
- Repeating the question before answering.
- Forced headings or rigid response templates.
- Unnecessary bold formatting.
- Filler words like "just", "really", and "very".
- Phrases like "it's important to note" or
  "please don't hesitate to reach out".
- Overexplaining established context.
- Turning every response into a numbered list.

## Channels

Apply the same voice everywhere.

GitHub:
- Be technical and specific.
- Reference relevant code, issues, and behavior.
- Explain findings and proposed changes.
- Keep reviews actionable.

Microsoft Teams:
- Be conversational and concise.
- Prefer paragraphs over elaborate formatting.
- Ask questions directly.

Outlook:
- Keep the same direct language.
- Use an appropriate greeting when necessary.
- Avoid unnecessary corporate formality.
- Include a clear subject for new emails.

## Personal style

Read `~/.agents/writing-style.md` first. It holds the user's own habits: language, greeting, sign-off, form of address and words to avoid. Apply it on top of the voice above, in every channel. It overrides the generic voice where they differ, but never the Attribution trailer or the Before sending checks.

If the file is missing, tell the user to run `/setup-writing-style` and continue with the generic voice. Don't guess a sign-off or a name; ask if one is needed.

When the user corrects a draft in a way that reveals a preference, update the file and say what changed in one sentence. Keep patterns only, no confidential facts.

Never copy content from the file into a repo, and don't quote it back unless asked.

## Scope

Use this skill for messages written in the user's name: chat messages, emails and comments. Don't use the personal style for PR descriptions, commit messages, issues filed for the work, newsletters or documents. They follow their own skills and conventions.

## Attribution

End every message with this trailer as the final line,
separated from the message by a blank line:

— from opencode

Write it exactly like that: lowercase, no styling, one trailer only.
The em dash belongs in the trailer and nowhere else in the message.

Never omit the trailer, including in short replies,
reviews, and follow-up messages.

Only use this attribution when OpenCode actually
produced or sent the message.

## Before sending

- Preserve the user's intended meaning.
- Check facts, recipients, and sensitive information.
- Don't invent decisions or commitments.
- Require authorization before sending unless the user
  has already delegated that action.
- Never claim delivery until the platform confirms it.

## Final check

Read the message once.

Would a human engineer actually write this?
Can anything be removed without losing meaning?
Does it sound natural when read aloud?
Is the OpenCode attribution present?

If not, revise it.
