---
name: omc-team
description: OMC-style team trigger for "team", "multi-agent", "agents", "workers", or explicit parallel delegation; coordinated role-based Codex workflow.
argument-hint: "[N] <task>"
---

# OMC Team

Use this skill only when the user explicitly asks for a team, sub-agents,
delegation, multiple workers, or parallel work, or invokes `omc-team`. Apply
`omc-runtime-policy`: if a normal Codex local path is enough, do not use team
mode.

## Lead Responsibilities

- Stay on the critical path locally.
- Decompose the task into independent work packets with disjoint write scopes.
- Spawn only bounded, materially useful sidecar tasks.
- Use isolated sub-agent context by default; avoid full-history forks unless a
  worker cannot proceed without prior conversation details.
- Create `.codex/omc/runs/<run-id>/` and assign each worker a result artifact
  under `.codex/omc/runs/<run-id>/agents/`.
- Tell each worker they are not alone in the codebase, must not revert others'
  edits, and must adapt to concurrent changes.
- Read worker artifact files before integrating or relying on their results.
- Run final verification locally.
- Update `PROJECT_CONTEXT.md` and include a quality report before closeout.

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
5. Spawn each worker with a minimal prompt and an explicit artifact path.
6. While agents run, do non-overlapping local work.
7. Wait only when their result blocks the next step.
8. Read the artifact files, integrate, resolve conflicts, run verification, and
   close agents.

## Worker Prompt Requirements

Every code-edit worker prompt must include:

- the selected OMC role and its prompt addendum from `../../agents/<role>.md`;
- the exact files, directories, or module boundary it owns;
- the acceptance criteria;
- the verification command it should run if available;
- the artifact path it must write;
- "Use your own focused context. Read only the files needed for your owned
  task. Do not rely on the lead's full conversation context unless explicitly
  provided.";
- "You are not alone in the codebase. Do not revert edits made by others. Adjust
  your implementation to accommodate concurrent changes.";
- "Edit files directly. Write your result artifact. In your final answer, list
  changed paths, verification, blockers, and the artifact path."

## Artifact And Quality Closeout

- Each worker artifact must include role, context mode, owned paths, files read,
  files changed, verification, result, blockers, token usage if available, and
  latency if available.
- The lead's final response must report whether OMC was used, total latency if
  measured, worker count, context mode per worker, token usage if available, run
  artifacts, and verification outcome.
- Do not fabricate token counts. If unavailable, say the runtime did not expose
  token usage.

## Verification

Run the narrowest reliable checks first, then broader checks when risk demands
it. If workers ran checks, still run a final integration check locally before
claiming completion.
