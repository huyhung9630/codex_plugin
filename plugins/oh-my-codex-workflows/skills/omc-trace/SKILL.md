---
name: omc-trace
description: OMC-style trace trigger for evidence-driven causal investigation with competing hypotheses.
argument-hint: "<observation or why-question>"
---

# OMC Trace

Use this skill when the user asks to trace, explain why something happened, or
investigate an ambiguous behavior where the goal is causal evidence rather than
an immediate fix.

Default role: `tracer`. Add `debugger` or `executor` only after the trace has a
clear next experiment or fix boundary. Role contracts live in `../../agents/`.

## Contract

Keep these separate throughout the investigation:

1. Observed fact: what was actually seen, including commands, outputs, logs, and
   file references.
2. Hypotheses: deliberately different explanations for the observation.
3. Evidence for: facts that support each hypothesis.
4. Evidence against or gaps: facts that contradict it or remain missing.
5. Current best explanation: the leading causal chain and why it outranks
   alternatives.
6. Critical unknown: the missing fact that still matters most.
7. Discriminating probe: the cheapest experiment that would separate the top
   competing hypotheses.

Do not turn a trace into a generic fix loop or claim certainty that the evidence
does not support.

## Workflow

1. Restate the symptom or why-question precisely.
2. Establish boundaries: affected behavior, files, services, configs, runtime
   path, inputs, outputs, and what is out of scope.
3. Build a timeline from the earliest known cause candidate to the observed
   effect. Include timestamps, commits, config changes, commands, and outputs
   when available.
4. List confirmed facts separately from hypotheses. Cite concrete evidence with
   file paths, functions, commands, logs, test names, metrics, or observed
   output.
5. Generate at least three competing hypotheses unless the evidence already
   makes the cause trivial:
   - code-path or implementation cause;
   - config, environment, dependency, or orchestration cause;
   - measurement, artifact, reproduction, or assumption mismatch.
6. Investigate each hypothesis with evidence for and against it. Use Codex tools
   such as file reads, `rg`, tests, targeted scripts, logs, git history, and
   runtime checks as appropriate for the repo.
7. Run discriminating experiments before broad fixes. Prefer small probes that
   can falsify a favorite explanation or distinguish the top two hypotheses.
8. Rank hypotheses by evidence strength:
   - direct reproduction or controlled experiment;
   - primary artifacts with tight provenance;
   - independent sources converging;
   - code-path inference;
   - circumstantial clues;
   - intuition or analogy.
9. Rebut the leading explanation with the strongest alternative. Down-rank any
   hypothesis contradicted by stronger evidence, dependent on extra unverified
   assumptions, or lacking a distinctive prediction.
10. State root cause confidence as high, medium, or low, with the evidence tier
    behind that confidence.
11. Hand off to `debugger` for reproduction and fix when failure isolation is
    still needed, or to `executor` when the root cause and change boundary are
    clear. Include the recommended probe or fix boundary in the handoff.

## Output

Return a concise synthesis:

1. Observed result.
2. Confirmed facts.
3. Timeline.
4. Ranked hypotheses with confidence and evidence strength.
5. Evidence for and against each top hypothesis.
6. Rebuttal and convergence or separation notes.
7. Most likely root cause.
8. Critical unknown.
9. Recommended discriminating probe.
10. Handoff recommendation for debugger or executor, if action is needed.
