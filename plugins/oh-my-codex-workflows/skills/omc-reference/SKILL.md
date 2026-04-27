---
name: omc-reference
description: OMC-style reference for oh-my-codex, omc, OMC workflows, magic keywords, mode selection, and role routing.
---

# OMC Reference For Codex

Use this skill when the user mentions Oh My Codex, OMC-style workflows,
autopilot, team mode, ralph, ultrawork, verification loops, or asks which mode
to use.

## Porting Boundary

This plugin is a Codex-native workflow pack, not a Claude Code runtime clone.
Do not promise Claude-specific features such as slash commands, Claude hooks,
HUD status lines, tmux worker panes, or the upstream MCP server unless the user
has separately installed and configured those systems.

## Mode Selection

- Before choosing an OMC mode, apply `omc-runtime-policy`; the normal Codex
  path is the default for direct questions, small edits, and simple one-path
  tasks.
- `omc-autopilot`: use for end-to-end feature delivery where the user wants the
  agent to handle discovery, planning, implementation, QA, and validation.
- `omc-team`: use when the user explicitly asks for team, agents, delegation, or
  parallel work on a shared task.
- `omc-ultrawork`: use when the user explicitly wants maximum parallel execution
  across independent work items.
- `omc-ralph`: use when the key requirement is persistence: keep iterating until
  the task is verified complete or a hard blocker is proven.
- `omc-plan`: use for planning, consensus planning, or review of a plan.
- `omc-deep-interview`: use when the request is vague, high-cost, or needs
  requirements clarification before implementation.
- `omc-verify`: use to prove that work is correct before claiming completion.
- `omc-review`: use for code review, risk review, or patch critique.
- `omc-agents`: use for role selection and specialist prompt contracts.

## Codex Agent Mapping

- The plugin includes role contracts under `../../agents/`.
- Exploration/research roles map to `explorer` agents when the question is
  narrow and read-only.
- Implementation roles map to `worker` agents with explicit ownership of files
  or modules.
- Architecture, security, QA, and code-review roles can be handled locally or by
  a bounded `default`/`explorer` agent when independent review is useful.
- The lead agent remains accountable for integration, conflict resolution, and
  final verification.

Only use sub-agents when the current user request explicitly asks for agents,
delegation, team mode, parallel work, `omc-team`, or `omc-ultrawork`. Otherwise,
run the workflow locally.

When sub-agents are used, give them isolated context by default. Have each
worker write `.codex/omc/runs/<run-id>/agents/<lane-id>.md`, then read those
artifact files for synthesis. Avoid full-context forks unless necessary and
record the reason.

## Shared Discipline

- Read the codebase before deciding.
- Keep changes scoped to the user's goal.
- Prefer existing project patterns over new abstractions.
- Use `update_plan` for multi-step work.
- Verify with fresh commands and report failures honestly.
- Never mark a task complete because it "should" work; show evidence.
- At OMC closeout, update `PROJECT_CONTEXT.md` with durable project state.
- Include a quality report: OMC used or skipped, latency if measured,
  sub-agent count, context mode, token usage if available, artifacts, and
  verification results.
