---
name: omc-trace
description: OMC-style trace trigger for evidence-driven causal investigation with competing hypotheses.
argument-hint: "<observation or why-question>"
---

# OMC Trace

Use this skill when the user asks to trace, explain why something happened, or
investigate ambiguous behavior where the goal is causal evidence rather than an
immediate fix. Default role: `tracer`. Add `debugger`, `verifier`, or
`executor` only after the trace has a clear experiment, verification, or fix
boundary.

First resolve the orchestrator script, then create an orchestrator run:

```powershell
$omc = ".\plugins\oh-my-codex-workflows\scripts\omc-orchestrator.mjs"
if (-not (Test-Path $omc)) {
  $codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME ".codex" }
  $omc = Join-Path $codexHome "scripts\omc-orchestrator.mjs"
}
if (-not (Test-Path $omc)) { throw "omc-orchestrator.mjs not found; run install-global.mjs from the plugin repo" }
node $omc start --mode trace --task "<observation or why-question>"
```

Use the returned run id for lane artifacts, rebuttal artifacts, verification
evidence, status checks, and closeout.
Do not silently fall back to hand-written run folders when the global
orchestrator script exists.

## Good Entry Cases

Use trace when the problem is ambiguous, causal, evidence-heavy, best answered
by competing explanations, or likely to benefit from a rebuttal round. Examples
include runtime bugs, regressions, benchmark surprises, performance shifts,
architecture postmortems, config behavior, routing issues, orchestration
behavior, and experimental results.

## Core Tracing Contract

Always preserve these distinctions:

1. Observation: what was actually observed.
2. Hypotheses: deliberately different explanations.
3. Evidence for: facts that support each explanation.
4. Evidence against or gaps: facts that contradict it or remain missing.
5. Current best explanation: the leading causal chain and why it outranks
   alternatives.
6. Critical unknown: the missing fact that still matters most.
7. Discriminating probe: the cheapest experiment that would separate the top
   competing hypotheses.

Do not collapse into a generic fix loop, debugger summary, raw worker dump, or
certainty claim unsupported by evidence.

## Evidence Strength Hierarchy

Treat evidence as ranked, not flat. From strongest to weakest:

1. Controlled reproductions, direct experiments, or uniquely discriminating
   artifacts.
2. Primary source artifacts with tight provenance, such as logs, metrics,
   benchmark output, configs, git history, and file-line behavior.
3. Multiple independent sources converging on the same explanation.
4. Single-source code-path or behavioral inference.
5. Weak circumstantial clues such as timing, naming, stack order, or resemblance
   to prior bugs.
6. Intuition, analogy, or speculation.

Down-rank hypotheses that depend on lower tiers when stronger contradictory
evidence exists.

## Strong Falsification Rules

Every serious trace run must try to falsify its favorite explanation. For each
top hypothesis, collect evidence for and against it, state its distinctive
prediction, state what observation would be hard to reconcile with it, and name
the cheapest probe that discriminates it from the next-best alternative.

Down-rank a hypothesis when direct evidence contradicts it, it survives only by
adding assumptions, it makes no distinctive prediction, a stronger alternative
explains the same facts with fewer assumptions, or its support is mostly
circumstantial while a rival has stronger evidence tiers.

## Default Hypothesis Lanes

Unless the prompt suggests a better partition, use three lanes:

1. Code-path or implementation cause.
2. Config, environment, dependency, or orchestration cause.
3. Measurement, artifact, reproduction, or assumption mismatch cause.

Workers should pursue deliberately different explanations, not the same favored
theory in parallel.

## Cross-Check Lenses

Use these lenses when they can surface missed causes:

- Systems lens: queues, retries, backpressure, feedback loops, dependencies,
  boundary failures, and coordination effects.
- Premortem lens: assume the current best explanation is incomplete or wrong;
  ask what would embarrass the trace later.
- Science lens: controls, confounders, measurement bias, alternative variables,
  and falsifiable predictions.

## Codex Orchestration Shape

Small traces can run locally. Larger ambiguous traces use artifact lanes:

1. Create `.codex/omc/runs/<run-id>/manifest.json` with observation, lane list,
   context mode, and known evidence sources.
2. Create one `tracer` lane per hypothesis.
3. Require each lane to write
   `.codex/omc/runs/<run-id>/agents/lane-<n>.md`.
4. Keep each lane focused on one causal model.
5. Read all lane artifacts before ranking explanations.
6. Select the top two and run a rebuttal pass, locally or through
   `.codex/omc/runs/<run-id>/agents/rebuttal.md`.
7. Produce a synthesis that ranks, rebuts, and names the next probe.

## Worker Artifact Schema

```text
Lane: <lane id>
Hypothesis: <one precise causal explanation>
Observation Restated: <what the lane is explaining>
Evidence For:
- <fact plus source>
Evidence Against / Gaps:
- <fact, contradiction, or missing source>
Evidence Strength: <tier and reason>
Distinctive Prediction: <what this hypothesis predicts>
Critical Unknown: <single missing fact>
Best Discriminating Probe: <cheapest next check>
Confidence: <high|medium|low>
```

Useful sources include code, tests, configs, docs, logs, outputs, benchmark
artifacts, git history, and prior run artifacts.

## Leader Synthesis Contract

The final answer must synthesize rather than concatenate. Return:

1. Observed result.
2. Ranked hypotheses.
3. Evidence summary by hypothesis.
4. Evidence against or missing evidence.
5. Rebuttal round.
6. Convergence or separation notes.
7. Most likely explanation.
8. Critical unknown.
9. Recommended discriminating probe.
10. Additional trace lanes only if uncertainty remains high.

Preserve a ranked shortlist even if one explanation is dominant.

## Rebuttal Round And Convergence

Before closing, let the strongest non-leading lane present its best rebuttal,
force the leader to answer with evidence, re-rank if the rebuttal materially
weakens the leader, merge lanes that reduce to the same root mechanism, and keep
lanes separate when they imply different next probes.

Two lanes converge only when they identify the same root mechanism or when
independent evidence streams point to the same explanation. Similar wording is
not convergence.

## Down-Ranking Guidance

Say why a hypothesis moved down: contradicted by stronger evidence, missing its
predicted observation, requiring extra assumptions, explaining fewer facts,
losing the rebuttal round, or converging into a stronger parent explanation.

## Output Quality Bar

Good trace output is evidence-backed, concise but rigorous, skeptical of
premature certainty, explicit about missing evidence, practical about next
action, and clear about why weaker explanations were down-ranked.

## Example Final Synthesis

```markdown
### Observed Result
Benchmark output intermittently reports missing fixtures.

### Ranked Hypotheses
| Rank | Hypothesis | Confidence | Evidence Strength | Why it leads |
|------|------------|------------|-------------------|--------------|
| 1 | Fixture discovery races fixture generation | Medium | Primary artifacts plus timing inference | Explains intermittent misses |
| 2 | Path normalization differs between shells | Medium | Code-path inference | Explains platform-specific misses |
| 3 | Fixtures are absent from source | Low | Contradicted by file listing | Files are present before run |

### Evidence Against / Missing Evidence
- H1: no controlled reproduction yet.
- H2: no failing path captured from another shell.
- H3: contradicted by the source listing.

### Rebuttal Round
Path normalization could explain missing fixtures, but the same normalized path
succeeds after rerun, which favors ordering over a stable path bug.

### Most Likely Explanation
Fixture discovery can race fixture generation.

### Critical Unknown
Whether generation-first ordering eliminates the miss.

### Recommended Discriminating Probe
Run discovery only after generator completion and compare fixture counts across
three fresh runs.
```

## Handoff

Hand off to `debugger` if isolation is still needed, `executor` when root cause
and fix boundary are clear, or `verifier` when validating a suspected cause is
the next step. Include ranked hypotheses, top evidence, critical unknown, and
the exact discriminating probe in the handoff artifact.
