# PROJECT OVERVIEW

- Du an: local Codex plugin marketplace cho `oh-my-codex-workflows`.
- Chuc nang:
  - Port cac y tuong workflow thuc dung tu `_source/oh-my-claudecode` sang
    Codex-native skills, role prompts, va mot runtime orchestrator nhe.
  - Cung cap OMC-style workflows cho planning, team execution, persistence,
    parallel work, tracing, QA, review, verification, setup, va memory.
- Nguoi dung muc tieu:
  - Nguoi dung Codex muon workflow co cau truc ma khong phu thuoc Claude slash
    commands, hooks, hay native Team APIs.
  - Maintainer muon test local Codex plugins truoc khi cai qua marketplace hoac
    global skills.
- Tinh nang chinh:
  - 41 Codex skills trong `plugins/oh-my-codex-workflows/skills/`.
  - 19 role contracts trong `plugins/oh-my-codex-workflows/agents/`.
  - Orchestrator V1: `scripts/omc-orchestrator.mjs`.
  - Global installer: `scripts/install-global.mjs`.
  - Validator: `scripts/validate-plugin.mjs`.
  - Role prompt inspector: `scripts/role-prompt.mjs`.
  - Deterministic benchmark: `benchmarks/benchmark.mjs`.
  - Upstream fixture adapter: `benchmarks/upstream-adapter.mjs`.

# ARCHITECTURE

- Tech stack:
  - Frontend: khong co.
  - Backend: khong co.
  - Database: khong co.
  - Runtime/tooling: Markdown skills, Markdown agent roles, JSON manifests,
    Node.js `.mjs` scripts chi dung built-in modules.
- Cau truc tong quan:
  - `.agents/plugins/marketplace.json`: local Codex marketplace entry.
  - `plugins/oh-my-codex-workflows/.codex-plugin/plugin.json`: plugin manifest.
  - `plugins/oh-my-codex-workflows/skills/<skill>/SKILL.md`: workflow skills.
  - `plugins/oh-my-codex-workflows/agents/*.md`: role contracts map sang Codex
    native `worker`, `explorer`, hoac `default` agents.
  - `plugins/oh-my-codex-workflows/scripts/`: installer, validator, role
    inspector, va orchestrator.
  - `plugins/oh-my-codex-workflows/benchmarks/`: deterministic quality checks.
  - `_source/oh-my-claudecode/`: upstream reference read-only.
- Data flow:
  - Codex load marketplace -> plugin manifest -> skill frontmatter/body.
  - `install-global.mjs` copy skills, agents, scripts vao `~/.codex`.
  - OMC runs ghi durable state vao `.codex/omc/runs/<run-id>/`.
  - Worker ghi artifact trong `agents/`; lead doc artifact de synthesize.
  - Orchestrator ghi `manifest.json`, packet state, handoffs, verification
    logs, fix loop state, va closeout.

# CODING RULES

- Quy uoc ten:
  - Skill folders va frontmatter names dung `omc-*`.
  - Agent role files dung lowercase kebab-case, vi du `code-reviewer.md`.
  - Node scripts dung `.mjs`.
- Quy tac thu muc:
  - Code plugin shipped nam trong `plugins/oh-my-codex-workflows/`.
  - Marketplace metadata nam trong `.agents/plugins/`.
  - `_source/oh-my-claudecode/` chi la reference, khong sua de ship.
  - Run artifacts nam trong `.codex/omc/runs/<run-id>/`.
- Pattern dang dung:
  - Markdown-first skill design.
  - Codex-native adaptation thay vi clone truc tiep Claude runtime.
  - Role-prompt routing qua `omc-agents`.
  - Artifact-first sub-agent handoff.
  - Orchestrator V1 state machine de gate run co the audit duoc.
  - Validation va benchmark deterministic, khong can package install.
- Quy tac edit:
  - Giu ASCII tru khi file da can non-ASCII.
  - Khong them gia dinh Claude-only runtime vao Codex skills.
  - Khong dung upstream-only APIs trong shipped Codex skills, gom Claude slash
    commands, hooks, `TeamCreate`, `TaskCreate`, `SendMessage`,
    `CLAUDE_PLUGIN_ROOT`.
  - Skills phai ngan gon, operational, va an toan voi credentials, network
    access, destructive actions, external writes.

# API & DATA CONTRACTS

- Khong co HTTP API va khong co database schema.
- Plugin manifest:
  - File: `plugins/oh-my-codex-workflows/.codex-plugin/plugin.json`.
  - Version hien tai: `0.7.0`.
  - Required fields: `name`, `version`, `description`, `license`, `skills`.
  - `interface.defaultPrompt` toi da 3 strings, moi string <= 128 chars.
- Skill contract:
  - Moi skill directory co `SKILL.md`.
  - Frontmatter `name` phai khop folder name.
  - Frontmatter `description` phai khong rong va <= 240 chars.
- Agent role contract:
  - Moi role file co `Native type:`, `## Mission`, va `## Prompt Addendum`.
  - Native type phai map sang Codex-supported `worker`, `explorer`, hoac
    `default`.
- Orchestrator V1 contract:
  - `start` tao `.codex/omc/runs/<run-id>/manifest.json`.
  - `packet` dang ky work truoc khi execute voi lane, role, scope, subject,
    dependencies, va verification expectation.
  - `agent` dang ky worker completion va giu nguyen rich artifact neu da ton
    tai, tru khi truyen `--overwrite`.
  - `handoff` ghi stage decisions vao `handoffs/<stage>.md`.
  - `transition` enforce team stage order va yeu cau handoff cho previous stage,
    tru khi dung `--force` de recovery.
  - `verify` ghi command hoac evidence verification.
  - `fix` vao `team-fix` va tang `fix_loop_count`.
  - `close --status complete` yeu cau team run phai di qua `team-plan`,
    `team-exec`, va `team-verify`, co handoffs bat buoc, packets completed,
    worker artifacts ton tai, khong co failed/blocked/stale/partial workers,
    khong co failed verification, va co it nhat mot passing verification.
- Benchmark output:
  - `benchmark.mjs --json` emit `benchmark`, `status`, `score`, `threshold`,
    `strict`, `checks`, va `controls`.

# KEY DECISIONS (WITH REASONS)

- Port workflows thanh Codex skills, khong port Claude runtime code.
  - Ly do: Codex khong expose Claude slash commands, hooks, native Team APIs,
    hay Claude environment variables.
- Giu tat ca ported skills duoi prefix `omc-*`.
  - Ly do: tranh trung voi system skills va lam routing ro rang.
- Them `omc-orchestrator.mjs` lam V1 runtime gate.
  - Ly do: skills chi la instruction text; orchestrator state bien packets,
    artifacts, handoffs, verification, fix loops, va closeout thanh enforceable.
- Harden `omc-team` quanh packet va stage gates.
  - Ly do: V1 cu co the close sau khi sua manifest thu cong va chua chung minh
    day du history `team-plan -> team-exec -> team-verify`.
- `omc-team` worker intelligence do user quyet dinh khi prompt ghi ro
  `high`, `medium`, `low`, hoac `xhigh`; neu khong ghi thi dung runtime default.
  - Ly do: tranh ep chi phi/latency mac dinh; worker van doc lap theo packet va
    co the doc artifact/handoff cua nhau khi lead cho phep.
- Giu nguyen worker artifacts da ton tai trong `agent`.
  - Ly do: artifact do worker viet thuong giau thong tin hon compact metadata
    cua orchestrator, khong nen bi registration ghi de.
- Dung deterministic benchmarks thay vi live model benchmarks.
  - Ly do: local validation phai chay duoc khong can API keys, network calls,
    hay model variability.
- Giu `_source/oh-my-claudecode` read-only.
  - Ly do: day la upstream comparison source, khong phai shipped plugin.

# CONSTRAINTS

- Performance:
  - Validation va benchmark phai nhanh va deterministic.
  - Scripts chi dung Node built-ins tru khi co quyet dinh khac sau nay.
- Security:
  - Validation va benchmark khong can API keys.
  - Khong configure credentials, chay network installs, push branches, hoac ghi
    ra ngoai intended workspaces neu chua co user approval ro rang.
  - Khong dua secrets vao worker prompts hoac artifacts.
- Business/project rules:
  - Plugin van la Codex-native, khong phai full upstream Claude runtime clone.
  - Normal Codex la default; OMC chi activate khi explicit hoac materially
    useful.
  - OMC sub-agents dung isolated context theo default.
  - Team worker intelligence chi duoc override khi user ghi ro trong prompt;
    prompt chi co `team N worker` thi khong set `reasoning_effort`.
  - Team workers co the tham khao peer artifacts va handoffs duoc lead chi dinh;
    khong gia lap native worker-to-worker messaging neu runtime khong expose.
  - OMC closeout nen update `PROJECT_CONTEXT.md` va report artifacts,
    verification, context mode, token usage neu co, latency neu do duoc.
  - Restart Codex hoac reinstall global skills sau khi sua plugin.
- Runtime limits da biet:
  - Orchestrator V1 khong implement Claude native `TeamCreate`, `TaskList`,
    `SendMessage`, hoac `TeamDelete`.
  - Codex sub-agent lifecycle van phu thuoc Codex runtime tools; orchestrator
    gate state nhung chua so huu hoan toan worker process management.

# CURRENT STATE

- Da hoan thanh:
  - Plugin version `0.7.0`.
  - Co 41 skills va 19 agent roles.
  - Da restore skill density cho `omc-team`, `omc-ralph`, `omc-trace`, va
    `omc-ultrawork`.
  - Orchestrator V1 da hardened voi packet registry, stage order enforcement,
    artifact preservation, verification gates, va fix loop tracking.
  - Global install smoke da pass tu temporary workspace ben ngoai plugin repo
    bang `C:\Users\MinhHuong\.codex\scripts\omc-orchestrator.mjs`.
  - `omc-team` skill hien yeu cau command sequence:
    `start -> packet -> handoff -> transition -> agent -> verify -> close`.
  - `omc-team` parse worker intelligence tu prompt, vi du
    `team 20 worker medium` -> `reasoning_effort: medium`,
    `team 5 worker high` -> `reasoning_effort: high`; neu khong ghi thi de
    runtime default va van coordination qua peer artifacts, stage handoffs, va
    lead-mediated follow-up.
  - Global skills da sync lai bang `install-global.mjs` sau update
    user-controlled worker intelligence; can restart Codex de reload skill
    cache.
  - README, ANALYSIS, benchmark checks, va runtime policy references da update
    cho Orchestrator V1.
- Verification:
  - `node .\plugins\oh-my-codex-workflows\scripts\validate-plugin.mjs` pass.
  - `node .\plugins\oh-my-codex-workflows\benchmarks\benchmark.mjs --strict`
    pass voi 100/100.
  - `node .\plugins\oh-my-codex-workflows\benchmarks\benchmark.mjs --strict --json`
    pass.
  - `node .\plugins\oh-my-codex-workflows\benchmarks\upstream-adapter.mjs`
    pass voi 4/4 suites va 17/17 fixtures.
- Dang lam:
  - Khong co active implementation lane.
- Known issues:
  - Workspace co unrelated dirty/untracked local files duoi `.omc/` va local
    docs; khong revert neu user khong yeu cau ro.
  - Benchmark chi do local content quality, khong do live model task completion.
  - Exact token counts khong co neu Codex runtime khong expose accounting.
  - Latency khong co neu run khong record wall-clock timing tu dau.
  - Orchestrator da gan hon voi `oh-my-claude team` workflow, nhung van thieu
    native Claude team messaging/task APIs.

# TODO / NEXT STEPS

- Restart Codex sau global install de skill cache nhan skills moi nhat.
- Re-run `install-global.mjs` sau moi lan sua skill, agent, hoac script.
- Them live task-completion benchmark neu can do chat luong model.
- Chi them Orchestrator V2 neu can:
  - worker process registry;
  - stale worker detection;
  - reassignment;
  - resume command;
  - optional Codex CLI worker process spawning.
- Giu `PROJECT_CONTEXT.md`, `ANALYSIS.md`, `README.md`, `EVALUATION.md`, va
  `BENCHMARKS.md` dong bo khi workflow coverage hoac orchestrator behavior
  thay doi.
