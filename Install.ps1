#!/usr/bin/env pwsh
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Upstream skills are listed in upstream.txt as `source@skill`.
# When this script is piped (irm ... | iex), upstream.txt is fetched from the
# repository. Override with SKILLS_MANIFEST, or set SKILLS_COPY=1 to copy files
# instead of creating symlinks.

$manifestUrl = if ($env:SKILLS_UPSTREAM_URL) {
    $env:SKILLS_UPSTREAM_URL
} else {
    'https://raw.githubusercontent.com/t128n/skills/HEAD/upstream.txt'
}

$manifest = $env:SKILLS_MANIFEST
if ([string]::IsNullOrWhiteSpace($manifest)) {
    $localManifest = $null
    if (-not [string]::IsNullOrWhiteSpace($PSScriptRoot)) {
        $localManifest = Join-Path $PSScriptRoot 'upstream.txt'
    }

    if ($localManifest -and (Test-Path -LiteralPath $localManifest)) {
        $manifest = $localManifest
    } else {
        $manifest = Join-Path ([System.IO.Path]::GetTempPath()) 't128n-skills-upstream.txt'
        Write-Host "Fetching $manifestUrl"
        Invoke-RestMethod -Uri $manifestUrl -OutFile $manifest
    }
}

if (-not (Test-Path -LiteralPath $manifest)) {
    throw "Manifest not found: $manifest"
}

$copy = $env:SKILLS_COPY -eq '1'

foreach ($line in Get-Content -LiteralPath $manifest) {
    $entry = $line.Trim()
    if ([string]::IsNullOrWhiteSpace($entry) -or $entry.StartsWith('#')) {
        continue
    }

    $index = $entry.LastIndexOf('@')
    if ($index -le 0 -or $index -eq ($entry.Length - 1)) {
        throw "Invalid entry (expected 'source@skill'): $entry"
    }

    $source = $entry.Substring(0, $index)
    $skill = $entry.Substring($index + 1)

    Write-Host ""
    Write-Host "==> $skill ($source)"

    $npxArgs = @('skills', 'add', $source, '--skill', $skill, '--global', '--agent', 'opencode', '--yes')
    if ($copy) {
        $npxArgs += '--copy'
    }

    & npx -y @npxArgs
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install skill '$skill' from '$source' (exit code $LASTEXITCODE)"
    }
}
