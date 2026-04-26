# Local Codex Plugin Marketplace

This workspace contains a local Codex marketplace and one plugin:

- marketplace: `.agents/plugins/marketplace.json`
- plugin: `plugins/oh-my-codex-workflows`
- agent roles: `plugins/oh-my-codex-workflows/agents`
- upstream reference clone: `_source/oh-my-claudecode`

Validate the plugin:

```powershell
node .\plugins\oh-my-codex-workflows\scripts\validate-plugin.mjs
```

Add this marketplace to Codex:

```powershell
codex plugin marketplace add C:\Users\MinhHuong\Documents\codex_plugin
```

Then restart Codex and invoke skills by name, for example:

```text
Use omc-autopilot to build this feature end to end.
Use omc-agents to route this through architect, executor, and verifier roles.
Use omc-team with 3 workers to split this safely.
Use omc-verify to prove the change works.
```

For OMC-like global keyword behavior:

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
