# Benchmarks

This plugin uses a lightweight, Codex-native content benchmark to track whether
the workflow port remains useful and compatible without requiring model calls,
API keys, or extra packages.

## Hypothesis

If oh-my-codex is an effective Codex-native workflow port, then its local
content should preserve the core upstream OMC workflow surface, expose valid
Codex skills, map source roles to Codex-native agent types, avoid Claude-only
runtime assumptions, and keep cross-workflow references intact.

The benchmark measures that hypothesis with deterministic file scans. It does
not measure model answer quality or task completion rates.

## Commands

Run the smoke benchmark:

```powershell
node .\plugins\oh-my-codex-workflows\benchmarks\benchmark.mjs
```

Emit machine-readable output:

```powershell
node .\plugins\oh-my-codex-workflows\benchmarks\benchmark.mjs --json
```

Use strict mode when preparing a release or reviewing a broad workflow change:

```powershell
node .\plugins\oh-my-codex-workflows\benchmarks\benchmark.mjs --strict
```

Run the benchmark with the plugin validator:

```powershell
node .\plugins\oh-my-codex-workflows\benchmarks\benchmark.mjs
node .\plugins\oh-my-codex-workflows\scripts\validate-plugin.mjs
```

## Metrics

- Skill coverage vs source: compares Codex skill directories against the
  upstream skill set and reports Claude-runtime-heavy skills that were adapted
  as Codex workflow skills.
- Frontmatter validity: checks every Codex skill has YAML frontmatter with
  matching `name` and non-empty `description`.
- Codex compatibility scan: flags common Claude-only runtime patterns such as
  `Task(...)`, Claude agent APIs, Claude environment variables, slash-command
  references outside docs, and TODO placeholders.
- Role coverage: checks that the upstream role catalog is represented and each
  role declares a Codex native type, mission, and prompt addendum.
- Workflow integration references: checks that router, autopilot, team,
  ultrawork, ralph, review, and verify skills still reference the expected
  companion workflows or roles.
- Runtime context policy: checks that OMC activation gating, isolated
  sub-agent context, artifact handoff, `PROJECT_CONTEXT.md` closeout, and
  quality reporting remain documented in the runtime-facing skills.
- ASCII content: checks benchmarked Markdown, JSON, and Node files for ASCII
  text.

## Scoring

The benchmark prints a 0 to 100 score:

- `90-100`: passing smoke benchmark for normal development.
- `95-100`: expected range for strict release checks.
- Below threshold: inspect the failed metric details before claiming the plugin
  is benchmark-clean.

Weights:

- Skill coverage vs source: 20 percent.
- Frontmatter validity: 15 percent.
- Codex compatibility scan: 20 percent.
- Role coverage: 20 percent.
- Workflow integration references: 15 percent.
- Runtime context policy: 10 percent.
- ASCII content: 10 percent.

## Controls

- No network access.
- No API keys.
- No package installation.
- Node built-ins only.
- Deterministic input files from `plugins/oh-my-codex-workflows/` and
  `_source/oh-my-claudecode/`.

## Stopping Conditions

For normal development, stop when the smoke command exits successfully and the
validator passes. For release preparation, also run strict mode and resolve any
non-perfect metric unless there is an explicit documented port decision.
