---
name: omc-configure-notifications
description: Configure notification settings for Telegram, Discord, Slack, or custom webhooks with Codex-safe credential handling.
argument-hint: "[telegram|discord|slack|webhook|template]"
---

# OMC Configure Notifications

Use this skill when the user asks to configure notifications, webhooks, Telegram,
Discord, Slack, or notification templates.

## Codex Boundary

Codex does not currently provide the upstream OMC hook runtime that automatically
sends session lifecycle notifications. This skill can prepare config files,
environment variable guidance, and test requests, but it must not claim that
notifications will fire automatically unless a separate runtime or hook process
is installed and verified.

## Provider Routing

- `telegram`: bot token and chat ID.
- `discord`: webhook URL or bot token and channel ID.
- `slack`: incoming webhook URL.
- `webhook` or `custom`: generic HTTPS webhook or CLI command plan.
- `template`: message template guidance for a notification runtime.

If no provider is clear, ask the user which provider to configure.

## Credential Policy

- Do not print full tokens or webhook URLs after collection.
- Prefer environment variables for secrets:
  - `OMC_TELEGRAM_BOT_TOKEN`
  - `OMC_TELEGRAM_CHAT_ID`
  - `OMC_DISCORD_WEBHOOK_URL`
  - `OMC_DISCORD_NOTIFIER_BOT_TOKEN`
  - `OMC_DISCORD_NOTIFIER_CHANNEL`
  - `OMC_SLACK_WEBHOOK_URL`
- If writing secrets to a config file is requested, show the exact target path
  and ask for approval.
- Network tests with `curl` or equivalent require approval because they contact
  external services.

## Configuration Shape

When a file is needed, prefer a workspace-local draft unless the user requests a
global config:

```json
{
  "notifications": {
    "enabled": true,
    "telegram": { "enabled": true },
    "discord": { "enabled": true },
    "slack": { "enabled": true }
  }
}
```

Store only the provider entries the user selected. Keep secret values out of the
repo unless the user explicitly accepts that risk.

## Verification

Verify in this order:

1. Validate URL, token, and ID formats locally.
2. Confirm required environment variables are present without printing values.
3. With approval, send one test notification and report HTTP status and provider
   error text if any.
4. State clearly whether an automatic notification runtime is present or still
   needs to be added.

## Completion

Report provider, storage method, test result, and any runtime gap that prevents
automatic notifications.
