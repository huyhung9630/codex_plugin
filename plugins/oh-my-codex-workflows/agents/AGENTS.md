# OMC Agent Roles For Codex

These are Codex-native role contracts inspired by the upstream
`oh-my-claudecode/agents` catalog.

Codex currently exposes a small native sub-agent type set (`worker`,
`explorer`, `default`). This directory provides the missing role layer as prompt
contracts. OMC workflow skills should load the appropriate role text and include
it in spawned agent prompts.

## Native Type Mapping

| Role | Native type | Primary use |
| --- | --- | --- |
| `explore` | `explorer` | Read-only codebase reconnaissance |
| `analyst` | `explorer` or `default` | Requirements and product analysis |
| `architect` | `default` | Architecture decisions and boundaries |
| `planner` | `default` | Sequencing, task graph, rollout plan |
| `critic` | `default` | Challenge plans and weak assumptions |
| `executor` | `worker` | Scoped implementation |
| `debugger` | `worker` | Failure isolation and fixes |
| `designer` | `worker` | Product/UI implementation |
| `test-engineer` | `worker` | Tests and testability |
| `qa-tester` | `worker` or `default` | QA cycles and reproduction |
| `verifier` | `default` | Final verification evidence |
| `code-reviewer` | `default` | Findings-first quality review |
| `security-reviewer` | `default` | Security-sensitive review |
| `code-simplifier` | `worker` | Regression-safe cleanup |
| `tracer` | `explorer` | Causal tracing across systems |
| `scientist` | `default` | Experiment/evaluation design |
| `document-specialist` | `worker` | Documentation tasks |
| `writer` | `worker` | Narrative and user-facing prose |
| `git-master` | `worker` | Git/release hygiene |

## Lead Rules

- Role prompts do not replace Codex's native safety and editing rules.
- For write work, assign explicit file or module ownership.
- Tell every worker: "You are not alone in the codebase. Do not revert edits
  made by others. Adjust your implementation to accommodate concurrent changes."
- The lead remains responsible for integration and final verification.

