---
name: omc-ultrawork
description: OMC-style ultrawork trigger for "ultrawork", "ulw", "maximum parallelism", or "parallel workers"; high-throughput independent work lanes.
argument-hint: "<parallelizable task>"
---

# OMC Ultrawork

Use this skill when the user explicitly asks for `omc-ultrawork`, ultrawork,
maximum parallelism, many workers, or parallel execution.

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
3. Use `omc-agents` to assign an OMC role from `../../agents/` to each lane,
   then spawn workers for lanes that can proceed independently.
4. Keep at least one useful local lane for the lead.
5. Integrate returned changes one lane at a time.
6. Run final verification across the combined result.

## Lane Template

For each worker:

```text
Role: <executor|debugger|designer|test-engineer|document-specialist|...>
Role contract:
<paste the role Prompt Addendum from agents/<role>.md>

You own <files/modules>. Implement <specific outcome>.
You are not alone in the codebase. Do not revert edits made by others.
Adjust your implementation to accommodate concurrent changes.
Run <verification> if available.
Edit files directly and list changed paths in the final answer.
```

Stop using parallelism once integration becomes the bottleneck.
