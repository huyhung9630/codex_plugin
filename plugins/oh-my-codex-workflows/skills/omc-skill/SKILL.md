---
name: omc-skill
description: OMC-style local Codex skill management workflow for listing, creating, editing, and validating skills.
argument-hint: "<list|add|remove|edit|search|info|sync|setup|scan> [args]"
---

# OMC Skill Management

Use this skill when the user wants to manage local Codex skills.

## Scope

Codex skills are directory-based. A skill normally lives at:

- Plugin built-in: `plugins/<plugin>/skills/<skill-name>/SKILL.md`.
- User-level: `$CODEX_HOME/skills/<skill-name>/SKILL.md`, or
  `~/.codex/skills/<skill-name>/SKILL.md` when `CODEX_HOME` is unset.
- Project-level: `.codex/skills/<skill-name>/SKILL.md`.

Built-in plugin skills are readable but should not be edited or removed unless
the user explicitly asks to modify that plugin. User and project skills are the
normal management targets.

## Subcommands

### list

Scan plugin, user, and project skill directories. Parse YAML frontmatter from
each `SKILL.md` and show name, description, argument hint, scope, and path. If
metadata is missing or invalid, report it clearly.

### add [name]

Create a new user or project skill.

1. Validate the name: lowercase letters, numbers, and hyphens.
2. Ask for description, optional argument hint, and scope when missing.
3. Create `<scope>/<name>/SKILL.md` with valid frontmatter.
4. Keep the initial body small: purpose, activation conditions, workflow, and
   verification.

### remove <name>

Find the user or project skill by name, show its path and description, and ask
for explicit confirmation before deleting anything. Never remove plugin
built-ins through this command.

### edit <name>

Find the user or project skill, read the current file, and update only the
requested field or body section. Preserve frontmatter validity and keep the
frontmatter `name` aligned with the folder name.

### search <query>

Search skill names, descriptions, argument hints, and bodies. Prefer `rg` when
available. Rank name and description matches above body-only matches.

### info <name>

Show the resolved path, scope, frontmatter, and body summary for a skill. If
the user asks for the full content, read and display the full file.

### sync

Compare user and project skill directories. Show user-only, project-only, and
same-name skills. Ask before copying or overwriting any skill.

### setup

Check whether user and project skill directories exist. Offer to create missing
directories, then run `scan`.

### scan

Inventory user and project skill directories without modifying anything.

## Safety Rules

- Do not delete, overwrite, or move skills without explicit confirmation.
- Do not edit outside the requested scope.
- Respect workspace sandbox and approval requirements.
- Keep skill files ASCII unless the surrounding project already uses another
  character set.
- Validate frontmatter before claiming success.

## Minimal Skill Template

```markdown
---
name: <skill-name>
description: <one-line description>
argument-hint: "<optional arguments>"
---

# <Skill Title>

## Purpose

What this skill helps Codex do.

## When To Use

Concrete trigger conditions.

## Workflow

1. First step.
2. Second step.
3. Verification step.
```
