# Upstream Benchmark Prompt

- Suite: code-reviewer
- Codex role: code-reviewer
- Source fixture: _source/oh-my-claudecode/benchmarks/code-reviewer/fixtures/code/code-payment-refund.md
- Ground truth: _source/oh-my-claudecode/benchmarks/code-reviewer/ground-truth/code-payment-refund.json
- Role prompt: plugins/oh-my-codex-workflows/agents/code-reviewer.md

## Instructions

Run the Codex role against the user task below. Return findings in a structured
review/debug/implementation format so the result can be compared with the
upstream ground truth.

## System Prompt

# Code Reviewer

Native type: `default`.

## Mission

Find correctness, regression, maintainability, and missing-test issues in code
or plans.

## Use When

- The user asks for review.
- A change touches shared behavior, many files, or subtle edge cases.
- Final validation needs a second perspective.

## Prompt Addendum

You are the Code Reviewer role. Use a findings-first review format. Prioritize
bugs, behavioral regressions, missing tests, and risky assumptions. Include file
and line references when available. If no issues are found, say so and state
remaining test gaps.

## User Task

Review the following code for quality, security, and correctness issues:

# Payment Refund Service

Please review the following refund processing service:

```typescript
import { db } from '../database';
import { PaymentGateway } from '../gateway';
import { logger } from '../logger';

interface RefundRequest {
  orderId: string;
  amount: number;
  reason: string;
  initiatedBy: string;
}

interface RefundResult {
  success: boolean;
  refundId?: string;
  error?: string;
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  paymentId: string;
  refundedAmount: number;
  customerId: string;
}

const gateway = new PaymentGateway();

/**
 * Process a refund for an order.
 * Supports full and partial refunds.
 */
export async function processRefund(request: RefundRequest): Promise<RefundResult> {
  const { orderId, amount, reason, initiatedBy } = request;

  // Validate amount
  if (amount <= 0) {
    return { success: false, error: 'Refund amount must be positive' };
  }

  // Load order
  const order: Order = await db.orders.findById(orderId);
  if (!order) {
    return { success: false, error: 'Order not found' };
  }

  // Check if order can be refunded
  if (order.status === 'cancelled') {
    return { success: false, error: 'Cannot refund a cancelled order' };
  }

  // Check refund amount doesn't exceed remaining
  const remainingRefundable = order.totalAmount - order.refundedAmount;
  if (amount > remainingRefundable) {
    return { success: false, error: `Maximum refundable amount is ${remainingRefundable}` };
  }

  // Process refund through gateway
  try {
    const gatewayResult = await gateway.refund({
      paymentId: order.paymentId,
      amount: amount,
      currency: 'USD',
      metadata: { orderId, reason, initiatedBy },
    });

    if (!gatewayResult.success) {
      logger.error('Gateway refund failed', { orderId, error: gatewayResult.error });
      return { success: false, error: 'Payment gateway refund failed' };
    }

    // Update order in database
    await db.orders.update(orderId, {
      refundedAmount: order.refundedAmount + amount,
      status: order.refundedAmount + amount >= order.totalAmount ? 'refunded' : 'partially_refunded',
    });

    // Create refund record
    await db.refunds.create({
      orderId,
      amount,
      reason,
      initiatedBy,
      gatewayRefundId: gatewayResult.refundId,
      createdAt: new Date(),
    });

    logger.info('Refund processed', {
      orderId,
      amount,
      refundId: gatewayResult.refundId,
    });

    return { success: true, refundId: gatewayResult.refundId };
  } catch (err) {
    logger.error('Refund processing error', { orderId, error: err });
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get refund history for an order.
 */
export async function getRefundHistory(orderId: string) {
  return db.refunds.findByOrderId(orderId);
}

/**
 * Bulk process refunds (for batch operations like store closure).
 */
export async function bulkRefund(orderIds: string[], reason: string, initiatedBy: string): Promise<Map<string, RefundResult>> {
  const results = new Map<string, RefundResult>();

  for (const orderId of orderIds) {
    const order = await db.orders.findById(orderId);
    if (!order) {
      results.set(orderId, { success: false, error: 'Order not found' });
      continue;
    }

    const remainingRefundable = order.totalAmount - order.refundedAmount;
    if (remainingRefundable <= 0) {
      results.set(orderId, { success: false, error: 'Already fully refunded' });
      continue;
    }

    const result = await processRefund({
      orderId,
      amount: remainingRefundable,
      reason,
      initiatedBy,
    });
    results.set(orderId, result);
  }

  return results;
}
```

