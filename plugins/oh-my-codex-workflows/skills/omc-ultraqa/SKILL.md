---
name: omc-ultraqa
description: OMC-style ultraqa trigger for autonomous QA cycling; test, diagnose, fix, and repeat until the goal passes or a stop condition is reached.
argument-hint: "<qa goal or check type>"
---

# OMC UltraQA

Use this skill when the user asks for `omc-ultraqa`, `ultraqa`, autonomous QA
cycling, repeated test/fix passes, or when `omc-autopilot` reaches Phase 3 and
needs a stronger QA loop than a single verification pass.

## Goal

Drive a focused quality goal to fresh evidence. The loop is:

1. Test the target behavior or command.
2. Diagnose the failure from evidence.
3. Fix only the verified cause.
4. Repeat until success, a hard blocker, or a stop condition.

## Inputs

Interpret explicit goals conservatively:

- `tests`: run the repo's relevant test command.
- `build`: run the build command.
- `lint`: run lint or formatting checks.
- `typecheck`: run static type checks.
- custom goal: choose the smallest command or manual check that proves it.

If no command is known, inspect project scripts, docs, or existing test files
before inventing one. For interactive services, start the service only when
needed, test concrete user flows, then stop or report any running process.

## Cycle Rules

- Run at most five cycles.
- If the same failure signature appears three times, stop early and report it
  as a repeated blocker.
- Prefer production fixes over weakening tests.
- Keep fixes scoped to the failing behavior and ownership boundaries.
- Use fresh command output each cycle; do not reuse stale results as proof.
- Update the task plan after each cycle on non-trivial work.

## Failure Triage

For each failed cycle, classify the primary failure before editing:

- product bug: implementation does not satisfy expected behavior.
- test bug: test expectation is wrong or setup is invalid.
- environment issue: missing dependency, port conflict, credential, sandbox, or
  external service.
- unclear requirement: passing criteria cannot be determined safely.

Escalate or stop instead of guessing when the fix needs credentials, network
access, destructive changes, broad refactors, a product decision, or changes
outside the allowed ownership scope.

## Evidence Capture

Record enough evidence for the final answer:

- cycle number and goal;
- command or manual scenario run;
- pass/fail outcome and key error lines;
- diagnosis and changed files for any fix;
- residual risk or skipped checks.

Keep logs concise. Quote only the important failure summary, not full command
transcripts unless the user asks for them.

## Codex Tool Flow

Adapt the original slash-command workflow to Codex:

- Use shell commands for test, build, lint, typecheck, and service checks.
- Use `update_plan` to track cycle state when the loop is more than a trivial
  single check.
- Use role prompts from `../../agents/` only when the user explicitly asks for a
  team or delegated OMC workflow; otherwise perform the diagnosis and fix in the
  current Codex turn.
- Keep any temporary state in the workspace only when it materially helps, such
  as `.codex/omc/`, and clean it up when the run completes.

## Autopilot Interaction

When `omc-autopilot` enters Phase 3, use `omc-ultraqa` if initial QA fails or
the task has enough risk to justify cycling. Return control to autopilot only
after the QA goal passes, the five-cycle limit is reached, the same failure has
appeared three times, or an escalation criterion blocks progress.

## Stop Conditions

- Success: the QA goal passes with fresh evidence.
- Max cycles: five cycles completed without meeting the goal.
- Repeated failure: the same failure signature is observed three times.
- Blocked: environment, access, scope, or requirement constraints prevent a
  responsible fix.

Final output must include the goal, cycles run, commands and outcomes, changed
files, and any remaining blocker or risk.
