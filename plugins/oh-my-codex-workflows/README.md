# Oh My Codex Workflows

Codex-native workflow skills inspired by
[`oh-my-claudecode`](https://github.com/Yeachan-Heo/oh-my-claudecode).

This is not a direct Claude Code runtime port. The source project includes
Claude-specific slash commands, hooks, environment variables, MCP wiring, HUD
scripts, and Anthropic SDK code. This plugin ports the practical workflow
ideas into Codex skills that fit Codex's execution model.

## What Is Included

This version includes 41 Codex skills:

- Core delivery: `omc-autopilot`, `omc-ralph`, `omc-ultrawork`,
  `omc-team`, `omc-plan`, `omc-ralplan`, `omc-ultraqa`, `omc-cancel`.
- Investigation and review: `omc-trace`, `omc-debug`, `omc-deep-dive`,
  `omc-deep-interview`, `omc-verify`, `omc-review`,
  `omc-ai-slop-cleaner`, `omc-visual-verdict`.
- Agent and routing layer: `omc-agents`, `omc-keywords`,
  `omc-reference`, `omc-ask`, `omc-ccg`, `omc-sciomc`,
  `omc-external-context`, `omc-autoresearch`, `omc-runtime-policy`.
- Knowledge and project workflows: `omc-remember`, `omc-wiki`,
  `omc-writer-memory`, `omc-deepinit`, `omc-skill`, `omc-skillify`,
  `omc-learner`.
- Setup and operations: `omc-setup`, `omc-doctor`, `omc-mcp-setup`,
  `omc-project-session-manager`, `omc-configure-notifications`,
  `omc-teams`, `omc-hud`, `omc-release`, `omc-self-improve`.

It also includes a deterministic benchmark harness in `benchmarks/` for local
effectiveness checks.

## Runtime Policy

- Normal Codex is the default. OMC skills should run only when an explicit OMC
  keyword/mode is present or when the task benefits from planning, QA loops,
  tracing, persistence, review, or parallel workers.
- Sub-agents use isolated minimal context by default. Full-context forks should
  be exceptional and recorded with a reason.
- OMC workers write result artifacts to
  `.codex/omc/runs/<run-id>/agents/<lane-id>.md`; the lead reads those files
  for synthesis instead of relying on long raw worker messages.
- At OMC closeout, update repository-root `PROJECT_CONTEXT.md`.
- Final OMC responses include a quality report: activation decision, latency if
  measured, worker count, context mode, token usage if available, artifacts,
  and verification results.

## What Is Intentionally Not Included

- Claude Code slash commands such as `/team`, `/autopilot`, and `/ralph`.
- Claude hook lifecycle scripts using `CLAUDE_PLUGIN_ROOT`.
- The OMC Node CLI, tmux worker runtime, notification delivery runtime, and MCP
  server implementations.
- Claude-style prompt rewriting hooks. In Codex, OMC-like keyword behavior is
  implemented through globally installed skills and skill discovery.

## Agent Roles

This plugin now includes `agents/`, a Codex-native role catalog based on the OMC
agent model:

- analysis and planning: `analyst`, `architect`, `planner`, `critic`;
- implementation: `executor`, `debugger`, `designer`, `test-engineer`;
- validation: `qa-tester`, `verifier`, `code-reviewer`, `security-reviewer`;
- support roles: `explore`, `tracer`, `code-simplifier`, `scientist`,
  `document-specialist`, `writer`, `git-master`.

Codex does not currently expose arbitrary native plugin-defined agent types.
The equivalent is role-prompt routing: `omc-agents` maps each role to Codex's
native `worker`, `explorer`, or `default` sub-agent type and injects the role
contract into the spawned agent prompt.

List or inspect role contracts:

```powershell
node .\plugins\oh-my-codex-workflows\scripts\role-prompt.mjs list
node .\plugins\oh-my-codex-workflows\scripts\role-prompt.mjs show architect
```

## Install

From this workspace root:

```powershell
cd C:\Users\MinhHuong\Documents\codex_plugin
node .\plugins\oh-my-codex-workflows\scripts\validate-plugin.mjs
codex plugin marketplace add C:\Users\MinhHuong\Documents\codex_plugin
```

For a local marketplace, edits are read from this directory. Restart Codex after
changing plugin files so skill discovery sees the new contents. If you need to
reset the marketplace entry, remove and add it again:

```powershell
codex plugin marketplace remove local-codex-plugins
codex plugin marketplace add C:\Users\MinhHuong\Documents\codex_plugin
```

For OMC-like global keyword behavior, install the skills into `~/.codex/skills`:

```powershell
node .\plugins\oh-my-codex-workflows\scripts\install-global.mjs
```

## Usage

Use natural language with the skill name:

```text
Use omc-autopilot to build a REST API for task management.
Use omc-ralplan to create a consensus implementation plan.
Use omc-ultraqa to run test/fix QA cycles.
Use omc-agents to split this task into architect, executor, and verifier roles.
Use omc-team with 3 workers to refactor the auth module.
Use omc-ralph to fix the flaky checkout test until verification passes.
Use omc-deep-interview for my vague idea before implementation.
Use omc-review to review this patch for correctness and test gaps.
```

After the global installer, new Codex sessions can also use OMC-style keywords:

```text
autopilot build a todo app
ralph fix the failing tests
ulw fix all lint errors in parallel
ralplan plan the auth refactor
deepsearch for where login state is stored
ultrathink about this architecture
stopomc
```

The team and ultrawork skills only use Codex sub-agents when the prompt itself
is explicit about team, agents, delegation, or parallel execution. The lead
agent remains responsible for integration and final verification.

## Evaluation

The plugin includes `scripts/validate-plugin.mjs`, which checks:

- manifest JSON parses and has no scaffold placeholders;
- required manifest fields are present;
- `skills` points to a real directory;
- every skill folder has a `SKILL.md` with `name` and `description`;
- the agent role catalog and global installer exist;
- default prompts stay within Codex display limits;
- the local marketplace entry points back to this plugin;
- source attribution files exist.

Run it after every edit:

```powershell
node .\plugins\oh-my-codex-workflows\scripts\validate-plugin.mjs
```

The plugin also includes a benchmark that evaluates skill coverage, frontmatter
validity, Codex compatibility, role coverage, workflow references, and ASCII
content:

```powershell
node .\plugins\oh-my-codex-workflows\benchmarks\benchmark.mjs
node .\plugins\oh-my-codex-workflows\benchmarks\benchmark.mjs --strict
```

See `BENCHMARKS.md` for scoring and interpretation.

See `EVALUATION.md` for the checks already run on this version.
