---
name: omc-setup
description: Install, update, or route setup requests for oh-my-codex-workflows in Codex.
argument-hint: "[doctor|mcp|wizard|--local|--global|--force|--help]"
---

# OMC Setup

Use this skill when the user asks for `omc-setup`, `setup`, install, update,
repair, or first-run configuration for this Codex plugin.

## Codex Boundary

This is a Codex-native setup guide. Do not claim Claude Code hooks, Claude
statusLine, or Claude slash-command runtime integration. When upstream guidance
mentions `CLAUDE.md`, `~/.claude`, hooks, or Claude plugin cache paths, translate
that into Codex plugin checks and explicit user-approved edits.

## Routing

Treat `setup` as an alias for this skill. Route by the first argument:

- No argument, `wizard`, `--local`, `--global`, or `--force`: run the setup
  workflow below.
- `doctor`: use `omc-doctor` with the remaining arguments.
- `mcp`: use `omc-mcp-setup` with the remaining arguments.
- `--help`: show the available routes and stop.

## Setup Workflow

1. Identify the plugin root. In this repo it is
   `plugins/oh-my-codex-workflows/`.
2. Check required plugin files:
   - `.codex-plugin/plugin.json`
   - `README.md`
   - `NOTICE.md`
   - `agents/AGENTS.md`
   - `scripts/install-global.mjs`
   - `scripts/role-prompt.mjs`
   - `skills/*/SKILL.md`
3. Run local validation when feasible:
   `node .\plugins\oh-my-codex-workflows\scripts\validate-plugin.mjs`.
4. If the user asks for a global install, inspect
   `scripts/install-global.mjs` before running it. Writing under the Codex home
   or user profile is an external write and needs explicit approval.
5. If the user asks to update from a remote source, fetch or pull only after
   explicit approval because it uses network access and may modify the working
   tree.

## Safe Boundaries

- Do not overwrite user Codex config, global skills, or plugin marketplace files
  without showing the target path and getting approval.
- Do not delete existing files as part of setup unless the user explicitly asks.
- Do not store credentials in skill files or repository files.
- If a command needs network, package install, or writes outside the workspace,
  request approval before running it.

## Completion

Report:

- what was checked or installed;
- any files written outside the workspace;
- validation command and result;
- follow-up actions that require a new Codex session or manual user action.
