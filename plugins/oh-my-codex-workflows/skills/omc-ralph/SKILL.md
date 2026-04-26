---
name: omc-ralph
description: OMC-style ralph trigger for "ralph", "keep going until it works", "do not stop until verified"; persistent verify/fix loop.
argument-hint: "<task>"
---

# OMC Ralph

Use this skill when the user asks for `omc-ralph`, "ralph", "keep going until it
works", "do not stop until verified", or a similar persistence requirement.

## Core Loop

1. Define completion criteria in concrete terms.
2. Make the smallest viable change.
3. Verify with fresh evidence.
4. If verification fails, identify the root cause and fix it.
5. Repeat until success, a hard blocker, or the repeated-failure limit.

Use the `verifier` role or `omc-verify` for the final evidence pass when the
change affects shared behavior, user-facing workflows, or security-sensitive
paths.

## Rules

- Default maximum is five verify/fix cycles unless the user says otherwise.
- If the same failure appears three times, stop and report it as a fundamental
  blocker with evidence.
- Do not hide partial success. State exactly which criteria pass and fail.
- Prefer fixing production code over weakening tests.
- Keep diffs scoped. Persistence is not permission for broad refactors.
- Update the task plan after each cycle on non-trivial work.

## Final Response

Report:

- completion criteria;
- changed files;
- verification commands and outcomes;
- remaining blockers or residual risk, if any.
