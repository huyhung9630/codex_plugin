---
name: omc-visual-verdict
description: OMC-style screenshot and reference visual QA verdict with evidence-backed next edits.
argument-hint: "<generated screenshot> <reference image(s)>"
---

# OMC Visual Verdict

Use this skill to compare a generated UI screenshot against one or more
reference images and return a structured visual QA verdict.

## Inputs

- Generated screenshot path or browser view.
- One or more reference image paths.
- Optional category hint such as dashboard, editor, product page, feed, game,
  or mobile layout.
- Optional tolerance notes from the user.

## Evidence Gathering

Use the best available tools in the current environment:

- `view_image` for local screenshots or reference files.
- Browser or Playwright screenshots when the UI must be captured from a running
  app.
- Canvas or pixel checks for blank, cropped, or obviously failed renders.
- Pixel diff tooling as a secondary aid when exact visual mismatch location is
  useful.

If an image or browser tool is unavailable, state the limitation and base the
verdict only on evidence you can inspect.

## Review Dimensions

Compare the generated result to the reference on:

- Layout structure and relative placement.
- Spacing, alignment, density, and responsive framing.
- Typography size, weight, casing, and hierarchy.
- Color, contrast, shadows, borders, and surface treatment.
- Component states, icons, imagery, and missing or extra elements.
- Category match: whether the result belongs to the intended product or UI
  family.
- Render health: no blank screens, broken assets, clipped text, or incoherent
  overlap.

## Verdict Format

Return JSON only when the caller needs a machine-readable verdict:

```json
{
  "score": 0,
  "verdict": "revise",
  "category_match": false,
  "differences": ["..."],
  "suggestions": ["..."],
  "evidence": ["..."],
  "reasoning": "short explanation"
}
```

Rules:

- `score` is an integer from 0 to 100.
- `verdict` is `pass`, `revise`, or `fail`.
- `category_match` is true only when the generated screenshot clearly matches
  the intended category and reference style.
- `differences` must name concrete visual mismatches.
- `suggestions` must be actionable edits tied to the differences.
- `evidence` must identify inspected screenshots, viewports, or tool outputs.
- `reasoning` is one or two sentences.

## Threshold

Use 90 or higher as the default pass threshold. If the score is below 90, make
the next edit suggestions specific enough for another implementation pass, then
rerun visual QA after a fresh screenshot.

## Rules

- Do not rely on memory of the intended design when screenshots are available.
- Do not treat pixel diff output as the whole verdict; translate it into human
  visual differences.
- Do not pass a screen with blank regions, broken assets, overlapping text, or
  mobile/desktop framing failures.
- Preserve evidence paths and viewport sizes in the verdict when available.
