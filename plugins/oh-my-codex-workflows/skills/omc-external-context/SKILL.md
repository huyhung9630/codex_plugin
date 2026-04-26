---
name: omc-external-context
description: OMC-style external-context trigger for document-specialist research with source attribution, tool availability checks, and fallback behavior.
argument-hint: "<topic or question>"
---

# OMC External Context

Use this skill when the user asks for `external-context`, current external
documentation, web research, source-backed comparisons, API or library docs, or
outside references beyond the local repository.

Default role: `document-specialist`. Ground the answer in actual sources and
commands. Avoid promotional tone. Include examples only when useful.

## Availability Checks

Before researching:

- Prefer official documentation, standards, source repositories, release notes,
  and primary sources.
- Confirm search, browser, connector, or MCP research tools are available.
- If a specific connector or provider is requested, verify it exists before
  claiming it was used.
- For time-sensitive topics, browse or otherwise verify current information.

## Research Protocol

1. Decompose the query into 2-5 independent facets.
2. Assign document-specialist research lanes when parallel workers or connectors
   are available.
3. For each facet, collect:
   - source title;
   - URL or artifact path;
   - publication or version date when relevant;
   - short paraphrased finding;
   - uncertainty or freshness caveat.
4. Synthesize across facets and remove duplicate or low-quality sources.
5. Cite sources in the final answer.

## Facet Template

```markdown
### Facet <n>: <name>
- Search focus: <what to verify>
- Preferred sources: <official docs, specs, repo, paper, changelog>
- Exclusions: <sources to avoid or treat as secondary>
- Evidence needed: <version, date, quote, example, benchmark, etc.>
```

## Source Rules

- Use official or primary sources when the topic is technical, legal, medical,
  financial, or otherwise high stakes.
- Use direct quotes sparingly; paraphrase by default.
- Distinguish source-backed facts from synthesis or inference.
- Include links to sources used.
- If the source is inaccessible or stale, state that limitation.

## Fallbacks

- If web/search tools are unavailable, use local docs and clearly label the
  answer as not externally verified.
- If only secondary sources are available, lower confidence and say why.
- If the user asks for the latest information and it cannot be checked, do not
  guess. State what could not be verified.
- If facets disagree, report the disagreement with source attribution.

## Output

Use this structure when substantial research was performed:

```markdown
## External Context

### Key Findings
- <finding> [source]

### Facets
#### <facet name>
<summary with citations>

### Sources
- [Title](url) - <why used>

### Limits
- <unverified area, stale source, missing access, or uncertainty>
```
