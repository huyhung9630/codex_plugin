---
name: omc-verify
description: OMC-style verify trigger for "verify", "prove it works", "test this", or final validation before claiming completion.
argument-hint: "<change or goal>"
---

# OMC Verify

Use this skill when the user asks to verify, prove, test, validate, or when an
OMC workflow reaches its final quality gate.

Default role: `verifier`. Add `qa-tester`, `test-engineer`,
`security-reviewer`, or `code-reviewer` when the changed surface needs those
checks. Role contracts live in `../../agents/`.

## Verification Ladder

1. Static checks: formatting, linting, typecheck, diagnostics.
2. Unit tests for changed behavior.
3. Integration or end-to-end tests for cross-module behavior.
4. Manual runtime checks when automated coverage is unavailable.
5. Review of edge cases, rollback, and residual risk.

## Rules

- Discover the repo's existing commands before inventing new ones.
- Run fresh commands; do not rely on stale output.
- Use targeted checks for narrow changes and broader checks for shared behavior.
- If a check cannot run, say why and choose the next best evidence.
- Do not weaken tests to pass unless the test is demonstrably wrong and the user
  asked for that correction.

## Output

Summarize commands, pass/fail outcome, important logs, and remaining risk. For
failed checks, include the next concrete fix.
