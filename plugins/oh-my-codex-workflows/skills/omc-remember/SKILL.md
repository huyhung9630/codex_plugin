---
name: omc-remember
description: OMC-style remember trigger for preserving reusable project knowledge in Codex-appropriate memory, docs, or workspace state.
argument-hint: "<knowledge to preserve or organize>"
---

# OMC Remember

Use this skill when the user asks to remember, preserve, organize, or promote
knowledge discovered during a Codex session.

Default role: `document-specialist`. Add `planner` only when there are multiple
competing storage destinations that need an explicit decision. Role contracts
live in `../../agents/`.

## Goal

Move durable, reusable knowledge out of chat history and into the right local
surface without turning temporary notes into permanent instructions.

## Codex Memory Surfaces

Prefer surfaces already used by the repository:

- Project docs: `README.md`, `docs/`, architecture notes, runbooks, decision
  records, troubleshooting guides, and other checked-in documentation.
- Agent guidance: root or nested `AGENTS.md` files when the knowledge is an
  instruction for future agents working in that directory.
- Project-local Codex or OMC state: `.codex/`, `.codex/omc/`, `.omc/`, or
  similar state directories only when the repository already uses them or the
  user asks for local session memory.
- Working notes: concise notes in an existing task, plan, issue, or project
  scratch file when the knowledge is useful only for the current effort.

Ask before broad writes outside the current workspace or before creating a new
project-wide memory system. Do not write to user-global memory, home-directory
state, or unrelated repositories unless the user explicitly approves it.

## Classification

For each candidate item, classify it before writing:

- durable project fact: stable architecture, workflow, command, service,
  dependency, ownership, or convention;
- agent instruction: a rule future Codex agents should follow while editing a
  directory or project;
- temporary working note: session state, partial finding, short-term blocker,
  or next-step context;
- operator preference: a user-specific preference that should not be presented
  as a project rule without confirmation;
- duplicate, stale, or conflicting information: content that should be merged,
  corrected, or left untouched pending clarification;
- uncertain finding: useful but not proven, and therefore marked as uncertain if
  stored at all.

## Workflow

1. Gather the specific knowledge to preserve and its evidence: files, commands,
   outputs, decisions, or user instructions.
2. Inspect existing docs and state with targeted reads, using `rg` first for
   likely headings, terms, and duplicate entries.
3. Classify each item and choose the narrowest appropriate destination.
4. Prefer updating existing documentation over creating a new file when a clear
   home already exists.
5. Preserve manual notes and existing structure. Remove or correct stale
   contradictory guidance only when the evidence is strong and ownership allows
   it.
6. Keep entries concise, dated only when recency matters, and written as facts
   or instructions rather than chat summaries.
7. If the destination is ambiguous, present the proposed destination and ask
   before writing.
8. Verify the edit by rereading the changed section and, when relevant, running
   the repo's doc or plugin validation command.

## Rules

- Do not dump all knowledge into a single memory file.
- Do not create `.codex`, `.omc`, or `AGENTS.md` state just because it is
  possible; use it when it matches the repo's conventions or the user asks.
- Do not store secrets, tokens, private credentials, personal data, or
  one-off command output as durable memory.
- Do not promote speculation into project truth. Mark uncertain facts clearly or
  keep them in working notes.
- Do not overwrite concurrent edits. Check the current file content before
  editing and work with existing changes.

## Output

Report:

1. What was stored or updated.
2. Where it was stored.
3. What was intentionally not stored.
4. Any duplicate, stale, or conflicting guidance found.
5. Verification performed or why verification was not run.
