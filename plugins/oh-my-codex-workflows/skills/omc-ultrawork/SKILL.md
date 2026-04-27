---
name: omc-ultrawork
description: OMC-style ultrawork trigger for "ultrawork", "ulw", "maximum parallelism", or "parallel workers"; high-throughput independent work lanes.
argument-hint: "<parallelizable task>"
---

# OMC Ultrawork

Use this skill when the user explicitly asks for `omc-ultrawork`, ultrawork,
maximum parallelism, many workers, or parallel execution. Apply
`omc-runtime-policy`: use normal Codex when parallelism would not materially
reduce latency or risk.

## Use When

- The work can be split by file, module, package, test area, or independent
  issue.
- Write ownership can be made disjoint.
- Parallel work will reduce elapsed time without creating integration risk.

## Do Not Use When

- The next step is a single blocking investigation.
- Multiple workers would need to edit the same files.
- The user asked for explanation, planning only, or a small focused change.

## Execution

1. Map the repo and identify independent lanes.
2. Assign each lane a named owner and write scope.
3. Create `.codex/omc/runs/<run-id>/` with `agents/` for worker artifacts.
4. Use `omc-agents` to assign an OMC role from `../../agents/` to each lane,
   then spawn workers for lanes that can proceed independently using isolated,
   minimal context by default.
5. Keep at least one useful local lane for the lead.
6. Have each worker write `.codex/omc/runs/<run-id>/agents/<lane-id>.md`.
7. Read artifacts and integrate returned changes one lane at a time.
8. Run final verification across the combined result.
9. Update `PROJECT_CONTEXT.md` and report quality telemetry.

## Lane Template

For each worker:

```text
Role: <executor|debugger|designer|test-engineer|document-specialist|...>
Role contract:
<paste the role Prompt Addendum from agents/<role>.md>

You own <files/modules>. Implement <specific outcome>.
Use your own focused context. Read only the files needed for this lane.
You are not alone in the codebase. Do not revert edits made by others.
Adjust your implementation to accommodate concurrent changes.
Run <verification> if available.
Write your artifact to .codex/omc/runs/<run-id>/agents/<lane-id>.md.
Edit files directly and list changed paths, verification, blockers, and the
artifact path in the final answer.
```

Stop using parallelism once integration becomes the bottleneck.

## Quality Report

Closeout must include worker count, latency if measured, context mode per
worker, exact token usage if the runtime exposes it, `unavailable` token usage
when it does not, artifact paths, and final verification status.
