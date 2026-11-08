import { Git, DEFAULT_GIT, type GitOptions } from "#lib/git.ts";
import { DEFAULT_HTTP, type HttpOptions } from "#lib/http.ts";
import { TempDirManager } from "#lib/utils.ts";

/** Everything with side effects on the outside world. Tests replace the endpoints. */
export interface Context {
  tmp: TempDirManager;
  git: Git;
  http: HttpOptions;
}

export function createContext(overrides: { git?: Partial<GitOptions>; http?: Partial<HttpOptions> } = {}): Context {
  const tmp = new TempDirManager();
  return {
    tmp,
    git: new Git({ ...DEFAULT_GIT, ...overrides.git }, tmp),
    http: { ...DEFAULT_HTTP, ...overrides.http },
  };
}
