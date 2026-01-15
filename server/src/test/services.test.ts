import { describe, expect, it } from 'vitest';
import type { Request } from 'express';
import { RateLimiter } from '../services/RateLimiter';

const makeRequest = (overrides: Record<string, unknown> = {}): Request =>
  ({
    ip: '127.0.0.1',
    get: () => 'test-agent',
    ...overrides,
  }) as unknown as Request;

describe('RateLimiter', () => {
  it('enforces anonymous limits', () => {
    const limiter = new RateLimiter(10_000, 2, 4);
    const req = makeRequest();

    expect(limiter.check(req).allowed).toBe(true);
    expect(limiter.check(req).allowed).toBe(true);
    const blocked = limiter.check(req);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it('allows higher limits for authenticated users', () => {
    const limiter = new RateLimiter(10_000, 2, 4);
    const req = makeRequest({ userId: 'user-1' });

    expect(limiter.check(req).allowed).toBe(true);
    expect(limiter.check(req).allowed).toBe(true);
    expect(limiter.check(req).allowed).toBe(true);
    expect(limiter.check(req).allowed).toBe(true);
    expect(limiter.check(req).allowed).toBe(false);
  });
});
