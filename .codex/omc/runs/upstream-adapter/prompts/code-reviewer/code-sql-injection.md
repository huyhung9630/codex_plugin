# Upstream Benchmark Prompt

- Suite: code-reviewer
- Codex role: code-reviewer
- Source fixture: _source/oh-my-claudecode/benchmarks/code-reviewer/fixtures/code/code-sql-injection.md
- Ground truth: _source/oh-my-claudecode/benchmarks/code-reviewer/ground-truth/code-sql-injection.json
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

# User Search API Endpoint

Please review the following Express.js endpoint for a user search feature:

```typescript
import express from 'express';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const router = express.Router();

interface SearchResult {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: Date;
}

/**
 * GET /api/users/search?q=<query>&role=<role>&sort=<field>&order=<asc|desc>
 * Search users by username or email with optional role filter and sorting.
 */
router.get('/search', async (req, res) => {
  const { q, role, sort, order } = req.query;

  if (!q || typeof q !== 'string' || q.length < 2) {
    return res.status(400).json({ error: 'Query must be at least 2 characters' });
  }

  // Build the search query
  let sql = `SELECT id, username, email, role, created_at FROM users WHERE username LIKE '%${q}%' OR email LIKE '%${q}%'`;

  // Apply role filter if provided
  if (role && typeof role === 'string') {
    sql += ` AND role = '${role}'`;
  }

  // Apply sorting
  const allowedSortFields = ['username', 'email', 'created_at'];
  const sortField = sort && allowedSortFields.includes(sort as string) ? sort : 'username';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
  sql += ` ORDER BY ${sortField} ${sortOrder}`;

  // Limit results
  sql += ' LIMIT 50';

  try {
    const result = await pool.query(sql);
    const users: SearchResult[] = result.rows;

    // Log search for analytics
    console.log(`User search: q="${q}" role="${role}" results=${users.length}`);

    return res.json({
      results: users,
      total: users.length,
      query: q,
    });
  } catch (err) {
    console.error('Search failed:', err);
    return res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * DELETE /api/users/:id
 * Soft-delete a user account.
 */
router.delete('/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    await pool.query(`UPDATE users SET deleted_at = NOW() WHERE id = ${userId}`);
    console.log(`User ${userId} soft-deleted`);
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete failed:', err);
    return res.status(500).json({ error: 'Delete failed' });
  }
});

export default router;
```

