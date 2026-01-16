# Repo Health Report

## 1. Executive Summary
- **Overall status**: ⚠️ fragile (production risks are mostly configuration- and security-related).
- **Top blockers**: None identified in-code; see Major Issues for high-risk items.
- **Biggest risk area**: Security posture (CORS, public metrics endpoint, committed env file).
- Backend and frontend are clearly separated, but runtime configuration is heavily env-driven.
- Tests exist for backend smoke + prompt logic, but there is no frontend test coverage.
- Rate limiting and cooldowns are in-memory only (single-instance assumptions).
- Gamification endpoints rely on authenticated context but one endpoint returns 500 on unauth.
- Static asset serving is tied to the current working directory, which is brittle in deployments.
- CI runs lint/typecheck/build/tests; docs guard enforces doc updates for code changes.
- Documentation is currently fragmented; consolidated docs are provided in this PR.

## 2. Blockers (must-fix)
No blockers identified in code review.

## 3. Major Issues (should-fix)
- **ID**: MAJ-001
  - **Title**: CORS allows any origin with credentials enabled
  - **Impact**: Browser requests with credentials can be rejected and the API can be exposed to cross-origin abuse.
  - **Where**: `server/src/app.ts:40-43`
  - **Why it happens**: `origin` defaults to `*` while `credentials: true` is always set.
  - **Fix suggestion**: Set an explicit allowlist (env-driven array) and disable credentials for wildcard origins.
  - **Acceptance criteria**: Responses include a specific `Access-Control-Allow-Origin` for allowed domains and credentials only for those origins.

- **ID**: MAJ-002
  - **Title**: `/api/gamification/me` returns 500 on unauthenticated access
  - **Impact**: Clients without auth receive a server error instead of a clear 401, masking auth failures.
  - **Where**: `server/src/routes/gamification.ts:25-42`
  - **Why it happens**: The route is missing `requireAuth`, and `getUserId` throws an error that is caught and returned as 500.
  - **Fix suggestion**: Add `requireAuth` middleware or explicitly handle missing `req.userId` with a 401.
  - **Acceptance criteria**: Unauthenticated requests to `/api/gamification/me` consistently return 401.

- **ID**: MAJ-003
  - **Title**: Gamification metrics endpoint is public
  - **Impact**: Internal metrics and activity data are exposed to unauthenticated users.
  - **Where**: `server/src/routes/gamification.ts:262-268`
  - **Why it happens**: No auth or admin guard is applied to `/api/gamification/metrics`.
  - **Fix suggestion**: Protect the route with `requireAuth` + admin allowlist, or disable in production.
  - **Acceptance criteria**: Unauthenticated requests receive 401/403, and only admin users can access metrics.

- **ID**: MAJ-004
  - **Title**: Static assets depend on `process.cwd()`
  - **Impact**: Running the backend from `server/` breaks static serving (`/horny_base` and other assets).
  - **Where**: `server/src/app.ts:44`
  - **Why it happens**: Static assets are served from `path.join(process.cwd(), 'server', 'public')`.
  - **Fix suggestion**: Resolve the static directory relative to the compiled file location (e.g., `path.resolve(new URL('.', import.meta.url).pathname, '..', 'public')`).
  - **Acceptance criteria**: Static assets load correctly regardless of the current working directory.

- **ID**: MAJ-005
  - **Title**: `.env` with Supabase keys is committed to the repo
  - **Impact**: Secrets or environment config may leak; increases risk of accidental production exposure.
  - **Where**: `.env`
  - **Why it happens**: Environment file is tracked in git rather than example-only.
  - **Fix suggestion**: Remove `.env` from version control, add `.env.example`, and document required keys.
  - **Acceptance criteria**: `.env` is git-ignored and secrets are managed outside the repo.

## 4. Minor Issues / Cleanup (nice-to-have)
- **ID**: MIN-001
  - **Title**: In-memory rate limiting won’t scale across instances
  - **Impact**: Rate limits reset per instance; no cleanup for long-lived maps.
  - **Where**: `server/src/middleware/rateLimit.ts:4-45`
  - **Why it happens**: Rate limiting uses an in-memory `Map` without eviction.
  - **Fix suggestion**: Move to a shared store (Redis) and add TTL-based cleanup.
  - **Acceptance criteria**: Rate limiting works consistently across multiple instances.

- **ID**: MIN-002
  - **Title**: Gamification validation lacks proof validation for share and artifact release
  - **Impact**: Actions are accepted without server-side proof, leaving room for abuse.
  - **Where**: `server/src/gamification/validation.ts:53-77`
  - **Why it happens**: TODOs remain for validation of share and artifact release proof.
  - **Fix suggestion**: Implement server-side proof checks against the event ledger or database.
  - **Acceptance criteria**: Share and release actions require validated proofs.

- **ID**: MIN-003
  - **Title**: Forge tags do not validate against an allowlist
  - **Impact**: Tags can drift or become inconsistent over time.
  - **Where**: `server/src/controllers/ForgeController.ts:365-368`
  - **Why it happens**: Allowed tag validation is marked as TODO.
  - **Fix suggestion**: Add a tags allowlist in config and enforce via zod schema.
  - **Acceptance criteria**: Invalid tags are rejected with 400.

## 5. Test Coverage Map
- **Current tests found**
  - Server prompt-engine tests: `server/src/test/prompt-engine.test.ts`
  - Server service tests: `server/src/test/services.test.ts`
  - Server smoke tests: `server/test/smoke/smoke.test.ts`
- **Gaps by critical flow**
  - Frontend flows (login/connect, forge UI, profile) have no automated tests.
  - Supabase RLS policies are not tested (no integration tests against DB rules).
  - No load or reliability tests for forge or token stats endpoints.
- **Next 5 tests to add**
  1. Frontend E2E: Forge preview → release happy path.
  2. Frontend E2E: Auth failure redirects or shows error state.
  3. Backend integration: Supabase RLS enforcement for artifacts + votes.
  4. Backend integration: Share token misuse and replay defense.
  5. Load test: Token stats caching under concurrency.

## 6. Security Checklist Findings
- **Authn/authz**: Supabase auth is used; one endpoint (`/api/gamification/metrics`) is public and should be restricted.
- **Secret handling**: `.env` is committed; should be removed and replaced with `.env.example`.
- **CORS / CSRF**: CORS uses wildcard origin with credentials; should be restricted to allowed origins.
- **Rate limiting**: In-memory only; should move to shared store for production.
- **Sensitive logging**: No obvious token logging found, but ensure request payloads do not log secrets.

## Docs Cleanup Plan
| Doc Path | Status (Keep/Update/Merge/Remove) | Reason | Target Doc (if merged) |
|---|---|---|---|
| README.md | Update | Point to consolidated docs index. | docs/INDEX.md |
| docs/INDEX.md | Keep | Canonical docs entry point. | — |
| docs/REPO_HEALTH.md | Keep | Audit findings and cleanup plan. | — |
| docs/GETTING_STARTED.md | Keep | Setup and local dev instructions. | — |
| docs/ARCHITECTURE.md | Keep | Consolidated architecture + API overview. | — |
| docs/OPS_RUNBOOK.md | Keep | Release and operational checklist. | — |
| docs/SECURITY.md | Keep | Security expectations and configuration. | — |
| docs/TESTING.md | Keep | Test commands and coverage notes. | — |
| docs/ownership.yml | Update | Point docs-guard to new doc paths. | — |
| docs/README.md | Remove | Replaced by docs/INDEX.md. | docs/INDEX.md |
| docs/api-spec.md | Merge | Fold into architecture + security docs. | docs/ARCHITECTURE.md, docs/SECURITY.md |
| docs/page-spec.md | Merge | UI copy rules belong in architecture/product; no longer canonical. | docs/ARCHITECTURE.md |
| docs/ui-map.md | Merge | UI mapping is moved to architecture summary. | docs/ARCHITECTURE.md |
| docs/go-live-checklist.md | Merge | Operations checklist now in ops runbook. | docs/OPS_RUNBOOK.md |
| docs/archive/BACKEND_SETUP.md | Remove | Historical setup notes replaced by Getting Started. | docs/GETTING_STARTED.md |
| docs/archive/HORNY_ARCHIVES_SETUP.md | Remove | Historical setup notes replaced by Getting Started. | docs/GETTING_STARTED.md |
| docs/archive/SUPABASE_SQL.md | Remove | Legacy SQL notes superseded by ops/security docs. | docs/OPS_RUNBOOK.md |
| docs/archive/architecture.md | Remove | Superseded by consolidated architecture doc. | docs/ARCHITECTURE.md |
| docs/archive/architecture_current_state.md | Remove | Superseded by consolidated architecture doc. | docs/ARCHITECTURE.md |
| docs/archive/assets.md | Remove | Asset references folded into architecture. | docs/ARCHITECTURE.md |
| docs/archive/backend.md | Remove | Superseded by architecture doc. | docs/ARCHITECTURE.md |
| docs/archive/frontend.md | Remove | Superseded by architecture doc. | docs/ARCHITECTURE.md |
| docs/archive/gamification.md | Remove | Superseded by architecture doc. | docs/ARCHITECTURE.md |
| docs/archive/logic-spec.md | Remove | Historical logic spec; no longer canonical. | docs/ARCHITECTURE.md |
| docs/archive/state-machines.md | Remove | Historical state machine notes. | docs/ARCHITECTURE.md |
| docs/archive/copy.md | Remove | Copy mapping moved into architecture summary. | docs/ARCHITECTURE.md |
| docs/archive/quiz-spec.md | Remove | Quiz feature not referenced in current code paths. | docs/ARCHITECTURE.md |
| docs/archive/horny-matrix/v2-contract.md | Remove | Legacy prompt contract notes. | docs/ARCHITECTURE.md |
| docs/archive/server/README.md | Remove | Legacy backend readme. | docs/ARCHITECTURE.md |
| docs/archive/server/GAMIFICATION_PRODUCTION.md | Remove | Superseded by ops runbook. | docs/OPS_RUNBOOK.md |
| docs/archive/planning/steps-decisions.md | Remove | Historical planning notes. | docs/REPO_HEALTH.md |
| docs/archive/planning/badges.md | Remove | Historical planning notes. | docs/REPO_HEALTH.md |
| docs/archive/planning/generator-logik-erw.md | Remove | Historical planning notes. | docs/REPO_HEALTH.md |
