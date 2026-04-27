---
name: omc-writer-memory
description: Codex-native writer memory workflow for characters, scenes, relationships, worlds, and themes.
argument-hint: "init|character|relationship|scene|query|validate|synopsis|export"
level: 4
---

# OMC Writer Memory

Use this skill when the user wants persistent creative-writing memory across
sessions, including character continuity, relationship tracking, scene notes,
world rules, theme tracking, dialogue validation, or synopsis generation.

## Storage

Default to project-local files so the memory is reviewable and versionable:

- `.writer-memory/memory.json` for structured memory.
- `.writer-memory/backups/` for snapshots before edits.
- `.writer-memory/exports/` for readable Markdown exports.

Ask before writing outside the workspace.

## Memory Model

- `project`: title, genre, language, tone, status.
- `characters`: arc, attitude, voice, speech level, keywords, taboos, triggers.
- `world`: setting, rules, atmosphere, constraints, history.
- `relationships`: participants, type, status, power dynamic, events, tension.
- `scenes`: title, characters, location, purpose, emotional tags, before/after.
- `themes`: theme name, expression, linked scenes, author intent.
- `synopsis`: protagonist stance, relationship structure, emotional theme,
  genre contrast, ending aftertaste.

## Commands As Natural Language

There is no Claude slash-command runtime. Interpret requests as natural
language operations:

- `init`: create the memory file and folders.
- `character add/update/list`: maintain character records.
- `relationship add/update`: maintain relationship history.
- `scene add/list`: record scenes and emotional purpose.
- `query`: answer from existing memory and cite which records were used.
- `validate`: compare dialogue against character voice and context.
- `synopsis`: produce a concise synopsis from memory.
- `export`: write a readable Markdown summary.

## Workflow

1. Inspect existing `.writer-memory/memory.json`.
2. If missing, create a minimal schema after confirming the project name.
3. Before changing memory, create a timestamped backup.
4. Apply the smallest structured update that matches the user request.
5. Preserve user wording for canon facts; label inferred facts as inferred.
6. Validate JSON syntax after edits.
7. Summarize changed records and any ambiguity.

## Quality Rules

- Keep canon, inference, and suggestion separate.
- Do not overwrite established character voice without explicit instruction.
- Track contradictions instead of silently resolving them.
- For dialogue validation, return pass/warn/fail with concrete reasons.
- Keep memory git-friendly: stable keys, formatted JSON, concise entries.

## Handoff

Use `writer` for prose generation, `critic` for consistency checks, and
`omc-remember` or `omc-wiki` when the memory should be mirrored into broader
project knowledge.
