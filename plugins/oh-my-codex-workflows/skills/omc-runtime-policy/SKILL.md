---
name: omc-runtime-policy
description: OMC runtime policy for plugin activation, isolated sub-agent context, artifact handoff, PROJECT_CONTEXT updates, and quality reporting.
argument-hint: "<task or OMC workflow>"
level: 4
---

# OMC Runtime Policy

Use this skill when deciding whether an OMC workflow should run, when an OMC
workflow creates sub-agents, or when reporting the quality/cost of an OMC run.

## Activation Gate

Default to normal Codex behavior. Use OMC only when it materially improves the
task.

Use normal Codex when:

- the user asks a direct question, explanation, or small one-step edit;
- a single local implementation path is clear;
- no OMC keyword, team request, persistence loop, or workflow mode is present;
- sub-agents would add overhead without reducing risk or latency.

Use OMC when:

- the user explicitly invokes an OMC mode or keyword;
- the task needs end-to-end delivery, consensus planning, QA loops, tracing,
  review, or persistent fix/verify cycles;
- the task can be split into independent lanes with disjoint ownership;
- the user asks for team, agents, workers, delegation, or parallel execution.

If OMC is not justified, continue with normal Codex and do not force plugin
ceremony.

## Run Artifacts

For every OMC-routed run, create a lightweight run directory:

```text
.codex/omc/runs/<YYYYMMDD-HHMMSS>-<mode>/
  manifest.json
  agents/
  quality.md
```

`manifest.json` should record:

- run id, mode, task summary, start time, and end time;
- activation decision and reason;
- whether sub-agents were used;
- context policy: `lead-local`, `agent-isolated`, or `agent-forked`;
- verification commands and outcomes.

## Sub-Agent Context Policy

Sub-agents must use their own focused context window by default.

- Do not fork the full conversation into a sub-agent unless the worker cannot
  complete the task without prior conversation details.
- Give each worker a small prompt containing only role contract, task, ownership,
  acceptance criteria, relevant file paths, verification command, and artifact
  path.
- Tell each worker to read only the files it needs for its owned task.
- Tell each worker to write its result to:
  `.codex/omc/runs/<run-id>/agents/<lane-id>.md`
- The lead should read the artifact files and make decisions from those files,
  not from long raw worker summaries.
- Worker final responses should be short: changed paths, verification, and the
  artifact path.

Use `agent-forked` only when the worker needs substantial conversation context.
Record the reason in `manifest.json` and `quality.md`.

## Worker Artifact Schema

Each worker artifact should contain:

```markdown
# <lane id>

- Role:
- Native agent type:
- Context mode: isolated|forked
- Task:
- Owned paths:
- Files read:
- Files changed:
- Verification:
- Result:
- Blockers:
- Token usage: exact <value>|unavailable <reason>
- Latency: <duration or unavailable>
```

Do not fabricate token counts. If Codex does not expose token accounting for a
worker, write `unavailable: runtime did not expose token usage`.

## PROJECT_CONTEXT Closeout

At the end of every OMC-routed run, update the repository-root
`PROJECT_CONTEXT.md`. Keep it concise and preserve these sections:

- `PROJECT OVERVIEW`
- `ARCHITECTURE`
- `CODING RULES`
- `API & DATA CONTRACTS`
- `KEY DECISIONS (WITH REASONS)`
- `CONSTRAINTS`
- `CURRENT STATE`
- `TODO / NEXT STEPS`

Only record durable project facts, decisions, verification results, known
issues, and next steps. Do not paste raw logs or long worker output.

## Quality Report

Every OMC-routed final response must include a compact quality report:

- OMC used: yes/no, mode, and activation reason.
- Latency: wall-clock elapsed time if measured; otherwise `unavailable`.
- Sub-agents: count, roles, and context mode for each.
- Context windows: `lead-only`, `agent-isolated`, or `agent-forked`.
- Token usage: exact values if the runtime exposes them; otherwise
  `unavailable` with a reason.
- Artifacts: run directory and worker result files.
- Verification: commands run and pass/fail result.

The quality report is operational telemetry, not a marketing score. Report
unknown values honestly.
