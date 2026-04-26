# Analysis: oh-my-codex-workflows vs oh-my-claudecode
> Updated: 2026-04-26

## Summary

The previous analysis identified three main gaps:

- missing workflow skills compared with `oh-my-claudecode`;
- `omc-autopilot` lacked resume, `ralplan`, and `ultraqa` depth;
- no benchmark existed to evaluate oh-my-codex effectiveness.

Those gaps have now been addressed in `plugins/oh-my-codex-workflows`.

## Current Coverage

### Agents

Complete. The plugin includes the 19 OMC role contracts:

`analyst`, `architect`, `code-reviewer`, `code-simplifier`, `critic`,
`debugger`, `designer`, `document-specialist`, `executor`, `explore`,
`git-master`, `planner`, `qa-tester`, `scientist`, `security-reviewer`,
`test-engineer`, `tracer`, `verifier`, `writer`.

Each role declares a Codex native type, mission, use cases, and prompt addendum.

### Skills

The plugin now includes 38 Codex-native skills:

- Core delivery: `omc-autopilot`, `omc-ralph`, `omc-ultrawork`, `omc-team`,
  `omc-plan`, `omc-ralplan`, `omc-ultraqa`, `omc-cancel`.
- Investigation and review: `omc-trace`, `omc-debug`, `omc-deep-dive`,
  `omc-deep-interview`, `omc-verify`, `omc-review`,
  `omc-ai-slop-cleaner`, `omc-visual-verdict`.
- Agent and routing layer: `omc-agents`, `omc-keywords`, `omc-reference`,
  `omc-ask`, `omc-ccg`, `omc-sciomc`, `omc-external-context`,
  `omc-autoresearch`.
- Knowledge and project workflows: `omc-remember`, `omc-wiki`,
  `omc-deepinit`, `omc-skill`, `omc-skillify`, `omc-learner`.
- Setup and operations: `omc-setup`, `omc-doctor`, `omc-mcp-setup`,
  `omc-project-session-manager`, `omc-configure-notifications`,
  `omc-teams`, `omc-hud`, `omc-release`.

All skills are Codex-native Markdown skill definitions. Claude-specific runtime
features are adapted as workflows, not copied as unavailable runtime code.

## Autopilot Improvements

`omc-autopilot` now includes:

- `level: 4` frontmatter;
- explicit do-not-use guidance;
- phase numbering aligned with upstream: expansion, planning, execution, QA,
  validation, cleanup;
- `omc-ralplan` detection for consensus-plan handoff;
- `omc-deep-interview` spec reuse;
- `omc-ultraqa` QA loop with 5-cycle max and 3-repeat same-failure stop;
- resume guidance from `.codex/omc` or `.omc` state;
- optional Codex-native config in `.codex/omc/config.jsonc` or
  `.omc/config.jsonc`;
- safe cleanup rules that preserve user-authored artifacts.

## Benchmark

Added:

- `plugins/oh-my-codex-workflows/benchmarks/benchmark.mjs`
- `plugins/oh-my-codex-workflows/BENCHMARKS.md`

The benchmark uses Node built-ins only and requires no API keys. It measures:

- skill coverage vs upstream core workflow surface;
- skill frontmatter validity;
- Codex compatibility scan for Claude-only patterns;
- role coverage;
- workflow integration references;
- ASCII content.

Commands:

```powershell
node .\plugins\oh-my-codex-workflows\benchmarks\benchmark.mjs
node .\plugins\oh-my-codex-workflows\benchmarks\benchmark.mjs --strict
node .\plugins\oh-my-codex-workflows\scripts\validate-plugin.mjs
```

Expected result after this update: validator passes and benchmark scores
100/100 in normal and strict modes.

## Intentional Non-Ports

The following upstream pieces remain intentionally not ported as runtime code:

- Claude Code slash-command runtime;
- Claude hook lifecycle scripts;
- Anthropic SDK runtime;
- tmux worker runtime;
- notification delivery runtime;
- MCP server implementations;
- prompt rewriting hooks.

Where useful, their workflows are represented as Codex-safe skills such as
`omc-hud`, `omc-teams`, `omc-configure-notifications`, `omc-mcp-setup`, and
`omc-doctor`.

## Status

- Agents: complete.
- Skills: complete as Codex-native workflow ports.
- Autopilot depth: upgraded.
- Benchmark: added.
- Remaining risk: benchmark checks local content quality, not live model
  task-completion quality.
