#!/usr/bin/env bash
set -euo pipefail

# Upstream skills are listed in upstream.txt as `source@skill`.
# When this script is piped (curl ... | bash), upstream.txt is fetched from the
# repository. Override with SKILLS_MANIFEST=/path/to/upstream.txt, or set
# SKILLS_COPY=1 to copy files instead of creating symlinks.

manifest_url="${SKILLS_UPSTREAM_URL:-https://raw.githubusercontent.com/t128n/skills/HEAD/upstream.txt}"

script_dir=""
if [[ -n "${BASH_SOURCE[0]:-}" ]]; then
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
fi

manifest="${SKILLS_MANIFEST:-}"
if [[ -z "$manifest" ]]; then
  if [[ -n "$script_dir" && -f "$script_dir/upstream.txt" ]]; then
    manifest="$script_dir/upstream.txt"
  else
    manifest="$(mktemp "${TMPDIR:-/tmp}/t128n-skills.XXXXXX")"
    trap 'rm -f "$manifest"' EXIT
    echo "Fetching $manifest_url"
    curl -fsSL "$manifest_url" -o "$manifest"
  fi
fi

if [[ ! -f "$manifest" ]]; then
  echo "Manifest not found: $manifest" >&2
  exit 1
fi

copy_flag=""
if [[ "${SKILLS_COPY:-0}" == "1" ]]; then
  copy_flag="--copy"
fi

while IFS= read -r entry || [[ -n "$entry" ]]; do
  entry="${entry%$'\r'}"
  entry="${entry#"${entry%%[![:space:]]*}"}"
  entry="${entry%"${entry##*[![:space:]]}"}"

  [[ -z "$entry" || "$entry" == \#* ]] && continue

  if [[ "$entry" != *@* ]]; then
    echo "Invalid entry (expected 'source@skill'): $entry" >&2
    exit 1
  fi

  source="${entry%@*}"
  skill="${entry##*@}"

  if [[ -z "$source" || -z "$skill" ]]; then
    echo "Invalid entry (expected 'source@skill'): $entry" >&2
    exit 1
  fi

  echo ""
  echo "==> $skill ($source)"

  if ! npx -y skills add "$source" \
    --skill "$skill" \
    --global \
    --agent opencode \
    $copy_flag \
    --yes; then
    echo "Failed to install skill '$skill' from '$source'" >&2
    exit 1
  fi
done < "$manifest"
