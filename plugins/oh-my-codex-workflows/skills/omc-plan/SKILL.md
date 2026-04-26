---
name: omc-plan
description: OMC-style planning trigger for "plan", "ralplan", "consensus plan", "planning", or "review this plan"; direct/consensus/review planning.
argument-hint: "[--direct|--consensus|--review] <task>"
---

# OMC Plan

Use this skill when the user asks for `omc-plan`, planning, implementation
strategy, consensus planning, or plan review.

## Modes

- Direct: produce a concise implementation plan from known requirements.
- Consensus: evaluate at least two viable approaches, pick one, and explain the
  tradeoff.
- Review: critique an existing plan for missing requirements, risky sequencing,
  insufficient verification, and overengineering.

## Output Shape

For planning-only requests:

1. Goal and assumptions.
2. Recommended approach.
3. Implementation steps.
4. Verification strategy.
5. Risks and decisions needed.

For requests that imply execution, plan briefly and then implement. Do not leave
the user with only a plan when they asked you to do the work.

## Quality Bar

- Plans must name concrete files, modules, commands, or discovery steps when
  possible.
- Avoid speculative architecture unless the codebase supports it.
- Include rollback or recovery notes for risky migrations.
- Verification must be specific enough to run.
