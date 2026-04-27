---
name: omc-keywords
description: OMC-style magic keyword router for autopilot, ralph, ulw, ultrawork, ralplan, deepsearch, ultrathink, team, stopomc, cancelomc, and OMC mode selection.
argument-hint: "<magic keyword prompt>"
---

# OMC Magic Keywords

Use this skill when the user prompt contains an OMC-style magic keyword or asks
for behavior like upstream OMC. First apply `omc-runtime-policy`: route to an
OMC skill only when the mode materially helps. If no route is justified, handle
the task with normal Codex behavior.

## Activation Gate

- Explicit OMC keyword or mode request: route to the matching OMC skill.
- Clear need for multi-phase delivery, QA cycling, consensus planning, tracing,
  persistent fix/verify loops, or parallel agents: route to OMC.
- Direct question, small local edit, single-command check, or simple
  explanation: do not use OMC ceremony; continue normally.
- If sub-agents are used, they must follow `omc-runtime-policy`: isolated
  context by default, artifact handoff, `PROJECT_CONTEXT.md` closeout, and
  quality reporting.

## Routing

- `autopilot`, `auto pilot`, `build it end to end`, `handle everything`:
  use `omc-autopilot`.
- `stopomc`, `cancelomc`, `abort omc`, `cancel omc`:
  use `omc-cancel`.
- `ralplan`, `consensus plan`, `consensus planning`:
  use `omc-ralplan`.
- `ralph`, `keep going`, `until it works`, `do not stop until verified`:
  use `omc-ralph`.
- `ultraqa`, `qa loop`, `test fix repeat`:
  use `omc-ultraqa`.
- `ulw`, `ultrawork`, `maximum parallelism`, `parallel workers`:
  use `omc-ultrawork`.
- `team`, `multi-agent`, `workers`, `agents`:
  use `omc-team`, but only spawn sub-agents when the user explicitly asks for
  team/delegation/parallel work.
- `plan this`, `planning`:
  use `omc-plan`.
- `deep interview`, `ask me questions`, unclear high-cost idea:
  use `omc-deep-interview`.
- `deep dive`:
  use `omc-deep-dive`.
- `trace`, `causal trace`, `why did this happen`:
  use `omc-trace`.
- `debug omc`, `doctor`, `diagnose omc`:
  use `omc-debug` or `omc-doctor` depending on whether the target is a workflow
  session or plugin installation.
- `deepsearch`:
  do codebase-focused search first; use `explore`/`tracer` role contracts from
  `omc-agents` and report findings before editing.
- `ultrathink`:
  take a deeper architecture/reasoning pass; use `architect`, `critic`, or
  `scientist` roles as appropriate before acting.
- `ask claude`, `ask codex`, `ask gemini`, `ask another model`:
  use `omc-ask`.
- `ccg`, `claude codex gemini`, `tri-model`:
  use `omc-ccg`.
- `sciomc`, `scientist swarm`, `parallel scientists`:
  use `omc-sciomc`.
- `external context`, `find docs`, `research docs`:
  use `omc-external-context`.
- `remember`, `save this learning`:
  use `omc-remember`.
- `wiki`, `project wiki`, `knowledge base`:
  use `omc-wiki`.
- `self improve`, `self-improve`, `benchmark-driven improvement`:
  use `omc-self-improve`.
- `writer memory`, `character memory`, `scene memory`:
  use `omc-writer-memory`.
- `ai slop`, `clean slop`, `simplify this`:
  use `omc-ai-slop-cleaner`.
- `deepinit`, `initialize agents`, `create AGENTS.md`:
  use `omc-deepinit`.
- `skillify`, `learner`, `skill manager`:
  use `omc-skillify`, `omc-learner`, or `omc-skill`.
- `visual verdict`, `visual qa`, `screenshot compare`:
  use `omc-visual-verdict`.
- `release`, `prepare release`:
  use `omc-release`.
- `verify`, `prove it works`, `test this`:
  use `omc-verify`.
- `review`, `audit`, `critique`, `quality pass`:
  use `omc-review`.

## Codex Difference

There is no Claude Code hook rewriting the user prompt. This skill is the Codex
equivalent: it makes the keyword behavior visible in skill discovery and tells
the agent how to route the prompt.
