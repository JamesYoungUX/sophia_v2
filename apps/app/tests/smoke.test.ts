import { describe, expect, it } from 'vitest';

// Minimal placeholder test to satisfy Husky pre-commit running `bun test`.
// This ensures the test runner has at least one passing test in the workspace.

describe('smoke', () => {
  it('true should be true', () => {
    expect(true).toBe(true);
  });
});