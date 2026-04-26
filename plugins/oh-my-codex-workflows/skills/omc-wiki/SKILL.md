---
name: omc-wiki
description: OMC-style wiki trigger for maintaining a project-local markdown knowledge base in Codex workspaces.
argument-hint: "<wiki operation or topic>"
---

# OMC Wiki

Use this skill when the user asks to wiki something, add/query/lint a wiki, or
maintain a persistent markdown knowledge base for a project.

Default role: `document-specialist`. Add `explore` for broad discovery or
`critic` for linting contradictions in existing pages. Role contracts live in
`../../agents/`.

## Goal

Maintain a small, searchable, project-local markdown wiki that compounds useful
knowledge across sessions without replacing authoritative project docs.

## Storage

Use the repository's existing convention first. Common Codex-compatible options
are:

- `docs/wiki/` when the wiki should be checked in and shared with the project;
- `.codex/wiki/` or `.codex/omc/wiki/` for project-local Codex state;
- `.omc/wiki/` only when the project already uses OMC state or the user asks for
  OMC-compatible local state.

Ask before creating a new wiki root, before writing outside the workspace, or
before making broad changes to checked-in docs. Do not use user-global storage
unless the user explicitly requests it.

## Page Format

Prefer markdown pages with simple YAML frontmatter:

```markdown
---
title: Auth Architecture
tags: [auth, architecture]
category: architecture
updated: 2026-04-26
---

# Auth Architecture

Short factual summary grounded in source files, commands, or decisions.
```

Keep page names lowercase and hyphenated when creating new pages. Use wiki-style
links such as `[[auth-architecture]]` only if the existing wiki already uses
them or the user requests that convention.

## Operations

### Query

Search existing wiki pages and related authoritative docs with `rg`. Answer from
the retrieved pages and cite file paths. If no wiki exists, say so and search
normal project docs only when useful.

### Add or Ingest

Add durable knowledge to one or more pages. Split pages by stable topic, not by
session transcript. Prefer appending or updating an existing page over creating
near-duplicates.

### Lint

Check for:

- stale pages contradicted by current code or docs;
- broken links and missing referenced files;
- duplicate pages covering the same topic;
- orphan pages without index coverage, if an index exists;
- oversized pages that should be split;
- session notes that should be deleted, summarized, or moved to working state.

### List or Read

List pages by reading the wiki directory and any `index.md` file. Read pages
directly from disk and summarize only the relevant parts.

### Delete

Delete wiki pages only when the user asks or when the cleanup scope explicitly
includes stale wiki content. Before deletion, verify the path is inside the wiki
root and explain the reason.

## Categories

Use categories only when they help navigation. Common categories:

- `architecture`
- `decision`
- `pattern`
- `debugging`
- `environment`
- `session-log`
- `workflow`

## Workflow

1. Determine the requested operation: query, add, ingest, lint, list, read, or
   delete.
2. Locate the wiki root by checking existing docs and project-local state before
   proposing a new one.
3. Ground every durable page in current code, docs, commands, or explicit user
   decisions.
4. Keep source-of-truth docs authoritative. Link to them instead of duplicating
   long content.
5. Update an index only if the wiki already has one or a new wiki is being
   created with user approval.
6. Verify changed pages by rereading them and running available doc or plugin
   validation when relevant.

## Rules

- No vector database or embedding requirement. Use markdown, filenames,
  frontmatter, tags, and keyword search.
- Do not auto-capture session content unless the user has asked for that
  behavior and the storage location is clear.
- Do not store secrets, credentials, private personal data, or unverified
  speculation.
- Do not duplicate entire source files, logs, issues, or long external docs.
- Keep pages maintainable: concise summaries, links to sources, and clear
  update points.

## Output

Report the operation, pages read or changed, where the wiki lives, and any
stale or conflicting knowledge found.
