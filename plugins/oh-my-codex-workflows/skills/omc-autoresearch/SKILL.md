---
name: omc-autoresearch
description: Run a bounded, evaluator-driven research or improvement loop with durable Codex workspace artifacts.
argument-hint: "[--mission-dir <path>] [--max-runtime <duration>] [--resume <run-id>]"
---

# OMC Autoresearch

Use this skill when the user asks for autoresearch, iterative research, or a
stateful single-mission improvement loop.

## Codex Boundary

Codex does not provide a hidden cron scheduler or autonomous background runtime
through this skill. Run work in the current session unless the user explicitly
approves an external scheduler, background process, or CLI worker.

## Contract

- One mission at a time.
- A mission must have an objective, success criteria, and evaluator.
- Evaluator output should be structured data with a required boolean `pass` and
  optional numeric `score`.
- Non-passing evaluations do not end the loop by themselves.
- Stop on max-runtime, user cancellation, evaluator pass if the mission defines
  pass as terminal, or another explicit terminal condition.

## Artifacts

Prefer workspace-local artifacts:

```text
.codex/omc/autoresearch/<mission-slug>/
  mission.md
  evaluator.json
  runs/<run-id>/
    evaluations/
      iteration-0001.json
    decision-log.md
```

Ask before writing outside the workspace. Do not store credentials in mission
artifacts.

## Workflow

1. Confirm the mission, evaluator, max-runtime, and artifact directory.
2. Create or resume the run directory.
3. For each iteration:
   - make one scoped research or implementation change;
   - run the evaluator;
   - save evaluation JSON;
   - append a markdown decision log entry with hypothesis, change, result, and
     next decision.
4. Continue until a stop condition is reached.
5. Summarize the best result, final evaluation, changed files, and remaining
   questions.

## External Research

Browse or use network tools only when the user asks for current external
information or the evaluator requires it. Cite sources when browsing is used.

## Scheduler Guidance

If the user wants periodic reruns, document a cron, Task Scheduler, or CI job
plan. Creating the schedule or writing system config requires approval.

## Completion

Report run ID, artifact path, iteration count, final pass/score, verification
performed, and any explicit stop reason.
