---
name: omc-ask
description: OMC-style ask trigger for routing an advisor prompt to available model, connector, or CLI tools with captured evidence and honest fallbacks.
argument-hint: "<provider|tool> <question or task>"
---

# OMC Ask

Use this skill when the user asks to route a question to another model,
connector, CLI, or advisor-style tool, or explicitly invokes `omc-ask`, `ask`,
or "ask <provider>".

This is a Codex-native adaptation. Do not claim direct Claude, Gemini, or other
provider runtime access unless the current session exposes a matching connector,
tool, or installed local CLI and the user permits its use.

## Routing

1. Parse the requested advisor:
   - `codex`: use the current Codex reasoning path unless a separate Codex tool
     is explicitly available.
   - `claude`, `gemini`, or another provider: use only if a matching connector,
     MCP tool, or local CLI is available and authenticated.
   - unspecified provider: choose the best available connector or handle the
     request directly.
2. Check availability before invoking external tooling:
   - For connectors, use tool discovery when available.
   - For local CLIs, run the narrow version check such as `claude --version`,
     `gemini --version`, or provider-specific help/version commands.
   - For web or documentation lookups, confirm browsing/search tools are
     available and cite sources.
3. Capture evidence from every advisor response:
   - provider or tool name;
   - command or connector used, when safe to disclose;
   - timestamp or artifact path, if one is produced;
   - limitations, failures, or missing perspectives.
4. Synthesize the answer for the user. Do not paste raw advisor output without
   checking it for relevance, contradictions, and unsupported claims.

## Fallbacks

- If the requested provider is unavailable, say so plainly and continue with the
  best available Codex-native analysis unless the user asked to stop.
- If an availability check fails because authentication, network, or permissions
  are missing, report that condition and avoid pretending the advisor ran.
- If multiple advisors are available, keep prompts scoped and compare their
  outputs before making a recommendation.

## Output

Return:

- the provider or tool actually used;
- the main answer or recommendation;
- evidence captured, including artifact paths or citations when available;
- any unavailable advisors and the resulting uncertainty.
