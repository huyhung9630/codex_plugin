---
name: omc-ultrawork
description: OMC-style ultrawork trigger for "ultrawork", "ulw", "maximum parallelism", or "parallel workers"; high-throughput independent work lanes.
argument-hint: "<parallelizable task>"
---

# OMC Ultrawork

Use this skill when the user explicitly asks for `omc-ultrawork`, ultrawork,
`ulw`, maximum parallelism, many workers, or parallel execution. Apply
`omc-runtime-policy`: use normal Codex when parallelism would not materially
reduce latency, risk, or context pressure.

First resolve the orchestrator script, then create an orchestrator run:

```powershell
$omc = ".\plugins\oh-my-codex-workflows\scripts\omc-orchestrator.mjs"
if (-not (Test-Path $omc)) {
  $codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME ".codex" }
  $omc = Join-Path $codexHome "scripts\omc-orchestrator.mjs"
}
if (-not (Test-Path $omc)) { throw "omc-orchestrator.mjs not found; run install-global.mjs from the plugin repo" }
node $omc start --mode ultrawork --task "<task>"
```

Use the returned run id for lane artifacts, verification, status checks, and
closeout. Do not claim success until the orchestrator `close --status complete`
command passes.
Do not silently fall back to hand-written run folders when the global
orchestrator script exists.

## Purpose

Ultrawork is the parallel execution protocol for independent work. It provides
intent grounding, lane sizing, role routing, artifact handoff, integration
discipline, and lightweight verification. It is not persistence; use
`omc-ralph` when the user wants "do not stop until verified."

## Use When

- Work can be split by file, module, package, test area, document, or issue.
- Write ownership can be made disjoint.
- Parallel context gathering or implementation will reduce elapsed time.
- The lead can integrate worker results without creating merge conflicts.

## Do Not Use When

- The next step is one blocking investigation or a single edit.
- Multiple workers would need to edit the same files.
- The user asked for explanation, planning only, or a narrow local change.
- The task needs guaranteed completion or a full lifecycle pipeline.

## Why This Exists

Sequential work wastes time when tasks are independent. Ultrawork lets the lead
launch independent lanes at once while keeping ownership explicit and evidence
auditable. Every lane must have a real scope, a role, an artifact path, and a
verification boundary.

## Execution Policy

- Fire independent lanes in the same wave; serialize only real dependencies.
- Keep the immediate critical path local and delegate sidecar work.
- Use `omc-agents` to select roles from `../../agents/`.
- Prefer isolated sub-agent context; fork full context only when required.
- Give every worker a disjoint write scope or make the lane read-only.
- Create `.codex/omc/runs/<run-id>/` and require artifacts under `agents/`.
- For non-trivial work, produce a dependency-aware wave plan first.
- Keep reports concise: summary, files, verification, blockers, context mode,
  token usage if available, latency if measured, and artifact path.
- Run final integration verification even when workers ran checks.

## Steps

1. Restate the objective and classify the work type.
2. Inspect enough of the repo to identify ownership boundaries.
3. Decide whether ultrawork is justified; if not, continue with normal Codex.
4. Build a lane map: id, role, scope, read/write mode, criteria, verification.
5. Build a wave plan: independent lanes now, dependent lanes later.
6. Create `.codex/omc/runs/<run-id>/manifest.json` with task, lanes, context
   mode, retry limits, and verification expectations.
7. Launch all independent lanes in the current wave.
8. Keep one useful local lane for the lead, such as integration or test setup.
9. Read worker artifacts before relying on worker summaries.
10. Integrate one lane at a time and resolve conflicts explicitly.
11. Run final verification across the combined result.
12. Update `PROJECT_CONTEXT.md` when OMC closeout applies.
13. Return the quality report.

## Lane Template

```text
Role: <executor|debugger|designer|test-engineer|document-specialist|verifier>
Role contract:
<paste the role Prompt Addendum from agents/<role>.md>

You own <files/modules>. Implement or investigate <specific outcome>.
Acceptance criteria:
- <criterion 1>
- <criterion 2>

Context mode: isolated sub-agent context unless explicitly stated otherwise.
Read only the files needed for this lane.
You are not alone in the codebase. Do not revert edits made by others.
Adjust your implementation to accommodate concurrent changes.
Run <verification> if available.
Write your artifact to .codex/omc/runs/<run-id>/agents/<lane-id>.md.
Edit files directly when this is a write lane.
In your final answer, list changed paths, verification, blockers, and artifact.
```

## Artifact Schema

Each lane artifact includes:

- role and context mode;
- owned scope and files read;
- files changed, or `none`;
- verification command and result, or why unavailable;
- result status: completed, blocked, partial, or no-op;
- blockers and next action;
- token usage if exposed, otherwise `unavailable`;
- latency if measured, otherwise `unavailable`.

## Examples

Good: `lane-api` owns `src/api/users/`, `lane-docs` owns `README.md`, and a
read-only `security-reviewer` checks auth boundaries. Ownership is disjoint and
review can run while implementation proceeds.

Good: Wave 1 explores schema and auth contracts; Wave 2 implements migration,
API handlers, and docs; Wave 3 runs `verifier` over the combined result.

Bad: three workers all "inspect the whole repo." That duplicates context and
creates redundant output.

Bad: two workers both edit `src/app.ts`. Integration risk erases the benefit of
parallelism.

## Escalation And Stop Conditions

- Stop using parallelism once integration is the bottleneck.
- Stop and ask when lane boundaries depend on missing requirements.
- Stop a lane that needs unapproved credentials, network writes, or destructive
  external actions.
- If a lane fails twice for the same reason, route to `debugger` or `verifier`
  instead of blind retrying.
- If verification fails after integration, hand off to `debugger` or switch to
  `omc-ralph` when persistence is explicitly needed.

## Final Checklist

- [ ] Objective and lane boundaries are explicit.
- [ ] Every worker has a role from `omc-agents`.
- [ ] Every write lane has disjoint ownership.
- [ ] Every worker wrote an artifact under `.codex/omc/runs/<run-id>/agents/`.
- [ ] Lead read artifacts before synthesis.
- [ ] Integrated result was verified locally.
- [ ] `PROJECT_CONTEXT.md` was updated when closeout applies.

## Quality Report

Report OMC mode, activation reason, run id, artifact paths, worker count, lane
names, context mode per worker, token usage if available, latency if measured,
verification commands, outcomes, blockers, and residual risk.

## Relationship To Other Modes

`omc-ralph` includes ultrawork as a parallel execution layer and adds PRD
tracking, persistence, and reviewer approval. `omc-autopilot` adds the full
lifecycle around Ralph. Use ultrawork for throughput, Ralph for persistence,
and autopilot for end-to-end delivery.
