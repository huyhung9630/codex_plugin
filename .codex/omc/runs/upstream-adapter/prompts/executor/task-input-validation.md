# Upstream Benchmark Prompt

- Suite: executor
- Codex role: executor
- Source fixture: _source/oh-my-claudecode/benchmarks/executor/fixtures/tasks/task-input-validation.md
- Ground truth: _source/oh-my-claudecode/benchmarks/executor/ground-truth/task-input-validation.json
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

# Task: Add input validation to POST /api/products endpoint

## Context

The POST /api/products endpoint currently accepts any input without validation. We need to add proper validation before creating products.

## Existing Code

```typescript
// src/types/product.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'electronics' | 'clothing' | 'food' | 'other';
  sku: string;
  inStock: boolean;
  createdAt: Date;
}
```

```typescript
// src/api/routes/products.ts
import { Router } from 'express';
import { createProduct } from '../../services/product-service';

const router = Router();

router.post('/products', async (req, res) => {
  try {
    const product = await createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.get('/products/:id', async (req, res) => {
  const product = await getProduct(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

export default router;
```

```typescript
// src/services/product-service.ts
import { Product } from '../types/product';
import { db } from '../database';
import { generateId } from '../utils/id';

export async function createProduct(input: Partial<Product>): Promise<Product> {
  const product: Product = {
    id: generateId(),
    name: input.name || '',
    description: input.description || '',
    price: input.price || 0,
    category: input.category || 'other',
    sku: input.sku || '',
    inStock: input.inStock ?? true,
    createdAt: new Date(),
  };

  await db.products.insert(product);
  return product;
}
```

## Validation Requirements
1. `name`: required, string, 1-200 characters
2. `description`: optional, string, max 2000 characters
3. `price`: required, number, must be >= 0, max 2 decimal places
4. `category`: required, must be one of the valid categories
5. `sku`: required, string, must match pattern `^[A-Z]{2,4}-\d{4,8}$`
6. Return 400 with descriptive error messages for validation failures
7. Do not modify the Product interface or existing GET route

