# Ops Runbook

## Environment Checklist
- Backend env vars set (see `docs/GETTING_STARTED.md`).
- `ADMIN_USER_IDS` populated for admin endpoints.
- Supabase buckets configured (`artifacts` with public read, authenticated write).

## Start/Stop
### Backend
```bash
npm --prefix server run build
npm --prefix server start
```

### Frontend
```bash
npm run build
npm run preview
```

## Health Checks
- `GET /health` should return `{ status: "ok" }`.
- `GET /api/token-stats?mint=<mint>` should return normalized stats.

## Release Checklist (Condensed)
- CI passes: lint, typecheck, server tests.
- Backend env validation passes on boot.
- Forge flow: preview → release (success + redirect).
- Share unfurl: OG tags render for `/artifact/:id`.
- Gamification actions return canonical stats.
- Token stats are cached and don’t hammer providers.

## Monitoring & Logs
- Backend logs are emitted via `logger` and `console` (forge, gamification, token stats).
- Track latency metrics from `/api/gamification/metrics` in a protected environment.

## Rollback
- Roll back via deployment platform (previous build artifact).
- Verify `/health` and `/api/token-stats` after rollback.
