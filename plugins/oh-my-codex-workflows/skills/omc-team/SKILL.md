---
name: omc-team
description: OMC-style team trigger for "team", "multi-agent", "agents", "workers", or explicit parallel delegation; coordinated role-based Codex workflow.
argument-hint: "[N] <task>"
---

# OMC Team

Use this skill only when the user explicitly asks for a team, sub-agents,
delegation, multiple workers, or parallel work, or invokes `omc-team`.

## Lead Responsibilities

- Stay on the critical path locally.
- Decompose the task into independent work packets with disjoint write scopes.
- Spawn only bounded, materially useful sidecar tasks.
- Tell each worker they are not alone in the codebase, must not revert others'
  edits, and must adapt to concurrent changes.
- Review returned changes before integrating or relying on them.
- Run final verification locally.

## Workflow

1. Clarify the objective and constraints.
2. Inspect enough of the codebase to identify ownership boundaries.
3. Create a task plan with one in-progress item at a time.
4. Split work into packets:
   - Read-only discovery goes to `explorer`.
   - Implementation goes to `worker` with explicit file/module ownership.
   - Specialist behavior comes from the role contracts in `../../agents/`; use
     `omc-agents` to route roles such as `architect`, `executor`, `debugger`,
     `designer`, `test-engineer`, `security-reviewer`, and `verifier`.
   - Avoid overlapping write sets.
5. While agents run, do non-overlapping local work.
6. Wait only when their result blocks the next step.
7. Integrate, resolve conflicts, run verification, and close agents.

## Worker Prompt Requirements

Every code-edit worker prompt must include:

- the selected OMC role and its prompt addendum from `../../agents/<role>.md`;
- the exact files, directories, or module boundary it owns;
- the acceptance criteria;
- the verification command it should run if available;
- "You are not alone in the codebase. Do not revert edits made by others. Adjust
  your implementation to accommodate concurrent changes.";
- "Edit files directly and list changed paths in the final answer."

## Verification

Run the narrowest reliable checks first, then broader checks when risk demands
it. If workers ran checks, still run a final integration check locally before
claiming completion.
