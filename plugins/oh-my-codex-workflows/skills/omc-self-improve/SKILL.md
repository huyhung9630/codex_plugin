---
name: omc-self-improve
description: Codex-native self-improvement loop for measured, benchmark-gated code evolution.
argument-hint: "<target repo, goal, and benchmark command>"
level: 4
---

# OMC Self Improve

Use this skill when the user asks for self-improvement, evolutionary code
improvement, benchmark-driven improvement, or autonomous iteration against a
clear metric.

## Purpose

Improve a target repository through repeated hypothesis, implementation,
benchmark, and selection cycles. Treat benchmark evidence as the source of
truth. Do not run an open-ended loop without explicit trust confirmation.

## Preconditions

- Target repository path is known and writable.
- User has confirmed the benchmark command because it executes code in the
  target repository.
- Goal, primary metric, direction, stop condition, and sealed files are defined.
- The benchmark can run without changing sealed evaluation files.

## State

Prefer workspace-local state:

- `.codex/omc/self-improve/<topic>/config/goal.md`
- `.codex/omc/self-improve/<topic>/config/settings.json`
- `.codex/omc/self-improve/<topic>/state/iteration-history/`
- `.codex/omc/self-improve/<topic>/tracking/results.json`

Use `.omc/self-improve/` only when the project already uses that convention.

## Workflow

1. Clarify the target metric, direction, baseline, stop conditions, and sealed
   files.
2. Run the benchmark once to establish a baseline.
3. Generate one or more hypotheses using `scientist`, `planner`, and
   `architect` roles.
4. Review hypotheses with `critic`; reject plans that change sealed files,
   weaken the benchmark, or lack a testable mechanism.
5. Implement approved plans in isolated branches or worktrees when available.
6. Run the benchmark for each candidate and record raw output.
7. Select the best candidate only if it improves or preserves the configured
   regression threshold.
8. Merge or keep the winning change; archive or discard losing candidates.
9. Repeat until target reached, plateau window reached, max iterations reached,
   benchmark is unreliable, or the user cancels.

## Safety Rules

- Never modify benchmark fixtures, scoring code, or sealed files unless the
  user explicitly changes the goal.
- Do not install packages, access network services, push branches, or open PRs
  without explicit approval.
- Stop if the benchmark is flaky enough that candidate ranking is not credible.
- If all candidates fail, record the failure and stop or ask whether to continue
  with a revised strategy.

## Evidence

Each iteration should record:

- hypothesis and files changed;
- benchmark command and raw result;
- before and after score;
- reason for accepting, rejecting, or reverting the candidate;
- residual risks and next hypothesis.

## Handoff

Use `omc-ralplan` before the first iteration when the goal is broad. Use
`omc-ultraqa` for candidate verification and `omc-verify` before reporting a
winning result.
