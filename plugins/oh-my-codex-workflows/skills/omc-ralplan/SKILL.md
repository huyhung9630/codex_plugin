---
name: omc-ralplan
description: OMC-style ralplan trigger for consensus planning before execution; uses planner, architect, and critic or verifier roles to produce an approved implementation plan.
argument-hint: "[--interactive] [--deliberate] <task>"
---

# OMC Ralplan

Use this skill when the user asks for `ralplan`, consensus planning, or a
quality-gated plan before `omc-autopilot`, `omc-ralph`, or `omc-team`.

## Goal

Turn a broad or risky task into an implementation-ready plan that has been
checked from multiple viewpoints. Ralplan is planning only unless the user
explicitly approves a handoff to an execution skill.

## Consensus Flow

1. Scope the task: summarize the goal, constraints, likely files or modules,
   acceptance criteria, and missing decisions. Inspect the repo before asking
   questions about codebase facts.
2. Planner draft: create a practical plan with task boundaries, dependencies,
   file or module ownership, parallel work opportunities, and verification
   gates.
3. RALPLAN-DR summary: include 3-5 principles, the top 3 decision drivers, and
   at least 2 viable options with bounded tradeoffs. If only one option is
   viable, explain why the alternatives were rejected.
4. Architect review: use the `architect` role to evaluate system fit,
   sequencing, ownership boundaries, migration or rollback needs, and the
   strongest counterargument to the chosen approach.
5. Critic or verifier review: use `critic` for plan quality and tradeoff
   pressure, or `verifier` when the main risk is testability. This pass must
   check acceptance criteria, risk mitigation, concrete verification commands,
   and whether the plan is specific enough to execute.
6. Merge the plan: apply accepted review feedback, deduplicate changes, and
   produce one final plan. Include an ADR section with Decision, Drivers,
   Alternatives considered, Why chosen, Consequences, and Follow-ups.
7. Approval gate: in non-interactive mode, output the final plan and stop. In
   interactive mode, ask whether to approve, request changes, reject, or hand
   the approved plan to an execution skill.

Architect review must finish before critic or verifier review starts. Do not
run those two review passes in parallel because the second review should see
the architect's objections and tradeoffs.

## Deliberate Mode

Use deliberate mode when the user passes `--deliberate` or when the task
involves auth, security, migrations, destructive changes, production incidents,
compliance, PII, public API breakage, or high rework cost.

Deliberate plans add:

- A pre-mortem with 3 likely failure scenarios.
- An expanded test plan covering unit, integration, end-to-end, and
  observability checks where applicable.
- Explicit rollback or recovery steps for risky changes.

## State And Artifacts

Prefer lightweight workspace artifacts; do not require Claude-specific hooks,
slash commands, stop hooks, MCP tools, or runtime state APIs.

- Save durable plans under `.codex/omc/plans/` when the plan will be handed to
  another skill or reused later.
- Save exploratory notes or rejected options under `.codex/omc/drafts/` only
  when they materially help.
- Include enough context in the artifact for a fresh `omc-team`, `omc-ralph`,
  or `omc-autopilot` run to execute without redoing planning.
- If no artifact is needed, return the final plan in the response.

## Handoff Rules

- Hand to `omc-team` when the approved plan has independent work packets with
  disjoint write scopes and parallel verification.
- Hand to `omc-ralph` when the plan is sequential, failure-driven, or needs a
  tight implement-test-fix loop.
- Hand to `omc-autopilot` when the user wants the approved plan implemented
  end to end and the execution path can include planning, implementation, QA,
  and validation phases.
- Do not start implementation from ralplan unless the user explicitly asks to
  proceed after reviewing the plan.

## Pre-Execution Gate

Redirect vague execution requests through ralplan when they combine an
execution keyword such as `autopilot`, `ralph`, `team`, or `ultrawork` with an
underspecified goal such as "build the app", "improve this", "add auth", or
"make it better".

Do not redirect when the prompt includes a concrete anchor such as a file path,
issue or PR number, named symbol, stack trace, failing command, numbered steps,
acceptance criteria, code block, or an explicit bypass prefix like `force:` or
`!`.

## Final Checklist

- The plan has clear scope, assumptions, and non-goals.
- File or module ownership is named where possible.
- Dependencies and parallelizable work are explicit.
- Acceptance criteria are testable.
- Verification gates include concrete commands or manual checks.
- Risks have mitigations and rollback notes when relevant.
- Consensus feedback has been merged or explicitly rejected with rationale.
- The final output says whether to stop at planning or hand off to execution.
