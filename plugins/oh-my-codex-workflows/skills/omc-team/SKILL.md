---
name: omc-team
description: OMC-style team trigger for "team", "multi-agent", "agents", "workers", or explicit parallel delegation; coordinated role-based Codex workflow.
argument-hint: "[N] <task>"
---

# OMC Team

Use this skill only when the user explicitly asks for a team, sub-agents,
delegation, multiple workers, parallel work, or invokes `omc-team`. Apply
`omc-runtime-policy`: if normal Codex is enough, do not use team mode.

First resolve the orchestrator script, then create an orchestrator run:

```powershell
$omc = ".\plugins\oh-my-codex-workflows\scripts\omc-orchestrator.mjs"
if (-not (Test-Path $omc)) {
  $codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME ".codex" }
  $omc = Join-Path $codexHome "scripts\omc-orchestrator.mjs"
}
if (-not (Test-Path $omc)) { throw "omc-orchestrator.mjs not found; run install-global.mjs from the plugin repo" }
node $omc start --mode team --task "<task>"
```

Use the returned run id for every worker artifact, handoff, transition,
verification, status check, and closeout. Do not close a successful team run
until the orchestrator `close --status complete` command passes.
Do not silently fall back to hand-written run folders when the global
orchestrator script exists.

Minimum orchestrator command sequence for a successful team run:

```powershell
node $omc packet --run <run-id> --lane <lane> --role <role> --scope "<paths>" --subject "<work>" --verification "<check>"
node $omc handoff --run <run-id> --stage team-plan --next team-exec --decided "<decomposition>"
node $omc transition --run <run-id> --stage team-exec
node $omc agent --run <run-id> --lane <lane> --role <role> --scope "<paths>" --status completed --changed "<paths>" --verification "<evidence>"
node $omc handoff --run <run-id> --stage team-exec --next team-verify --decided "<integration summary>"
node $omc transition --run <run-id> --stage team-verify
node $omc verify --run <run-id> --name <check> --command "<command>"
node $omc status --run <run-id>
node $omc close --run <run-id> --status complete --reason "<verified outcome>"
```

If verification fails, run `node $omc fix --run <run-id> --reason "<why>"`,
create fix packets, execute them, transition back through `team-exec` and
`team-verify`, then close only after gates pass.

## Lead Responsibilities

- Stay on the critical path locally.
- Decompose the task into independent work packets with disjoint write scopes.
- Spawn only bounded, materially useful sidecar tasks.
- Treat any user-provided worker count as a maximum budget, not a quota.
- Parse worker intelligence from the user's team request when present, such as
  `high`, `medium`, `low`, or `xhigh`.
- Leave worker reasoning unset when the user did not request an intelligence
  level; record it as `unspecified/runtime default`.
- Use isolated sub-agent context by default; avoid full-history forks unless a
  worker cannot proceed without prior conversation details.
- Create `.codex/omc/runs/<run-id>/` and assign each worker a result artifact
  under `.codex/omc/runs/<run-id>/agents/`.
- Write stage handoffs under `.codex/omc/runs/<run-id>/handoffs/`.
- Tell every worker they are not alone in the codebase, must not revert others'
  edits, and must adapt to concurrent changes.
- Read worker artifacts before integrating or relying on their results.
- Run final verification locally.
- Update `PROJECT_CONTEXT.md` and include a quality report before closeout.

## Workflow

1. Clarify the objective and constraints.
2. Inspect enough of the codebase to identify ownership boundaries.
3. Decide whether sub-agents are justified. If the task has a clear single
   local path, use 0 workers and complete it locally.
4. Size the team from the work, not from the requested number:
   - A numeric prompt such as "team with 20 workers" means "use up to 20
     workers if justified".
   - Worker count must be no greater than the number of independent,
     non-overlapping lanes with useful work.
   - Prefer 0 workers for small tasks, 1-2 workers for focused sidecar discovery
     or verification, 3-5 workers for separable modules, and more than 5 only
     when the repo has many independent packages or files.
   - Do not create filler lanes, duplicate discovery lanes, or one-worker-per-
     file lanes just to satisfy a requested count.
5. Create a task plan with one in-progress item at a time.
6. Split work into packets:
   - read-only discovery goes to `explorer`;
   - implementation goes to `worker` with explicit file or module ownership;
   - specialist behavior comes from role contracts in `../../agents/`;
   - use `omc-agents` to route roles such as `architect`, `executor`,
     `debugger`, `designer`, `test-engineer`, `security-reviewer`,
     `code-reviewer`, `planner`, `analyst`, `document-specialist`, and
     `verifier`;
   - avoid overlapping write sets.
7. Register each work packet with `node $omc packet` before spawning workers.
8. Write a `team-plan` handoff and transition to `team-exec`.
9. Spawn each worker independently with the requested intelligence if specified,
   a minimal prompt, and an explicit artifact path.
10. While agents run, do non-overlapping local work.
11. Wait only when a result blocks the next step.
12. Register worker completion with `node $omc agent`; this preserves existing
    worker artifacts instead of overwriting them.
13. Write a `team-exec` handoff, transition to `team-verify`, run
    `node $omc verify`, then close through `node $omc close`.
14. Read artifacts, integrate changes, resolve conflicts, run verification, and
    close agents that are no longer needed.

## Staged Pipeline

Team execution follows this mental model:

```text
team-plan -> team-prd -> team-exec -> team-verify -> team-fix
```

The pipeline is a lead-managed artifact workflow. Each stage produces a handoff
before the next stage starts.

### Stage Routing

| Stage | Required roles | Optional roles | Use when |
|-------|----------------|----------------|----------|
| team-plan | `explore`, `planner` | `analyst`, `architect` | The repo or task boundary needs decomposition. |
| team-prd | `analyst` | `critic`, `planner` | Acceptance criteria or scope are unclear. |
| team-exec | `executor` | `debugger`, `designer`, `writer`, `test-engineer`, `document-specialist` | Implementation, docs, tests, and focused fixes. |
| team-verify | `verifier` | `test-engineer`, `security-reviewer`, `code-reviewer`, `architect` | Result must be checked against criteria and risk. |
| team-fix | `executor` | `debugger`, `test-engineer` | Verification found defects or incomplete criteria. |

Team worker intelligence is controlled by the user prompt, including explorer,
worker, and default native sub-agent types used as team lanes. Parse explicit
hints such as `team 20 worker medium`, `team 5 workers high`,
`team 3 agents intelligence low`, or `team 2 workers xhigh`. Map the hint to
the runtime's `reasoning_effort` or nearest equivalent. If no intelligence hint
is present, do not set `reasoning_effort`; use the runtime default and record
`unspecified/runtime default` in the worker artifact.

### Worker Intelligence And Coordination Policy

Team workers run independently by default. Independence means each worker has
explicit ownership, its own focused context, and a result artifact; it does not
mean workers are blind to useful shared outputs.

- Set worker intelligence only when the user requested it. Examples:
  `reasoning_effort: medium` for `team 20 worker medium`, and
  `reasoning_effort: high` for `team 5 worker high`.
- When no explicit intelligence appears in the prompt, leave the runtime
  reasoning setting unset instead of choosing `high` or `medium`.
- If the requested intelligence is not supported by the runtime, use the nearest
  supported setting and record the fallback in the worker artifact.
- Keep `fork_context` off unless prior conversation context is required; use
  handoffs and artifacts for shared memory.
- Give workers the specific peer artifact or handoff paths they may read when
  their packet depends on another lane.
- Same-wave workers may read already-created peer artifacts if they exist, but
  must not wait indefinitely on artifacts that are not ready; they should report
  the dependency as a blocker.
- For collaborative work, the lead coordinates through artifacts, stage
  handoffs, and follow-up messages that reference another worker's artifact.
  Workers must not perform lead orchestration or spawn additional workers.
- Dependent packets should start after their required artifact or handoff exists
  unless the lead intentionally runs them speculatively with the dependency
  recorded.

### Stage Entry And Exit Criteria

`team-plan`

- Entry: team invocation is accepted and the lead has initial repo context.
- Exit: decomposition is complete, dependencies are known, and a runnable task
  graph exists.

`team-prd`

- Entry: scope, acceptance criteria, or boundaries are unclear.
- Exit: criteria and boundaries are explicit enough for implementation.

`team-exec`

- Entry: packets have owners, scopes, and artifact paths.
- Exit: execution artifacts are complete or blocked with evidence.

`team-verify`

- Entry: the execution pass has ended.
- Exit pass: verification gates pass with no required follow-up.
- Exit fail: fix packets are generated and control moves to `team-fix`.

`team-fix`

- Entry: verification found defects, regressions, or incomplete criteria.
- Exit: fixes are complete and flow returns to `team-exec` then
  `team-verify`.

### Verify/Fix Loop

Continue `team-exec -> team-verify -> team-fix` until:

1. verification passes and no required fix packets remain;
2. the run reaches a documented blocked state; or
3. fix attempts exceed `max_fix_loops`.

Default `max_fix_loops` is 3. Record the value in
`.codex/omc/runs/<run-id>/manifest.json`.

### Stage Handoff Convention

Before transitioning stages, the lead writes:

```text
.codex/omc/runs/<run-id>/handoffs/<stage>.md
```

Handoff format:

```markdown
## Handoff: <current-stage> to <next-stage>
- Decided: <key decisions made in this stage>
- Rejected: <alternatives considered and why>
- Risks: <risks for the next stage>
- Files: <key files created, read, or modified>
- Remaining: <items for the next stage>
```

Handoff rules:

- The lead reads the previous handoff before prompting the next stage.
- Verify can read all prior handoffs to recover decision history.
- Handoffs are short, usually 10-20 lines.
- Handoffs survive cancellation and resume attempts.

## Phase Details

Parse the requested worker count as an upper bound, extract the task, and detect
whether the work needs planning, PRD refinement, execution, review, or a
verify/fix loop.

Use local reads and, when justified, `explore`, `planner`, or `architect`
artifacts to break work into file-scoped, module-scoped, package-scoped, or
read-only packets. Each packet needs dependencies, role, owned paths, artifact
path, and verification expectation. Write packets must not overlap.

Create `.codex/omc/runs/<run-id>/manifest.json` through the orchestrator:

```json
{
  "mode": "omc-team",
  "task": "<task>",
  "current_stage": "team-plan",
  "max_fix_loops": 3,
  "fix_loop_count": 0,
  "packets": [],
  "workers": [],
  "handoffs": [],
  "status": "active"
}
```

Update `current_stage`, `fix_loop_count`, packet list, worker list, and
terminal status only through orchestrator commands. Register packets with:

```powershell
node $omc packet --run <run-id> --lane exec-api --role executor --scope "src/api/users/" --subject "Implement user API validation" --verification "npm test -- users"
```

Pre-assign owners in the lead plan before spawning workers. Workers should not
race to claim the same work. Spawn independent workers in the same wave. Each
worker receives:

- selected OMC role and prompt addendum;
- owned paths or read-only scope;
- acceptance criteria;
- dependency notes;
- peer artifact and handoff paths it may read, when relevant;
- verification command or evidence request;
- artifact path;
- worker intelligence request or `unspecified/runtime default`;
- concurrency warning;
- final answer requirements.

Do not spawn workers for dependent packets until blockers are resolved. The lead
monitors through artifacts and worker final answers:

- read artifacts as they complete;
- record completed, blocked, failed, or partial status in the manifest;
- do not integrate a write lane until its artifact is available;
- if a worker is blocked, decide whether to unblock, reassign, retry, or stop;
- if a worker edits outside ownership, inspect carefully before accepting the
  change;
- after each wave, write a handoff for the next stage.

When all real work is complete:

1. Read all worker artifacts.
2. Run final local verification.
3. Register verification through `node $omc verify`.
4. Mark manifest status with `node $omc close`.
5. Close unneeded agents.
6. Update `PROJECT_CONTEXT.md` when required.
7. Report the OMC quality summary.

## Worker Preamble

Include this protocol in worker prompts and adapt it per lane:

```text
You are a TEAM WORKER for run "<run-id>".
Your worker name is "<worker-name>".
You are not the lead and must not perform lead orchestration.
The worker intelligence requested for this lane is:
<high|medium|low|xhigh|unspecified/runtime default>.
If specified, use `reasoning_effort: <value>` or the nearest supported
equivalent. If unspecified, do not override the runtime default.

== WORK PROTOCOL ==

1. OWNERSHIP
You own only: <owned paths or read-only scope>.
Do not edit outside this scope unless the lead explicitly expands it.

2. CONTEXT
Use isolated sub-agent context by default.
Read only the files needed for your owned task.
You may read lead-provided handoff paths and peer artifact paths when they are
relevant to your packet.

3. WORK
Complete the assigned packet directly.
Do not delegate to more workers.
If you need another worker's output and it is missing, report the dependency as
a blocker instead of waiting indefinitely or taking over that worker's scope.

4. CONCURRENCY
You are not alone in the codebase.
Do not revert edits made by others.
Adjust your implementation to accommodate concurrent changes.

5. ARTIFACT
Write .codex/omc/runs/<run-id>/agents/<worker-name>.md with:
- role;
- model or reasoning setting requested and used;
- context mode;
- owned scope;
- peer artifacts or handoffs read;
- files read;
- files changed;
- verification;
- result;
- blockers;
- token usage if available;
- latency if measured.

6. FINAL ANSWER
List changed paths, verification, blockers, and artifact path.
```

## Worker Prompt Requirements

Every code-edit worker prompt must include:

- selected OMC role and its prompt addendum from `../../agents/<role>.md`;
- requested worker intelligence if the user supplied one, mapped to
  `reasoning_effort: <value>` when supported; otherwise
  `unspecified/runtime default` with no reasoning override;
- exact files, directories, or module boundary it owns;
- acceptance criteria;
- peer artifact and handoff paths it may read, if the packet has dependencies;
- verification command it should run if available;
- artifact path it must write;
- "Use your own focused context. Read only the files needed for your owned
  task. Do not rely on the lead's full conversation context unless explicitly
  provided.";
- "You are not alone in the codebase. Do not revert edits made by others. Adjust
  your implementation to accommodate concurrent changes.";
- "Edit files directly. Write your result artifact. In your final answer, list
  changed paths, verification, blockers, and the artifact path."

## Artifact And Quality Closeout

- Each worker artifact must include role, model or reasoning setting requested
  and used, context mode, owned paths, peer artifacts or handoffs read, files
  read, files changed, verification, result, blockers, token usage if
  available, and latency if available.
- Register completion with `node $omc agent` after reading the artifact. The
  orchestrator must preserve an existing rich worker artifact; use `--overwrite`
  only when intentionally replacing a generated placeholder.
- The lead's final response must report whether OMC was used, total latency if
  measured, worker count, context mode per worker, token usage if available, run
  artifacts, and verification outcome.
- Do not fabricate token counts. If unavailable, say the runtime did not expose
  token usage.

## Idempotent Recovery

If the lead resumes after interruption:

1. Locate the latest matching `.codex/omc/runs/<run-id>/manifest.json`.
2. Read `current_stage`, terminal status, worker list, and handoffs.
3. Read all artifacts for completed workers.
4. Resume from the last non-terminal stage.
5. Do not create duplicate workers for packets already completed.
6. If a packet has no artifact and no active worker can be confirmed, mark it
   stale and decide whether to retry or reassign.

## Error Handling

- Failed packet: read the artifact, classify the failure, retry once with better
  context or reassign to `debugger`, and call `node $omc fix --run <run-id>
  --reason "<why>"` before starting the fix loop.
- Stuck packet: check for an artifact, follow up if the runtime allows, then
  mark stale and reassign or complete locally.
- Blocked dependency: keep dependent packets pending, finish unblocked packets,
  and update the handoff with the blocker and next probe.
- Overlapping edits: stop work on that path, inspect diffs manually, reconcile
  explicitly, and update worker guidance.

## Per-Role Provider Routing

Optional routing can be declared in `.codex/omc.toml` or
`.codex/omc.jsonc`. This is forward-compatible guidance; native multi-provider
spawn depends on runtime support.

Example shape:

```jsonc
{
  "team": {
    "defaults": { "provider": "codex" },
    "roleRouting": {
      "planner": { "provider": "codex" },
      "executor": { "provider": "codex" },
      "code-reviewer": { "provider": "codex" }
    }
  }
}
```

Routing rules:

- The lead may choose providers per role when available.
- The lead should fall back to Codex-native workers when provider support is
  unavailable.
- Team worker reasoning follows the explicit user request, for example
  `reasoning_effort: medium` for `team 20 worker medium` or
  `reasoning_effort: high` for `team 5 worker high`.
- Do not add a `reasoning_effort` override when the prompt only says
  `team N worker` without an intelligence level.
- Use `omc-ask` for non-Codex provider consultation when a connector or CLI is
  available and the user asked for that provider.
- Do not claim native multi-provider spawning unless the current runtime exposes
  it.

## Gotchas

1. Numeric worker requests are budgets, not quotas.
2. Overlapping write scopes usually erase the benefit of parallelism.
3. Read-only discovery lanes can still waste context if they duplicate each
   other.
4. Worker artifacts are the source of truth; chat summaries are not enough.
5. Stage handoffs should preserve decisions, rejected alternatives, risks, key
   files, and remaining work.
6. Verification is still the lead's responsibility after worker checks.
7. Secrets and credentials should not be placed in worker prompts or artifacts.

## Verification

Run the narrowest reliable checks first, then broader checks when risk demands
it. If workers ran checks, still run a final integration check locally before
claiming completion.

Closeout checklist:

- [ ] Team activation was justified.
- [ ] Worker count matched real independent lanes.
- [ ] Every worker had explicit ownership.
- [ ] Every worker wrote an artifact.
- [ ] Packets were registered through `node $omc packet`.
- [ ] Stage history includes `team-plan`, `team-exec`, and `team-verify`.
- [ ] Handoffs exist for `team-plan` and `team-exec`.
- [ ] Verify/fix loop stopped with pass, blocked evidence, or max loops.
- [ ] Final verification ran locally.
- [ ] `node $omc close --status complete` passed without manual manifest edits.
- [ ] `PROJECT_CONTEXT.md` was updated when OMC closeout applies.
