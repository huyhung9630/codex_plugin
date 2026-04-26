---
name: omc-deep-interview
description: OMC-style deep-interview trigger for "deep interview", "unclear idea", "ask me questions", or vague high-cost implementation requests.
argument-hint: "[--quick|--standard|--deep] <idea>"
---

# OMC Deep Interview

Use this skill when the user invokes `omc-deep-interview`, asks for a deep
interview, or gives a vague idea where implementation would otherwise require
risky assumptions.

## Method

Ask only the questions needed to reduce ambiguity. Prefer one to three concise
questions per turn. When enough information exists, stop interviewing and
produce a buildable specification.

## Clarify These Dimensions

- User and primary workflow.
- Must-have behavior and explicit non-goals.
- Data model, integrations, and external dependencies.
- Platform, framework, and deployment constraints.
- Quality bar: tests, accessibility, security, performance, UX.
- Acceptance criteria and examples of done.

## Modes

- Quick: one round, suitable for small features.
- Standard: two to three rounds, suitable for product features.
- Deep: continue until requirements are stable enough for autonomous build.

## Exit Output

Produce:

- problem statement;
- users and workflows;
- functional requirements;
- non-goals;
- constraints;
- acceptance criteria;
- verification plan;
- open questions that remain.

If the user then asks to proceed, hand the spec to `omc-plan` or
`omc-autopilot`.
