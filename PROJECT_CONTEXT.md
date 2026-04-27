# PROJECT OVERVIEW

- Project: local Codex plugin marketplace for `oh-my-codex-workflows`.
- Purpose: port practical workflow ideas from `_source/oh-my-claudecode` into
  Codex-native installable skills and role prompts.
- Target users:
  - Codex users who want OMC-style workflows: autopilot, ralph, ultrawork,
    team, consensus planning, QA loops, tracing, and verification.
  - Maintainers testing local Codex plugins before marketplace/global install.
- Core features:
  - 41 Codex skills under `plugins/oh-my-codex-workflows/skills/`.
  - 19 OMC-style agent role contracts under `plugins/oh-my-codex-workflows/agents/`.
  - Global skill installer: `scripts/install-global.mjs`.
  - Role prompt inspector: `scripts/role-prompt.mjs`.
  - Plugin validator: `scripts/validate-plugin.mjs`.
  - Deterministic benchmark: `benchmarks/benchmark.mjs`.
  - Runtime policy: `omc-runtime-policy` for activation decisions, isolated
    sub-agent context, artifact handoff, project memory updates, and quality
    reporting.

# ARCHITECTURE

- Tech stack:
  - Frontend: none.
  - Backend: none.
  - Database: none.
  - Runtime/tooling: Markdown skill files, JSON plugin manifests, Node.js
    scripts using built-in modules only.
- High-level structure:
  - `.agents/plugins/marketplace.json`: local marketplace entry.
  - `plugins/oh-my-codex-workflows/.codex-plugin/plugin.json`: Codex plugin
    manifest.
  - `plugins/oh-my-codex-workflows/skills/<skill>/SKILL.md`: one Codex skill
    per workflow.
  - `plugins/oh-my-codex-workflows/agents/*.md`: role contracts mapped to
    Codex native agent types.
  - `plugins/oh-my-codex-workflows/scripts/`: validation, role inspection, and
    global install utilities.
  - `plugins/oh-my-codex-workflows/benchmarks/`: local benchmark harness.
  - `_source/oh-my-claudecode/`: upstream reference clone.
- Data flow:
  - Codex reads marketplace -> plugin manifest -> skills directory.
  - Skill discovery exposes `SKILL.md` frontmatter and body to future sessions.
  - `install-global.mjs` copies plugin skills to `~/.codex/skills`.
  - `validate-plugin.mjs` checks manifest, skills, agent roles, and marketplace
    wiring.
  - `benchmark.mjs` compares plugin content against `_source` and local quality
    rules.

# CODING RULES

- Naming conventions:
  - Skill folders use `omc-*` names and frontmatter `name` must match folder.
  - Agent role files use lowercase kebab-case, e.g. `code-reviewer.md`.
  - Node scripts use `.mjs` and built-in Node modules.
- Folder structure:
  - Keep plugin code inside `plugins/oh-my-codex-workflows/`.
  - Keep local marketplace metadata inside `.agents/plugins/`.
  - Keep upstream reference read-only under `_source/oh-my-claudecode/`.
- Patterns used:
  - Markdown-first plugin design; behavior lives in skill instructions.
  - Codex-native adaptation instead of direct Claude runtime cloning.
  - Role-prompt routing: `omc-agents` maps roles to `worker`, `explorer`, or
    `default`.
  - Artifact-first sub-agent handoff: workers write results under
    `.codex/omc/runs/<run-id>/agents/`; the lead reads artifacts for synthesis.
  - Deterministic validation and benchmark scripts with no package installs.
- Editing expectations:
  - Preserve ASCII unless a file already requires non-ASCII.
  - Do not add Claude-only runtime assumptions to Codex skills.
  - Keep skills concise, action-oriented, and safe about external writes,
    credentials, network access, and destructive operations.

# API & DATA CONTRACTS

- No HTTP API and no database schema.
- Plugin manifest contract:
  - File: `plugins/oh-my-codex-workflows/.codex-plugin/plugin.json`.
  - Required fields checked by validator: `name`, `version`, `description`,
    `license`, `skills`.
  - `interface.defaultPrompt` must contain at most 3 strings, each <= 128 chars.
- Skill contract:
  - Each skill directory must contain `SKILL.md`.
  - Frontmatter must include matching `name` and non-empty `description`.
  - Optional fields include `argument-hint` and `level`.
- Agent role contract:
  - Each role file must include `Native type:`, `## Mission`, and
    `## Prompt Addendum`.
  - Native type must map to Codex-supported `worker`, `explorer`, or `default`.
- Marketplace contract:
  - `.agents/plugins/marketplace.json` must point to
    `./plugins/oh-my-codex-workflows`.
  - Plugin source must be local and include installation/authentication policy.
- Benchmark output contract:
  - `node .\plugins\oh-my-codex-workflows\benchmarks\benchmark.mjs --json`
    emits `benchmark`, `status`, `score`, `threshold`, `strict`, `checks`, and
    `controls`.

# KEY DECISIONS (WITH REASONS)

- Port workflows as Codex skills, not Claude runtime code.
  - Reason: Codex does not expose Claude slash commands, hooks, Task APIs, or
    `CLAUDE_PLUGIN_ROOT` runtime.
- Keep `omc-*` names for all ported skills.
  - Reason: avoids name collisions with system skills and makes OMC routing
    explicit in skill discovery.
- Fold upstream `setup` into `omc-setup`.
  - Reason: avoids duplicate non-prefixed skill while still covering upstream
    setup behavior.
- Add `omc-agents`, `omc-keywords`, and `omc-review` as Codex-only support
  skills.
  - Reason: upstream embeds this behavior in Claude prompts/agents; Codex needs
    visible skill routing.
- Add `omc-runtime-policy` as a Codex-only support skill.
  - Reason: OMC should be opt-in/materially useful, sub-agents should avoid
    consuming the lead context window, and every OMC run should produce
    artifacts, project memory, and quality telemetry.
- Add benchmark as deterministic file scan.
  - Reason: local quality can be measured without model calls, API keys, or
    package installation.
- Treat runtime-heavy upstream skills as workflow adaptations.
  - Reason: notification delivery, tmux workers, MCP server setup, HUD, and
    self-improve runtime loops require environment-specific approval and cannot
    be safely cloned as always-on behavior.

# CONSTRAINTS

- Performance:
  - Validation and benchmark should remain fast and deterministic.
  - Scripts should use Node built-ins only unless a future decision changes
    that contract.
- Security:
  - Do not run network installs, push branches, configure credentials, or write
    outside the workspace without explicit approval.
  - Benchmark must not require API keys.
  - Self-improvement workflows must require user confirmation before repeated
    benchmark execution.
- Business/project rules:
  - Plugin remains a Codex-native workflow pack, not a full upstream runtime
    clone.
  - Normal Codex is the default; OMC runs only when explicit or materially
    useful.
  - OMC sub-agents use isolated context by default and write result artifacts.
  - OMC closeout updates `PROJECT_CONTEXT.md` and reports latency/token/context
    telemetry when available.
  - `_source/oh-my-claudecode` is reference material, not the shipped plugin.
  - Restart Codex or reinstall marketplace/global skills after plugin edits.

# CURRENT STATE

- Completed:
  - Plugin version is `0.4.1`.
  - 41 Codex skills exist.
  - Upstream source skill coverage benchmark is 38/38.
  - 19 agent role contracts exist and validate.
  - `omc-autopilot` includes resume, `omc-ralplan`, `omc-ultraqa`, config, and
    cleanup guidance.
  - `omc-runtime-policy` defines activation gate, isolated sub-agent context,
    run artifacts, `PROJECT_CONTEXT.md` closeout, and quality reporting.
  - Runtime policy update artifact exists at
    `.codex/omc/runs/20260427-runtime-policy-update/`.
  - `BENCHMARKS.md` and `benchmarks/benchmark.mjs` are present.
  - `ANALYSIS.md` has been refreshed from the old gap report.
- Verification:
  - `node .\plugins\oh-my-codex-workflows\scripts\validate-plugin.mjs` passes.
  - `node .\plugins\oh-my-codex-workflows\benchmarks\benchmark.mjs --strict`
    passes with 100/100.
- In progress:
  - No active implementation lane.
- Known issues:
  - This workspace is not a Git repository, so `git status` and diffs are not
    available here.
  - Benchmark measures local content quality, not live model task-completion
    quality.
  - Exact token counts can only be reported when the Codex runtime exposes token
    accounting; otherwise reports must mark token usage as unavailable.
  - Latency is only exact when the run starts with explicit wall-clock
    measurement; otherwise reports must mark latency as unavailable.

# TODO / NEXT STEPS

- Run `node .\plugins\oh-my-codex-workflows\scripts\install-global.mjs` if the
  updated skills should be available globally in new Codex sessions.
- Restart Codex after plugin or global skill updates.
- Re-add local marketplace if Codex does not pick up the current path:
  `codex plugin marketplace remove local-codex-plugins`, then
  `codex plugin marketplace add C:\Users\MinhHuong\Documents\codex_plugin`.
- Add a live task-completion benchmark later if model-quality measurement is
  required.
- Keep `PROJECT_CONTEXT.md`, `ANALYSIS.md`, `README.md`, `EVALUATION.md`, and
  `BENCHMARKS.md` synchronized when workflow coverage changes.
