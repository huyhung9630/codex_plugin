# Evaluation

Date: 2026-04-26

Source reviewed:

- `https://github.com/Yeachan-Heo/oh-my-claudecode`
- cloned commit: `c1cd5d0 chore(release): bump version to v4.13.4`

## Port Decision

The upstream repository contains a Claude Code plugin, Node CLI, hook runtime,
MCP server, HUD, notification scripts, agent prompts, and workflow skills. This
Codex plugin ports the practical workflow layer into Codex-native skills:

- mode selection and orchestration discipline;
- autopilot, consensus planning, QA cycling, tracing, cancellation, team,
  ultrawork, ralph, planning, interview, review, and verify workflows;
- setup, operations, knowledge, utility, research, and release-assistant
  workflows adapted to Codex-safe boundaries;
- 19 OMC-style agent role contracts mapped to Codex native sub-agent types;
- Codex-native sub-agent rules for explicit parallel/team requests.
- activation, context isolation, artifact handoff, project-memory closeout, and
  quality-report policy for OMC runs.
- a deterministic benchmark harness for local effectiveness checks.

It intentionally does not port Claude-specific hook scripts, slash-command
runtime, MCP server implementations, `CLAUDE_PLUGIN_ROOT` commands, tmux
worker runtime, notification delivery runtime, or Anthropic SDK runtime code.

## Checks Run

```powershell
node .\plugins\oh-my-codex-workflows\scripts\validate-plugin.mjs
```

Result after the OMC-like global install update:

```text
Plugin validation passed.
Validated oh-my-codex-workflows 0.4.1
```

The validator now also checks the `agents/` catalog, all 19 role files, native
type declarations, mission sections, and prompt addenda.

Role helper checks:

```powershell
node .\plugins\oh-my-codex-workflows\scripts\role-prompt.mjs list
node .\plugins\oh-my-codex-workflows\scripts\role-prompt.mjs show architect
```

Result: all 19 roles are listed, and `architect` renders its native type,
mission, use cases, and prompt addendum.

Global install check:

```powershell
node .\plugins\oh-my-codex-workflows\scripts\install-global.mjs
codex debug prompt-input 'autopilot build a todo app'
```

Result: `Available skills` includes the OMC skills from
`C:/Users/MinhHuong/.codex/skills/omc-*`, so new Codex sessions can route OMC
magic keywords through skill discovery.

Temporary install-path check with isolated `CODEX_HOME`:

```powershell
$env:CODEX_HOME = ".\_validation\codex-home"
codex plugin marketplace add C:\Users\MinhHuong\Documents\codex_plugin
```

Result:

```text
Added marketplace `local-codex-plugins` from \\?\C:\Users\MinhHuong\Documents\codex_plugin.
Installed marketplace root: \\?\C:\Users\MinhHuong\Documents\codex_plugin
```

Compatibility scan:

```powershell
rg -n "\[TODO:|marketplace upgrade|/oh-my-claudecode|Task\(|TeamCreate|CLAUDE_CODE" plugins\oh-my-codex-workflows .agents\plugins\marketplace.json
```

Only expected documentation/script mentions remain:

- upstream source URL in `README.md` and `NOTICE.md`;
- the explanatory `CLAUDE_PLUGIN_ROOT` non-port note in `README.md`;
- the validator's own TODO-placeholder detection code.

Benchmark checks:

```powershell
node .\plugins\oh-my-codex-workflows\benchmarks\benchmark.mjs
node .\plugins\oh-my-codex-workflows\benchmarks\benchmark.mjs --strict
```

Result after the benchmark integration:

```text
Benchmark: oh-my-codex-workflows-content-quality
Status: pass
Score: 100/100 (threshold 90)
- skill coverage vs source: 100/100 (38/38)
- frontmatter validity: 100/100 (41/41)
- runtime context policy: 100/100

Benchmark: oh-my-codex-workflows-content-quality
Status: pass
Score: 100/100 (threshold 95)
```

The benchmark is deterministic and requires no API keys or package installs. It
measures skill coverage vs the upstream source skill surface, skill
frontmatter validity, Codex compatibility, role coverage, workflow integration
references, runtime context policy coverage, and ASCII content.

## Residual Risk

- This is a workflow-skill plugin, not a full runtime clone of upstream OMC.
- Codex local marketplace refresh behavior is path-based; after edits, restart
  Codex or remove/add the marketplace entry again.
- Existing Codex sessions must be restarted after global install.
- The benchmark measures local content quality and compatibility, not live
  model task-completion quality.
