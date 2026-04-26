---
name: omc-cancel
description: OMC-style cancellation trigger for stopomc, cancelomc, abort omc, or stopping active OMC workflows safely.
argument-hint: "[--force|--all]"
---

# OMC Cancel

Use this skill when the user asks for `omc-cancel`, `stopomc`, `cancelomc`,
`abort omc`, or otherwise wants the active OMC-style workflow stopped.

## Goal

Stop coordination behavior that Codex can actually control, clean up local OMC
state only when it is safe, and report any unknown background work honestly.

## Workflow

1. Stop spawning new workers, agents, verification loops, or follow-up tasks.
2. Stop waiting on nonessential worker results. If a running sub-agent has a
   known id and the host exposes a close/cancel operation, close it.
3. Inspect local OMC state if it is relevant and available:
   - `.omc/state/`
   - `.omc/state/sessions/`
   - mode files for `autopilot`, `ralph`, `ultrawork`, `ultraqa`, `team`,
     `ralplan`, `plan-consensus`, or related OMC modes
4. Prefer marking state inactive or cancelled over deleting it. Preserve
   resumable progress for modes such as autopilot or planning.
5. Clear only state artifacts that are clearly session-scoped, stale, or owned
   by the active OMC workflow. Clear `skill-active` style markers last when
   present so stop/cancel routing does not re-trigger.
6. If state ownership is ambiguous, spans multiple sessions, or deletion would
   remove resumable work, ask before deleting. Use `--force` or `--all` only
   after the user confirms broad cleanup.
7. Report what was stopped, what state was changed, and what could not be
   confirmed.

## Safe Cleanup Rules

- Do not delete source files, generated deliverables, commits, branches, or
  user edits as part of cancellation.
- Do not use destructive cleanup for another session unless the user explicitly
  requests all-session cleanup.
- Do not claim that background work was killed unless Codex received a clear
  success signal from the host or process manager.
- When only local state is available, say that live external processes may still
  exist and identify the state paths inspected.
- Ask before removing directories such as `.omc/state/sessions/`,
  `.omc/state/checkpoints/`, or shared team/bridge registries.

## Force Mode

Use `--force` or `--all` to reset OMC coordination state after confirmation.
Even in force mode:

1. Prefer session-aware cleanup first.
2. Preserve user work products.
3. Remove or mark only OMC control artifacts.
4. Report every path changed or intentionally left alone.

## Final Response

Include:

- exact cancellation request handled, including aliases such as `stopomc` or
  `cancelomc`;
- sub-agents closed or left running because their ids were unknown;
- state files marked, cleared, or preserved;
- any manual follow-up needed for unknown background work.
