---
name: omc-ccg
description: OMC-style Codex-native CCG trigger for multi-advisor orchestration across available tools, connectors, or CLIs with synthesis and fallbacks.
argument-hint: "<task>"
---

# OMC CCG

Use this skill when the user asks for `ccg`, "Claude-Codex-Gemini", multi-model
advice, or cross-model synthesis without launching a full OMC team.

CCG originally meant Claude, Codex, and Gemini. In Codex, treat it as a
multi-advisor pattern over the tools that are actually available in the current
session. Do not claim that Claude or Gemini ran unless a matching connector,
MCP tool, or authenticated local CLI was used.

## When To Use

- Architecture, implementation, and UX/documentation perspectives are all useful.
- The user wants fast external perspectives without a full team workflow.
- A risky decision benefits from independent critique and synthesis.
- The task asks for comparison, disagreement analysis, or model triangulation.

## Availability Checks

Before invoking advisors:

- Discover available connectors or MCP tools with tool discovery when possible.
- Check local CLIs only with narrow commands such as `claude --version`,
  `codex --version`, or `gemini --version`.
- Confirm network/search capability before using web-backed advisors.
- If a check requires approval, request it through the normal approval path.

## Execution Protocol

1. Decompose the task into advisor lanes:
   - Codex lane: correctness, architecture, implementation risks, tests.
   - External model lane: Claude, Gemini, or another available advisor, focused
     on an independent critique or alternative approach.
   - Documentation or UX lane: use document-specialist, web search, or another
     suitable available tool when relevant.
2. Run independent lanes in parallel when the available tools support it.
3. Capture evidence for each lane:
   - advisor/tool identity;
   - prompt focus;
   - artifact path, URL citations, or command summary;
   - failure or unavailability notes.
4. Compare results:
   - agreed recommendations;
   - conflicts or unsupported claims;
   - confidence level and why;
   - final chosen direction.
5. Return a synthesized answer, not a bundle of raw transcripts.

## Fallbacks

- If only Codex is available, perform a single-model analysis and label CCG
  external advisors as unavailable.
- If one external advisor is unavailable, continue with available lanes and note
  the missing perspective.
- If an advisor response lacks evidence, treat it as a suggestion, not a fact.

## Output

Use this structure:

```markdown
## CCG Synthesis

**Advisors used:** <actual tools/providers>
**Unavailable:** <requested but unavailable advisors, if any>

### Agreements
...

### Disagreements
...

### Final Direction
...

### Evidence
- <artifact, command summary, or citation>
```
