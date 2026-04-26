---
name: omc-mcp-setup
description: Plan and configure MCP servers for Codex with explicit approvals for external writes, network installs, and credentials.
argument-hint: "[context7|exa|filesystem|github|custom]"
---

# OMC MCP Setup

Use this skill when the user asks for MCP setup, MCP diagnostics, or help adding
external tools to Codex.

## Codex Boundary

Codex can use MCP tools provided by configured servers, but this skill cannot
silently register servers in the runtime. Treat MCP setup as a guided workflow:
inspect what is available, propose config changes, and request approval before
writing files, installing packages, or storing credentials.

## Setup Paths

Ask for one path if the request is ambiguous:

1. Recommended starter setup: documentation/context first, then optional search
   and GitHub.
2. Individual server: configure one named server.
3. Custom server: collect command or HTTP endpoint details.

## Server Guidance

- Documentation/context servers: prefer no-credential options when possible.
- Web search servers: require the user's API key and approval before testing.
- Filesystem servers: restrict allowed directories to the smallest useful set.
- GitHub servers: prefer existing approved GitHub connectors when available;
  otherwise ask for token scope and storage location before writing anything.
- Custom stdio servers: validate executable, arguments, and environment names.
- Custom HTTP servers: require HTTPS except localhost development endpoints.

## Approval Points

Ask before:

- editing Codex MCP configuration files;
- writing under the user's Codex home directory;
- running `npm`, `npx`, package installers, Docker, or network probes;
- storing API keys, tokens, webhook URLs, or headers;
- granting filesystem access outside the current workspace.

## Verification

After configuration, verify with the narrowest available check:

- list configured MCP servers or Codex-visible MCP resources;
- confirm required environment variables are present without printing secrets;
- run a harmless server health command if the user approved network or process
  execution;
- restart Codex only if the configured integration requires it.

## Completion

Summarize configured servers, credential storage choices, allowed directories,
verification performed, and any server that still needs manual setup.
