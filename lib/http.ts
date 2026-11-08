import { fail } from "#lib/utils.ts";

export interface HttpOptions {
  timeoutMs: number;
  maxBytes: number;
  attempts: number;
  backoffMs: number;
  /** Tests only: allow `http:` URLs (the production default is HTTPS only). */
  allowHttp: boolean;
}

export const DEFAULT_HTTP: HttpOptions = {
  timeoutMs: 20_000,
  maxBytes: 10 * 1024 * 1024,
  attempts: 3,
  backoffMs: 500,
  allowHttp: false,
};

const MAX_REDIRECTS = 5;

class TransientError extends Error {}

/** Validate a URL that comes from config, an upstream index or a redirect. */
export function assertSafeUrl(url: string, allowHttp = false): URL {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return fail(`invalid URL ${JSON.stringify(url)}`);
  }
  const protocolOk = parsed.protocol === "https:" || (allowHttp && parsed.protocol === "http:");
  if (!protocolOk) fail(`only https URLs are allowed, got ${JSON.stringify(url)}`);
  if (parsed.username || parsed.password) fail(`URL must not contain credentials: ${parsed.origin}`);
  return parsed;
}

async function fetchOnce(url: string, opts: HttpOptions, maxBytes: number): Promise<Buffer> {
  const signal = AbortSignal.timeout(opts.timeoutMs);
  let current = assertSafeUrl(url, opts.allowHttp);

  for (let hop = 0; ; hop++) {
    let res: Response;
    try {
      res = await fetch(current, { signal, redirect: "manual" });
    } catch (err) {
      throw new TransientError(`GET ${current} failed: ${(err as Error).message}`);
    }

    if (res.status >= 300 && res.status < 400) {
      await res.body?.cancel();
      const location = res.headers.get("location");
      if (!location) fail(`GET ${current} -> ${res.status} without Location header`);
      if (hop >= MAX_REDIRECTS) fail(`GET ${url}: more than ${MAX_REDIRECTS} redirects`);
      current = assertSafeUrl(new URL(location, current).toString(), opts.allowHttp);
      continue;
    }

    if (!res.ok) {
      await res.body?.cancel();
      const message = `GET ${current} -> ${res.status}`;
      if (res.status === 408 || res.status === 429 || res.status >= 500) throw new TransientError(message);
      return fail(message);
    }

    const declared = Number(res.headers.get("content-length"));
    if (declared > maxBytes) {
      await res.body?.cancel();
      fail(`GET ${current}: body is ${declared} bytes, limit is ${maxBytes}`);
    }

    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      for await (const chunk of res.body ?? []) {
        size += chunk.length;
        if (size > maxBytes) fail(`GET ${current}: body is larger than ${maxBytes} bytes`);
        chunks.push(chunk);
      }
    } catch (err) {
      if (size > maxBytes) throw err;
      throw new TransientError(`GET ${current} failed while reading: ${(err as Error).message}`);
    }
    return Buffer.concat(chunks);
  }
}

/**
 * GET with HTTPS-only checks (also on redirects), a time limit, a size limit
 * and retries for transient failures only.
 */
export async function fetchBytes(
  url: string,
  opts: HttpOptions = DEFAULT_HTTP,
  maxBytes = opts.maxBytes,
): Promise<Buffer> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fetchOnce(url, opts, maxBytes);
    } catch (err) {
      if (!(err instanceof TransientError)) throw err;
      if (attempt >= opts.attempts) fail(`${err.message} (after ${attempt} attempts)`);
      const delay = Math.min(opts.backoffMs * 2 ** (attempt - 1), 5_000) * (0.5 + Math.random() / 2);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
