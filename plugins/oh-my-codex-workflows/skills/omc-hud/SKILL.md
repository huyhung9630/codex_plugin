---
name: omc-hud
description: Provide Codex-safe HUD and status display guidance without claiming unavailable statusline integration.
argument-hint: "[status|setup|minimal|focused|full]"
---

# OMC HUD

Use this skill when the user asks for HUD, status display, statusline, or OMC
session visibility.

## Codex Boundary

The upstream HUD depends on Claude Code statusLine hooks. Codex plugins do not
currently expose the same statusline runtime. This skill can provide a manual
status report, generate configuration notes, or help build a separate script,
but it must not claim automatic HUD rendering unless such a runtime is present
and verified in the user's environment.

## Commands

- `status`: show current workspace and OMC-related status.
- `setup`: explain available Codex-safe options and ask before writing scripts.
- `minimal`, `focused`, `full`: choose the amount of information for a manual
  status report or external script config.

## Status Checks

For a manual HUD report, gather only available local information:

- current working directory;
- git branch and dirty state if inside a git repository;
- active plan or todo state if visible in the conversation;
- relevant `.codex/omc/` state files if they exist;
- running tmux or external team sessions only when checking them is requested.

## Setup Options

Offer one of these honest options:

1. Manual report: print a compact status block on demand.
2. Workspace script: create a script under the workspace that prints status.
3. External shell integration: document how the user can call the script from
   their own prompt, terminal statusline, or tmux status.

Writing outside the workspace, changing shell profiles, or changing terminal or
tmux config requires explicit approval.

## Presets

- `minimal`: mode, branch, and todo count.
- `focused`: repository, branch, active mode, plan state, and warnings.
- `full`: focused view plus session files, external workers, and diagnostics.

Keep output ASCII-only and avoid terminal control sequences unless the user asks.

## Completion

Report what was inspected, what display mode was used, and whether any automatic
runtime integration is unavailable or still unverified.
