---
name: omc-learner
description: OMC-style learned-skill extraction from a conversation into Codex skill form.
argument-hint: "<conversation lesson>"
---

# OMC Learner

Use this skill after a session uncovers a hard-won, reusable lesson that should
survive beyond the current conversation.

## Quality Gate

Extract a learned skill only when all of these are true:

- The lesson is not generic documentation that could be found quickly.
- The lesson is specific to this user, project, repository, toolchain, or
  workflow.
- The lesson took real investigation or iteration to discover.
- The future trigger can be described with concrete symptoms, files, commands,
  errors, or task language.

Do not extract generic programming advice, library usage examples, boilerplate,
or broad refactoring preferences.

## Codex Locations

- User-level learned skill: `$CODEX_HOME/skills/<skill-name>/SKILL.md`, with
  `~/.codex/skills` as the default base when `CODEX_HOME` is unset.
- Project-level learned skill: `.codex/skills/<skill-name>/SKILL.md`.
- Plugin skill: only when the lesson is broadly reusable by the plugin and the
  user explicitly wants it added there.

Prefer project-level skills for repository-specific knowledge. Prefer
user-level skills only when the lesson is portable across projects.

## Workflow

1. Gather the exact problem statement, including errors, symptoms, paths, and
   relevant commands.
2. Gather the exact solution and the reasoning that made it non-obvious.
3. Define recognition signals that would cause Codex to apply the skill later.
4. Classify the lesson as expertise, workflow, integration knowledge, or error
   recovery.
5. Choose user or project scope.
6. Draft or create a `SKILL.md` with valid Codex frontmatter.
7. Verify the draft is actionable without reading the original conversation.

## Template

```markdown
---
name: <skill-name>
description: <one-line description>
argument-hint: "<optional arguments>"
---

# <Skill Title>

## The Insight

What principle or codebase-specific fact was discovered?

## Recognition Pattern

When should this skill activate? Include concrete files, errors, commands, or
symptoms.

## The Approach

How should Codex think and act when the pattern appears?

## Verification

How should Codex prove the lesson was applied correctly?
```

## Rules

- Keep the skill reusable, not a copy of one patch.
- Include specific evidence from the session, but avoid private or irrelevant
  transcript detail.
- Ask before writing outside the current workspace or outside an approved
  writable root.
- Never create plain markdown learned skills without YAML frontmatter.
