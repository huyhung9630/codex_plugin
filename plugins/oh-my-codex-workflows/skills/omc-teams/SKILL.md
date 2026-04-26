---
name: omc-teams
description: Coordinate process-based CLI teams with tmux, codex, claude, or gemini when external worker execution is explicitly requested.
argument-hint: "<N>:<codex|claude|gemini> <task>"
---

# OMC Teams

Use this skill when the user asks for `omc-teams`, process-based CLI workers,
tmux panes, or external `codex`, `claude`, or `gemini` worker processes.

## Relationship To OMC Team

For native Codex collaboration inside this session, prefer `omc-team`. Use
`omc-teams` only when the user explicitly wants external CLI processes managed
through tmux or a similar terminal runtime.

## Codex Boundary

This skill does not provide hidden runtime integration. It can check
prerequisites, decompose work, and run approved shell commands. Starting tmux,
launching external CLIs, installing CLIs, or writing worker state outside the
workspace requires approval.

## Input

Expected form:

```text
<N>:<agent-type> <task>
```

- `N`: 1 through 10.
- `agent-type`: `codex`, `claude`, or `gemini`.
- `task`: the work to distribute.

Reject unsupported agent types. For role-based work inside Codex, route to
`omc-team` and `omc-agents`.

## Workflow

1. Validate `N`, agent type, and task.
2. Check prerequisites:
   - `tmux` for tmux execution;
   - selected CLI in `PATH`;
   - current working directory and repository boundaries.
3. Decompose into non-overlapping worker packets with explicit ownership.
4. Ask before launching long-running processes or installing missing CLIs.
5. Launch only after the command, cwd, and task text are clear to the user.
6. Verify launch by inspecting process or tmux pane status before reporting
   success.
7. Monitor with approved commands and collect worker output for final synthesis.
8. Shut down sessions only on user request or when cleanup is part of the agreed
   workflow.

## Safety

- Do not pass broad permission-bypass flags unless the user explicitly approves.
- Do not assign overlapping write scopes to multiple workers.
- Do not claim workers completed until their output or exit status is checked.
- Prefer detached sessions when not already inside tmux.

## Completion

Report worker count, agent type, tmux/session identifiers, task packet summary,
verification performed, and any workers that failed or need manual inspection.
