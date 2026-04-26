---
name: omc-skillify
description: OMC-style workflow capture for turning repeatable session work into a Codex skill draft.
argument-hint: "<workflow or lesson>"
---

# OMC Skillify

Use this skill when the current session reveals a repeatable workflow that
should become a reusable Codex skill, project skill, or documented procedure.

## Goal

Capture a proven workflow as a concrete skill draft so future sessions can
reuse the same decision process without rediscovering it.

## Codex Skill Targets

- Built-in plugin skill: `plugins/<plugin>/skills/<skill-name>/SKILL.md`.
- User skill: `$CODEX_HOME/skills/<skill-name>/SKILL.md`, defaulting to
  `~/.codex/skills/<skill-name>/SKILL.md` when `CODEX_HOME` is not set.
- Project skill: `.codex/skills/<skill-name>/SKILL.md` when the project keeps
  local Codex guidance in version control.
- Documentation only: use when the workflow is useful context but not a strong
  triggerable skill.

## Workflow

1. Identify the repeatable task the session completed.
2. Extract the inputs, ordered steps, success criteria, constraints, and
   pitfalls.
3. Decide the right target: plugin, user, project, or documentation.
4. Draft a complete `SKILL.md` with YAML frontmatter.
5. Include precise trigger conditions and explicit do-not-use boundaries when
   the workflow could be over-applied.
6. Point out anything still too fuzzy to encode safely.

## Required Frontmatter

Every Codex skill draft must start with YAML frontmatter:

```yaml
---
name: <skill-name>
description: <one-line description>
argument-hint: "<optional arguments>"
---
```

Use an `omc-` prefix for skills that belong to the Oh My Codex workflow pack.
The frontmatter `name` must match the containing folder name.

## Rules

- Only capture workflows that are actually repeatable.
- Prefer principles, decision points, and verification criteria over transcript
  summaries.
- Keep the draft scoped to one behavior.
- Do not invent successful steps that were not used or verified.
- Keep generated skill files ASCII unless the repository already requires a
  different character set.

## Output

Return the proposed skill name, target location, draft structure, and open
questions. If the user asked you to create the skill and the target path is
writable, create the `SKILL.md` directly.
