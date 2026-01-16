# Testing

## Test Suites
- **Server unit tests**: `server/src/test/*.test.ts` (prompt engine, rate limiting).
- **Server smoke tests**: `server/test/smoke/smoke.test.ts` (API endpoints + share/OG/token stats).
- **Frontend**: No automated tests found.

## Run Tests
```bash
npm test
```

## Other Checks
```bash
npm run lint
npm run typecheck
npm --prefix server run build
```

## Known Gaps
- No E2E tests for frontend flows (connect/auth, forge, profile).
- No integration tests for Supabase RLS policies.
- No load tests for token stats or forge endpoints.
