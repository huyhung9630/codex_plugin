---
name: omc-ralph
description: OMC-style ralph trigger for "ralph", "keep going until it works", "do not stop until verified"; persistent verify/fix loop.
argument-hint: "<task>"
---

# OMC Ralph

Use this skill when the user asks for `omc-ralph`, "ralph", "keep going until it
works", "do not stop until verified", or a similar persistence requirement.

First resolve the orchestrator script, then create an orchestrator run:

```powershell
$omc = ".\plugins\oh-my-codex-workflows\scripts\omc-orchestrator.mjs"
if (-not (Test-Path $omc)) {
  $codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME ".codex" }
  $omc = Join-Path $codexHome "scripts\omc-orchestrator.mjs"
}
if (-not (Test-Path $omc)) { throw "omc-orchestrator.mjs not found; run install-global.mjs from the plugin repo" }
node $omc start --mode ralph --task "<task>"
```

Use the returned run id for PRD evidence, role artifacts, regression
verification, status checks, and closeout. Do not claim success until the
orchestrator `close --status complete` command passes.
Do not silently fall back to hand-written run folders when the global
orchestrator script exists.

## Purpose

Ralph is a PRD-driven persistence loop. It keeps working until every story has
specific acceptance criteria, each criterion has fresh verification evidence,
and the completed change survives reviewer verification plus regression checks.
It wraps `omc-ultrawork` for parallel execution, but persistence and evidence
are the core behavior.

## Use When

- The task requires guaranteed completion with verification.
- The user explicitly says not to stop until it works.
- Work may need multiple iterations and durable state.
- The task benefits from story-by-story acceptance criteria.
- A final `verifier`, `architect`, `critic`, or `code-reviewer` pass is needed.

## Do Not Use When

- The user wants only exploration or planning.
- The task is a quick one-shot fix with obvious verification.
- The user wants manual control after every step.
- The task is impossible without missing credentials or decisions.

## Why This Exists

Complex tasks often fail by being declared done too early. Ralph prevents that
by splitting work into verifiable stories, tracking progress across iterations,
requiring fresh evidence, and refusing partial completion.

## PRD Mode

Ralph operates under `.codex/omc/prd/`:

- `.codex/omc/prd/prd.json`: stories, acceptance criteria, `passes` flags, and
  verification evidence.
- `.codex/omc/prd/progress.txt`: work completed, changed files, learnings, and
  next-story notes.
- `.codex/omc/runs/<run-id>/ralph-state.json`: active loop state.

Startup gate:

- If a PRD exists, read it before implementation.
- If no PRD exists, create one with task-specific stories and criteria.
- Replace generic criteria such as "implementation is complete" with concrete
  checks: behavior, path, command output, UI state, or test result.
- Order stories by dependency and priority.

If the prompt contains `--no-deslop`, skip the deslop pass. If the prompt names
a critic role, use that reviewer when available; otherwise default to
`verifier` plus `architect` for broad or risky changes.

## Execution Policy

- Fire independent lanes through `omc-ultrawork` when boundaries are safe.
- Keep the critical path local and delegate bounded sidecar work.
- Use role artifacts instead of runtime-specific task APIs.
- Deliver the full request; do not reduce scope silently.
- Prefer fixing production code over weakening tests.
- Do not delete tests, skip checks, or rename failures to make the loop pass.
- Persist state after each iteration.

## Steps

1. PRD setup and refinement. Read or create `.codex/omc/prd/prd.json` with
   original task, story ids, criteria, `passes: false`, evidence fields, and
   changed-file tracking. Write `.codex/omc/runs/<run-id>/ralph-state.json`
   with `iteration`, `max_iterations`, `boulder_active`, `stop_requested`, and
   `current_story`.
2. Pick next story. Select the highest-priority story with `passes: false`.
   Before each story, read `ralph-state.json`; continue only when
   `boulder_active` is true and `stop_requested` is false.
3. Implement current story. Work locally or use role artifacts under
   `.codex/omc/runs/<run-id>/agents/<story-id>-<role>.md`. Use `executor`,
   `debugger`, `designer`, `test-engineer`, `document-specialist`, or
   `security-reviewer` as appropriate. Add discovered required subtasks to the
   PRD.
4. Verify acceptance criteria. For each criterion, run the narrowest reliable
   check, read the output, record evidence, and keep `passes: false` if any
   criterion fails.
5. Mark story complete. Only when all criteria pass, set `passes: true`, append
   progress notes, and record changed files and learnings.
6. Check PRD completion. If any story remains incomplete, increment iteration
   state and loop to Step 2. If all pass, proceed. If the same failure repeats
   three times, stop as a fundamental blocker unless the user raised the limit.
7. Reviewer verification. Verify against PRD criteria, changed files, related
   callers/callees/types, and the question of whether a meaningfully simpler,
   faster, or more maintainable approach exists. Use `verifier` for every
   closeout; add `architect`, `code-reviewer`, `security-reviewer`, or `critic`
   based on risk.
7.5. Deslop pass. Unless `--no-deslop` was specified, run
   `omc-ai-slop-cleaner` on the Ralph changed-file set only. Do not broaden to
   unrelated files or use cleanup for broad refactors.
7.6. Regression re-verify. Rerun relevant tests, build, lint, typecheck, or
   manual checks. Read output, record evidence, and fix or roll back cleanup
   regressions before closeout.
8. Approval and closeout. Mark `boulder_active: false`, update
   `ralph-state.json`, apply `omc-cancel` semantics by clearing active Ralph
   state while preserving PRD/progress/run artifacts, update
   `PROJECT_CONTEXT.md` when required, and report evidence.
9. Rejection and retry. Write rejection notes to `progress.txt`, set affected
   stories back to `passes: false` when needed, add missing criteria if scope
   was incomplete, and loop back to Step 4 or Step 2.

## Tool Usage

- Use `omc-ultrawork` for independent implementation lanes.
- Use `omc-agents` to map roles to Codex native agent types.
- Use `omc-verify` or `verifier` for final evidence.
- Use `omc-ai-slop-cleaner` as a skill for cleanup, not as an agent role.
- Use `.codex/omc/runs/<run-id>/agents/` for role artifacts and
  `.codex/omc/runs/<run-id>/handoffs/` for phase summaries.

## Examples

Good PRD criterion: "Prompt text containing legacy flag words is sanitized
before execution" plus "validation command exits 0." Bad criterion:
"implementation is complete."

Good story verification: record the command, output result, and set
`passes: true` only after the evidence passes. Bad completion: "looks complete
and should work."

Bad retry behavior: the same test fails four times and the loop tries another
random change. Repeated failure needs `debugger`, `omc-trace`, or a blocker
report.

## Escalation And Stop Conditions

- Stop when the user says `stop`, `cancel`, `abort`, or `stopomc`.
- Stop when `ralph-state.json.stop_requested` is true.
- Stop on missing credentials, unavailable external services, contradictory
  requirements, or the same failure recurring three times.
- Do not stop after reviewer approval.

Polite-stop guard:

```text
Treating an APPROVED verdict as a reporting checkpoint is a polite-stop
anti-pattern. The chain Step 7 -> 7.5 -> 7.6 -> 8 must execute as a single
uninterrupted turn. The only reporting moments are Step 8 (cancel) or Step 9
(rejection).
```

## Boulder Soft Loop

Codex does not use a hook to force another iteration, so Ralph simulates the
boulder with explicit state:

1. After each iteration, write `ralph-state.json`.
2. Before Step 6 on every loop, read `ralph-state.json`.
3. Continue when `boulder_active` is true and no stop request exists.
4. Stop only through approved closeout, explicit user stop, or documented
   blocker.

## Final Checklist

- [ ] PRD exists under `.codex/omc/prd/`.
- [ ] Acceptance criteria are task-specific.
- [ ] All stories have `passes: true`.
- [ ] All original requirements are met without hidden scope reduction.
- [ ] Fresh verification output passes.
- [ ] Reviewer verification passed against PRD criteria.
- [ ] `omc-ai-slop-cleaner` ran on changed files or `--no-deslop` was present.
- [ ] Post-deslop regression verification passes.
- [ ] `ralph-state.json` records approved closeout.
- [ ] `PROJECT_CONTEXT.md` was updated when closeout applies.

## Background Execution Rules

Use background execution for long-running builds, installs, test suites, and
container operations when supported. Use foreground execution for status checks,
file reads, focused searches, edits, and narrow tests whose output must be read
immediately.
