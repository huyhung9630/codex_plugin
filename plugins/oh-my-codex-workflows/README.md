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

It also includes:

- `scripts/omc-orchestrator.mjs`: a Codex-native V1 state-machine
  orchestrator for run manifests, work packets, worker artifacts, stage
  handoffs, verification gates, fix loops, and closeout.
- `benchmarks/`: deterministic local effectiveness checks.

## Runtime Policy

- Normal Codex is the default. OMC skills should run only when an explicit OMC
  keyword/mode is present or when the task benefits from planning, QA loops,
  tracing, persistence, review, or parallel workers.
- Sub-agents use isolated minimal context by default. Full-context forks should
  be exceptional and recorded with a reason.
- `omc-team` honors explicit worker intelligence hints such as `team 20 worker
  medium` or `team 5 worker high`; without a hint, it leaves worker reasoning at
  the runtime default.
- OMC workers write result artifacts to
  `.codex/omc/runs/<run-id>/agents/<lane-id>.md`; the lead reads those files
  for synthesis instead of relying on long raw worker messages.
- Team lanes coordinate through peer artifacts, stage handoffs, and
  lead-mediated follow-ups instead of shared full conversation context.
- The V1 orchestrator enforces completion gates: successful team closeout
  requires registered work packets, `team-plan -> team-exec -> team-verify`
  stage history, required handoffs, worker artifacts, no failed worker status,
  and at least one passing verification entry.
- At OMC closeout, update repository-root `PROJECT_CONTEXT.md`.
- Final OMC responses include a quality report: activation decision, latency if
  measured, worker count, context mode, token usage if available, artifacts,
  and verification results.

## What Is Intentionally Not Included

- Claude Code slash commands such as `/team`, `/autopilot`, and `/ralph`.
- Claude hook lifecycle scripts using `CLAUDE_PLUGIN_ROOT`.
- The upstream OMC Node CLI, tmux worker runtime, notification delivery runtime,
  and MCP server implementations.
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

## Orchestrator V1

Use the orchestrator when an OMC skill needs enforceable state instead of only
model-followed instructions:

```powershell
node .\plugins\oh-my-codex-workflows\scripts\omc-orchestrator.mjs start --mode team --task "refactor auth module"
node .\plugins\oh-my-codex-workflows\scripts\omc-orchestrator.mjs packet --run <run-id> --lane auth-exec --role executor --scope "src/auth" --subject "Refactor auth module" --verification "npm test -- auth"
node .\plugins\oh-my-codex-workflows\scripts\omc-orchestrator.mjs handoff --run <run-id> --stage team-plan --next team-exec --decided "auth packet assigned"
node .\plugins\oh-my-codex-workflows\scripts\omc-orchestrator.mjs transition --run <run-id> --stage team-exec
node .\plugins\oh-my-codex-workflows\scripts\omc-orchestrator.mjs agent --run <run-id> --lane auth-exec --role executor --scope "src/auth" --verification "tests pass"
node .\plugins\oh-my-codex-workflows\scripts\omc-orchestrator.mjs handoff --run <run-id> --stage team-exec --next team-verify --decided "auth packet complete"
node .\plugins\oh-my-codex-workflows\scripts\omc-orchestrator.mjs transition --run <run-id> --stage team-verify
node .\plugins\oh-my-codex-workflows\scripts\omc-orchestrator.mjs verify --run <run-id> --name auth-tests --command "npm test -- auth"
node .\plugins\oh-my-codex-workflows\scripts\omc-orchestrator.mjs status --run <run-id>
node .\plugins\oh-my-codex-workflows\scripts\omc-orchestrator.mjs close --run <run-id> --status complete
```

Supported modes are `team`, `ralph`, `trace`, and `ultrawork`. Run state lives
under `.codex/omc/runs/<run-id>/`. A `complete` team closeout fails unless the
manifest has packet registry entries, required stage history, handoffs for
completed stages, passing verification, and all registered worker artifacts.
If verification fails, use `fix --run <run-id> --reason "<why>"` to enter
`team-fix`; the orchestrator bounds retries with `max_fix_loops`.

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
