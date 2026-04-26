---
name: omc-deepinit
description: OMC-style deep initialization trigger for creating or updating hierarchical AGENTS.md guidance in Codex codebases.
argument-hint: "<repo path or scope>"
---

# OMC Deepinit

Use this skill when the user asks to initialize, refresh, or deepen codebase
guidance for Codex agents using hierarchical `AGENTS.md` files.

Default role: `document-specialist`. Add `explore` for repository mapping,
`architect` for subsystem relationships, and `writer` for large documentation
updates. Role contracts live in `../../agents/`.

## Goal

Create or update accurate, maintainable `AGENTS.md` guidance that helps future
Codex agents work safely in each relevant part of a codebase.

## Codex-Compatible Conventions

- Use `AGENTS.md` as the primary agent-facing guidance file.
- Place root guidance at the repository root when the user approves or when the
  request clearly targets the current repository.
- Place nested `AGENTS.md` files only in directories where local instructions
  materially differ from the parent or where the directory is large enough to
  need its own map.
- Include parent references in nested files:

```markdown
<!-- Parent: ../AGENTS.md -->
```

- Preserve manual sections and user-authored guidance.
- Ask before broad writes outside the current workspace, before documenting
  unrelated repositories, or before creating a large hierarchy in a repo the
  user did not explicitly target.

## Exclusions

Do not generate guidance inside dependency, build, cache, or generated-output
directories such as:

- `.git/`
- `node_modules/`
- `dist/`
- `build/`
- `coverage/`
- `.next/`
- `.nuxt/`
- `.venv/`
- `__pycache__/`
- generated SDK or vendored directories unless the user explicitly asks.

## Recommended AGENTS.md Shape

```markdown
<!-- Parent: ../AGENTS.md -->

# Directory Name

## Purpose
One short paragraph describing what this directory owns.

## Key Files
| File | Purpose |
|------|---------|
| `file.ts` | What future agents need to know about it. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `subdir/` | What it owns and whether it has its own AGENTS.md. |

## Working Here
- Local instructions for edits in this directory.

## Verification
- Commands or checks relevant to changes in this directory.

## Notes
- Stable caveats, boundaries, or dependencies.

<!-- MANUAL: Add durable human-maintained notes below this line. -->
```

Keep sections only when useful. Do not pad small directories with empty tables or
generic boilerplate.

## Workflow

1. Confirm scope.
   Identify the target repo or subdirectory. If the request implies broad writes
   outside the current workspace, ask before editing.

2. Map the tree.
   Use `rg --files`, `Get-ChildItem`, or repo-specific tooling to list relevant
   directories. Exclude generated and dependency directories.

3. Inspect existing guidance.
   Read existing `AGENTS.md`, README files, docs, package manifests, test
   configs, and representative source files. Treat existing guidance as
   authoritative unless current code proves it stale.

4. Plan hierarchy.
   Prefer a root file plus a small number of high-value nested files. Generate
   parent levels before child levels so references resolve.

5. Draft from evidence.
   Ground descriptions in actual files, commands, imports, tests, and docs.
   Include commands only when they exist in package scripts, build files, docs,
   or validated local usage.

6. Merge existing files.
   Preserve manual sections marked by `<!-- MANUAL` and any clearly
   user-authored notes. Update stale generated sections rather than duplicating
   them.

7. Validate.
   Reread changed `AGENTS.md` files. Check parent references, stale paths, and
   commands. Run available validators or documentation checks when feasible.

## Update Mode

When `AGENTS.md` files already exist:

- read before writing;
- identify generated versus manual content;
- keep instructions that are still accurate;
- remove or rewrite stale guidance that conflicts with current code;
- avoid churn in unchanged directories;
- report any guidance that could not be verified.

## Quality Bar

Good `AGENTS.md` content is specific enough to guide edits:

- names real files, directories, commands, and ownership boundaries;
- explains local risks and testing requirements;
- avoids promotional language and broad architecture guesses;
- avoids duplicating long README content;
- stays short enough that future agents will read it.

Poor content is generic:

- "follow best practices";
- guessed dependencies;
- empty boilerplate tables;
- commands that do not exist;
- stale instructions copied from another project.

## Output

Report:

1. `AGENTS.md` files created or updated.
2. Important guidance added.
3. Existing manual content preserved.
4. Validation performed.
5. Directories intentionally skipped and why.
