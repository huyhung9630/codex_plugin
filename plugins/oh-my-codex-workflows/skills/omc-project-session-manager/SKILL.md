---
name: omc-project-session-manager
description: Manage isolated project sessions with git worktrees and optional tmux or external CLI processes.
argument-hint: "[review|fix|feature|list|attach|kill|cleanup|status] <ref>"
---

# OMC Project Session Manager

Use this skill when the user asks for project session management, PSM, isolated
issue or PR worktrees, or task-specific development environments.

## Codex Boundary

Codex does not provide a built-in persistent tmux session manager. This skill
coordinates normal shell commands, git worktrees, and optional external CLIs.
Launching tmux sessions, Codex CLI workers, or other long-running processes
requires explicit user approval when it writes outside the workspace or starts
background processes.

## Commands

- `review <ref>`: create or inspect a PR review worktree.
- `fix <ref>`: create or inspect an issue-fix worktree.
- `feature <project> <name>`: create a feature worktree.
- `list [project]`: list known worktrees or sessions.
- `attach <session>`: attach to an existing tmux session if tmux is used.
- `kill <session>`: stop the tmux session; ask before removing worktrees.
- `cleanup`: remove closed or merged session state after confirmation.
- `status`: show current worktree/session state.

## Reference Formats

- `owner/repo#123`
- `#123` for the current repository
- GitHub issue or pull request URL
- local feature name

## Workflow

1. Parse the command and target reference.
2. Confirm prerequisites:
   - `git`
   - `gh` for GitHub issue or PR metadata
   - `tmux` only if a tmux session is requested
3. Resolve the base repository and target worktree path.
4. Ask before creating directories outside the workspace, cloning repos, fetching
   from remotes, or starting background processes.
5. Create or inspect the worktree with `git worktree`.
6. If tmux is requested, start a session only after approval and report the
   session name and working directory.
7. Record any session metadata in a user-approved location such as
   `.codex/omc/sessions/` in the workspace or another explicit path.

## Safety

- Never remove a worktree without checking for uncommitted changes first.
- Do not force-delete session state unless the user explicitly requests it.
- Do not launch external CLIs with broad permission bypass flags by default.
- Keep one task per worktree to avoid branch and write conflicts.

## Completion

Report the worktree path, branch, session name if any, commands run, and cleanup
steps that still require user action.
