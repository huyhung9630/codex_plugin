# Codex Multi-Agent Orchestrator

This repository is a local Codex plugin marketplace that provides agent roles, skills, and workflows for multi-agent orchestration in Codex.

Core components:

- Local marketplace: `.agents/plugins/marketplace.json`
- Main plugin: `plugins/oh-my-codex-workflows`
- Agent roles: `plugins/oh-my-codex-workflows/agents`
- Skill workflows: `plugins/oh-my-codex-workflows/skills`
- Upstream reference clone: `_source/oh-my-claudecode`

The goal of this repository is to give Codex reusable orchestration patterns for delegating work across specialized roles such as architect, planner, executor, reviewer, verifier, debugger, and designer. The OMC workflows help Codex plan, implement, review, test, and verify software changes with a multi-agent style operating model.

## Add the Marketplace to Codex

Register this local marketplace with Codex:

```powershell
codex plugin marketplace add C:\Users\MinhHuong\Documents\codex_plugin
```

Then restart Codex so the plugin and skills are discovered.

## Validate the Plugin

Validate the plugin structure:

```powershell
node .\plugins\oh-my-codex-workflows\scripts\validate-plugin.mjs
```

Run the local benchmark:

```powershell
node .\plugins\oh-my-codex-workflows\benchmarks\benchmark.mjs --strict
```

## Usage

After adding the marketplace and restarting Codex, invoke skills by name:

```text
Use omc-autopilot to build this feature end to end.
Use omc-ralplan to create a consensus implementation plan.
Use omc-ultraqa to run QA test/fix cycles.
Use omc-runtime-policy to inspect OMC activation and context rules.
Use omc-agents to route this through architect, executor, and verifier roles.
Use omc-team with 3 workers to split this safely.
Use omc-verify to prove the change works.
```

Common workflows:

- `omc-autopilot`: handle a task from analysis through implementation and verification.
- `omc-ralplan`: produce a reviewed implementation plan before execution.
- `omc-team`: split work across multiple roles or workers.
- `omc-ultrawork`: coordinate higher-throughput parallel work.
- `omc-ultraqa`: run repeated test, diagnosis, and fix cycles.
- `omc-review`: perform quality review or code review.
- `omc-verify`: prove the result with concrete evidence.

## Enable Global OMC Keywords

Install OMC-style global keyword behavior:

```powershell
node .\plugins\oh-my-codex-workflows\scripts\install-global.mjs
```

Then restart Codex and use prompts like:

```text
autopilot build a todo app
ralph fix the failing tests
ulw fix all lint errors in parallel
ralplan plan the auth refactor
```

## Repository Scope

This is not an end-user application. It is a local Codex plugin marketplace and workflow toolkit for reusable multi-agent orchestration across software projects.
