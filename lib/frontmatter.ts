import matter from "@11ty/gray-matter";
import { fail } from "#lib/utils.ts";

export interface Frontmatter {
  name: string;
  description: string;
}

// Frontmatter is untrusted input: gray-matter must never evaluate `---js` blocks.
const noCode = () => fail("executable frontmatter is not allowed");

export function parseFrontmatter(text: string, label: string): Frontmatter {
  let data: Record<string, unknown>;
  try {
    data = matter(text, { engines: { js: noCode, javascript: noCode } }).data;
  } catch (err) {
    return fail(`${label}: invalid frontmatter (${(err as Error).message})`);
  }

  if (typeof data?.name !== "string" || typeof data?.description !== "string") {
    fail(`${label}: frontmatter needs string "name" and "description"`);
  }
  return { name: data.name, description: data.description.trim() };
}
