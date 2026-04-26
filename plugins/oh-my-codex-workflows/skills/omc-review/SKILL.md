---
name: omc-review
description: OMC-style review trigger for "review", "code review", "audit", "critique", or "quality pass"; findings-first review workflow.
argument-hint: "<target>"
---

# OMC Review

Use this skill when the user asks for review, critique, audit, quality pass, or
risk assessment.

Default role: `code-reviewer`. Add `security-reviewer` for auth, permission,
crypto, secrets, PII, uploads, payment, command execution, or network-boundary
changes. Role contracts live in `../../agents/`.

## Stance

Lead with bugs, regressions, missing tests, security issues, data-loss risks,
and maintainability problems that matter. Keep summaries secondary.

## Process

1. Identify the reviewed target: diff, files, plan, PR, or repo area.
2. Read surrounding code enough to understand intended behavior.
3. Check for correctness, edge cases, security, migration risk, concurrency,
   performance, accessibility, and test coverage as relevant.
4. Provide findings ordered by severity with file and line references.
5. Add open questions or assumptions.
6. Mention test gaps or verification not performed.

## Output

If there are findings, list them first. If there are no issues, say so clearly
and still report residual risk or tests not run.

Do not edit code during review unless the user explicitly asks for fixes.
