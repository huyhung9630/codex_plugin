---
name: omc-agents
description: OMC-style agent role trigger for architect, executor, verifier, reviewer, designer, debugger, planner, critic, specialist agents, or role routing.
argument-hint: "[list|route|prompt] <task>"
---

# OMC Agents

Use this skill when the user mentions OMC agents, role routing, specialist
agents, or asks for work to be split by role.

## Important Codex Boundary

Codex plugins do not currently register arbitrary native agent types the way
Claude Code OMC registers agents such as `architect`, `executor`, or
`security-reviewer`. The equivalent implementation is:

1. choose a role from `../../agents/`;
2. choose the nearest Codex native sub-agent type: `worker`, `explorer`, or
   `default`;
3. include the role's "Prompt Addendum" in the spawned agent prompt;
4. assign explicit ownership and verification requirements.

## Available Roles

- `analyst`: requirements and ambiguity reduction.
- `architect`: technical approach and boundaries.
- `planner`: task graph and sequencing.
- `critic`: challenge plans before implementation.
- `explore`: read-only codebase reconnaissance.
- `executor`: scoped implementation.
- `debugger`: failure reproduction, isolation, and fix.
- `designer`: frontend/product UX implementation.
- `test-engineer`: tests and regression coverage.
- `qa-tester`: QA checklist and execution.
- `verifier`: final evidence gate.
- `code-reviewer`: findings-first quality review.
- `security-reviewer`: security-sensitive review.
- `code-simplifier`: regression-safe cleanup.
- `tracer`: causal investigation.
- `scientist`: experiments and evaluations.
- `document-specialist`: docs grounded in code.
- `writer`: prose and release/user text.
- `git-master`: git/release hygiene.

## Routing Table

| Need | Role | Native type |
| --- | --- | --- |
| requirements | `analyst` | `explorer` or `default` |
| architecture | `architect` | `default` |
| planning | `planner` | `default` |
| critique | `critic` | `default` |
| code discovery | `explore` or `tracer` | `explorer` |
| implementation | `executor` | `worker` |
| debugging | `debugger` | `worker` |
| UI | `designer` | `worker` |
| tests | `test-engineer` | `worker` |
| QA | `qa-tester` | `worker` or `default` |
| verification | `verifier` | `default` |
| review | `code-reviewer` | `default` |
| security | `security-reviewer` | `default` |
| cleanup | `code-simplifier` | `worker` |
| docs | `document-specialist` or `writer` | `worker` |
| git/release | `git-master` | `worker` |

## Spawn Prompt Template

```text
Role: <role name>
Native Codex sub-agent type: <worker|explorer|default>
Role contract:
<paste Prompt Addendum from agents/<role>.md>

Task:
<specific task>

Ownership:
<files/modules; read-only for explorer roles>

Coordination:
You are not alone in the codebase. Do not revert edits made by others. Adjust
your implementation to accommodate concurrent changes.

Verification:
<commands or checks>

Final response:
List changed paths if you edited files, verification performed, and blockers.
```

To inspect a role from the workspace, use:

```powershell
node .\plugins\oh-my-codex-workflows\scripts\role-prompt.mjs show <role>
```

## Workflow Integration

- `omc-team` and `omc-ultrawork` should route each lane through this catalog.
- `omc-autopilot` should use analyst -> architect/planner -> executor/designer/
  test-engineer -> verifier/reviewer roles.
- `omc-ralph` should use debugger/executor for fix cycles and verifier for the
  final gate.
- `omc-review` should use code-reviewer by default and security-reviewer when
  security-sensitive areas are involved.
