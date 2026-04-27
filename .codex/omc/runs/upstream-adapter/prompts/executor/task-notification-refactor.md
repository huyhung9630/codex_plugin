# Upstream Benchmark Prompt

- Suite: executor
- Codex role: executor
- Source fixture: _source/oh-my-claudecode/benchmarks/executor/fixtures/tasks/task-notification-refactor.md
- Ground truth: _source/oh-my-claudecode/benchmarks/executor/ground-truth/task-notification-refactor.json
- Role prompt: plugins/oh-my-codex-workflows/agents/executor.md

## Instructions

Run the Codex role against the user task below. Return findings in a structured
review/debug/implementation format so the result can be compared with the
upstream ground truth.

## System Prompt

# Executor

Native type: `worker`.

## Mission

Implement scoped code changes precisely and verify them.

## Use When

- The work packet has clear ownership and acceptance criteria.
- The task is implementation rather than analysis or review.
- A worker can edit a disjoint file/module set.

## Prompt Addendum

You are the Executor role. Implement the smallest viable diff that satisfies the
assigned task. Match existing code patterns. Do not refactor adjacent code
unless required. Run the assigned verification and list changed paths in your
final answer.

## User Task

Implement the following task. Describe your approach, the files you would modify, and the changes you would make:

# Task: Refactor notification system for multi-channel support

## Context

The current notification system only supports email. We need to refactor it to support email, SMS, and push notifications through a unified interface. The system should be extensible for future channels.

## Existing Code

```typescript
// src/services/notification-service.ts
import { sendEmail } from '../integrations/email';
import { db } from '../database';
import { logger } from '../logger';

interface NotificationRequest {
  userId: string;
  subject: string;
  message: string;
}

export async function sendNotification(request: NotificationRequest): Promise<boolean> {
  const { userId, subject, message } = request;

  // Look up user email
  const user = await db.users.findById(userId);
  if (!user || !user.email) {
    logger.warn('Cannot send notification: user not found or no email', { userId });
    return false;
  }

  try {
    await sendEmail({
      to: user.email,
      subject,
      body: message,
    });

    await db.notifications.insert({
      userId,
      type: 'email',
      subject,
      message,
      sentAt: new Date(),
      status: 'sent',
    });

    return true;
  } catch (err) {
    logger.error('Failed to send notification', { userId, error: err });

    await db.notifications.insert({
      userId,
      type: 'email',
      subject,
      message,
      sentAt: new Date(),
      status: 'failed',
      error: err instanceof Error ? err.message : 'Unknown error',
    });

    return false;
  }
}
```

```typescript
// src/integrations/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailParams {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail(params: EmailParams): Promise<void> {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@example.com',
    to: params.to,
    subject: params.subject,
    html: params.body,
  });
}
```

```typescript
// src/api/routes/notifications.ts
import { sendNotification } from '../../services/notification-service';

router.post('/notifications', async (req, res) => {
  const { userId, subject, message } = req.body;

  const success = await sendNotification({ userId, subject, message });
  if (!success) {
    return res.status(500).json({ error: 'Failed to send notification' });
  }

  res.json({ success: true });
});
```

## Requirements
1. Create a `NotificationChannel` interface with a `send` method
2. Implement `EmailChannel`, `SmsChannel`, and `PushChannel` classes
3. Create a `NotificationService` class that routes to the correct channel based on user preferences
4. Users should be able to have multiple active channels
5. Each channel should handle its own error logging and status tracking
6. The API route should accept an optional `channels` parameter to override user preferences
7. Maintain backward compatibility: existing callers without the `channels` param should still work (default to email)

