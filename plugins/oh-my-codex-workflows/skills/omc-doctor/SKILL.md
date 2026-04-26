---
name: omc-doctor
description: Diagnose oh-my-codex-workflows installation, plugin metadata, skills, agents, and optional external integrations.
argument-hint: "[--json|--fix]"
---

# OMC Doctor

Use this skill when the user asks to diagnose, repair, or verify the OMC Codex
plugin installation.

## Codex Boundary

This doctor checks the Codex plugin layout and optional integrations. It does not
diagnose Claude Code hooks or Claude statusLine as active Codex features. Mention
those only as upstream concepts that are not available here.

## Diagnostic Checks

1. Locate the plugin root:
   `plugins/oh-my-codex-workflows/`.
2. Validate plugin metadata:
   - `.codex-plugin/plugin.json` exists and has valid JSON.
   - plugin name matches the plugin directory.
   - `skills`, `agents`, scripts, `README.md`, and `NOTICE.md` exist.
3. Validate skills:
   - every skill directory contains `SKILL.md`;
   - frontmatter includes `name` and `description`;
   - frontmatter `name` matches the directory name;
   - names are unique.
4. Validate agents:
   - `agents/AGENTS.md` exists;
   - each role file declares `Native type:`, `## Mission`, and
     `## Prompt Addendum`.
5. Run the validator when feasible:
   `node .\plugins\oh-my-codex-workflows\scripts\validate-plugin.mjs`.
6. Check optional CLIs only when relevant to the user's issue:
   - `node`
   - `npm`
   - `git`
   - `tmux`
   - `codex`
   - `gh`
7. Check optional MCP configuration only by inspecting Codex-visible MCP
   resources or config paths the user approves. Do not assume Claude's
   `claude mcp` registry exists.

## Report Format

Return a short report:

```text
## OMC Doctor Report

### Summary
HEALTHY or ISSUES FOUND

### Checks
| Check | Status | Details |
| --- | --- | --- |

### Recommended Fixes
1. ...
```

## Auto-Fix Policy

Only apply fixes after the user confirms. Approval is required before:

- writing outside the workspace;
- changing global Codex config or skill directories;
- deleting plugin cache, generated files, worktrees, or session state;
- installing packages or fetching from the network;
- writing credentials or tokens.

Prefer non-destructive fixes: create missing files, update invalid frontmatter,
or rerun local validation. Never remove user custom skills, agents, or config
unless the user explicitly identifies them as disposable.
