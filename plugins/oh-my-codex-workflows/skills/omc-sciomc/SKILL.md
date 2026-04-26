---
name: omc-sciomc
description: OMC-style sciomc trigger for parallel scientist analysis, evidence capture, cross-validation, and synthesized research reports.
argument-hint: "<research goal>"
---

# OMC SciOMC

Use this skill when the user asks for `sciomc`, research orchestration,
parallel scientist analysis, hypothesis testing, benchmark design, or a
reproducible evidence-based comparison.

Default role: `scientist`. Role contract: define hypotheses, metrics, controls,
and stopping conditions. Prefer reproducible experiments. Report uncertainty and
avoid overstating results.

## Research Workflow

1. Define the research question and stopping condition.
2. Decompose the goal into 3-7 independent stages or hypotheses.
3. Assign parallel scientist analysis lanes where the available Codex tools or
   sub-agents support parallel work.
4. Collect structured evidence from each lane.
5. Cross-validate findings for contradictions, gaps, and weak evidence.
6. Synthesize a final report with limitations and confidence levels.

## Stage Template

Each stage should include:

- `Focus`: what this scientist lane investigates.
- `Hypothesis`: expected result or null hypothesis.
- `Metrics`: what counts as evidence, success, or failure.
- `Controls`: baseline, comparison group, or files intentionally excluded.
- `Scope`: files, sources, commands, datasets, or documents examined.
- `Stopping condition`: when enough evidence has been gathered.
- `Output`: findings, evidence, confidence, and uncertainty.

## Parallel Scientist Analysis

Use independent lanes for:

- file or subsystem partitioning;
- competing hypotheses;
- benchmark variants;
- literature or documentation facets;
- risk and limitation review.

When using OMC team workers, give each scientist a disjoint read or write scope
and the scientist prompt addendum from `../../agents/scientist.md`. If no
sub-agent or connector is available, simulate the same decomposition within the
current Codex turn and state that parallel workers were unavailable.

Suggested lane types:

- Low complexity: enumeration, counting, source collection.
- Medium complexity: pattern analysis, implementation comparison, docs review.
- High complexity: causal explanation, benchmark interpretation, conflict
  resolution, synthesis.

## Evidence Capture

Each finding should include:

```text
[FINDING:<id>] <title>
[EVIDENCE:<id>] <file path, command output summary, citation, or artifact>
[CONFIDENCE:<HIGH|MEDIUM|LOW>] <reason>
[LIMITATION:<id>] <known gap or uncertainty>
```

Prefer reproducible evidence:

- exact commands run;
- file paths and line references;
- URLs and source titles for external material;
- benchmark parameters and environment notes;
- negative results and failed checks.

## Verification And Synthesis

After stage completion:

- compare findings across lanes;
- flag contradictions before resolving them;
- rerun or narrow any lane with weak evidence when feasible;
- separate measured results from inference;
- include uncertainty and residual risk in the final report.

## Fallbacks

- If parallel agents are unavailable, run sequential staged analysis and say so.
- If required data, web access, or tools are unavailable, record the blocked
  evidence path and use the next best local evidence.
- If findings conflict and cannot be resolved, report the conflict rather than
  forcing a conclusion.

## Output

Return a concise research report:

- question and methodology;
- stage summary table;
- key findings with evidence and confidence;
- contradictions or unresolved gaps;
- recommendations or next experiments;
- exact verification commands or source citations used.
