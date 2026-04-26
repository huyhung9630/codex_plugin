---
name: omc-release
description: OMC-style cautious release assistant for discovering release rules and guiding a verified release.
argument-hint: "[version|patch|minor|major] [--refresh]"
---

# OMC Release

Use this skill when the user wants help preparing or executing a release.

This is a cautious release assistant. It discovers and explains the repository
release process, prepares local changes when asked, and asks for confirmation
before any irreversible or credential-dependent action. It must not assume the
user has publish credentials.

## Workflow

### 1. Load Or Discover Release Rules

Check for `.codex/omc/RELEASE_RULE.md` first. If it is missing or the user
passes `--refresh`, inspect the repository and produce the rule file when the
path is writable.

Discover:

- Version sources such as `package.json`, `pyproject.toml`, `Cargo.toml`,
  Gradle files, `VERSION`, or release scripts.
- Release automation such as `semantic-release`, Changesets, release-it,
  GoReleaser, Make targets, or scripts named `release`.
- CI release triggers such as tag push, manual workflow dispatch, release
  branches, or merges to main.
- Test gates and whether they run before publish.
- Registry or distribution targets such as npm, PyPI, Cargo, Docker, GitHub
  Releases, or GitHub Packages.
- Changelog or release note conventions.

Use `.omc/RELEASE_RULE.md` only when the repository already uses that location
or the user asks for compatibility with older OMC conventions.

### 2. Explain The Release Path

Summarize what will happen, what is automated, what is manual, and which
actions need credentials. Call out first-time setup gaps such as missing CI
release workflow, absent tags, missing changelog, or unclear publish target.

### 3. Determine Version

If the user supplied `patch`, `minor`, `major`, or an explicit semver, validate
it against the current version. Otherwise show the current version and the
resulting patch, minor, and major candidates, then ask which to use.

### 4. Pre-Release Checklist

Before changing files or running release steps, check:

- Working tree status and whether unrelated changes exist.
- Local tests or CI test command.
- Version files that must be updated together.
- Changelog or release note requirements.
- Whether release credentials or `gh` authentication are needed.

Do not proceed with tagging, pushing, publishing, or creating GitHub releases
without explicit user confirmation.

### 5. Prepare Local Release Changes

When requested, update version sources and release notes using the discovered
rules. Keep the diff limited to release files. Run the test gate if feasible.

### 6. Confirm Dangerous Steps

Treat these as confirmation-required actions:

- Creating or moving git tags.
- Pushing commits or tags.
- Publishing to a registry.
- Creating or editing GitHub Releases.
- Running project-specific release scripts that publish or deploy.

If the user approves execution, run the narrow command needed and report exact
outcome. If credentials are missing, stop and explain the required setup.

### 7. Verify

After release actions, verify with available evidence:

- Git tag exists locally and remotely.
- CI workflow started or completed.
- GitHub Release exists when applicable.
- Registry shows the expected version when credentials and network access allow
  checking it.

## Release Rule File Template

```markdown
# Release Rules
<!-- last-analyzed: YYYY-MM-DDTHH:MM:SSZ -->

## Version Sources

## Release Trigger

## Test Gate

## Registry Or Distribution

## Release Notes Strategy

## CI Workflow Files

## First-Time Setup Gaps
```

## Rules

- Prefer repo-discovered commands over generic release advice.
- Keep release preparation and release execution separate.
- Never claim a publish succeeded without external evidence.
- When unsure, pause for user confirmation instead of guessing.
