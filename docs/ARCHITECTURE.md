# Architecture

## System Overview
- **Frontend**: Vite + React SPA in repo root (`src/`).
- **Backend**: Express + TypeScript in `server/`.
- **Storage/DB**: Supabase (DB + storage buckets).

## Runtime Targets
- SPA served by Vite during dev, static build in production.
- Express API served on port `3001` by default.
- Static assets served from `server/public` (including `/horny_base`).

## Key Backend Routes
- Forge: `POST /api/forge`, `POST /api/forge/release`
- Gamification: `GET /api/gamification/me`, `POST /api/gamification/action`
- Events: `POST /api/event`
- Token stats: `GET /api/token-stats`
- Share: `POST /api/share-token`, `GET /s/:artifactId`
- OG wrapper: `/artifact/:id` (and related OG HTML)
- Health: `GET /health`

## Core Flows
### Forge
1. Authenticated user submits `/api/forge`.
2. Prompt is sanitized + moderated.
3. Image is generated and stored as a preview.
4. `/api/forge/release` validates moderation + brand similarity before final storage.

### Gamification
1. Client sends `/api/gamification/action` with idempotency key.
2. Server validates action + caps, applies rules, and stores event + stats.
3. Responses include canonical stats to avoid client drift.

### Share
1. Authenticated user requests `/api/share-token`.
2. Share redirect `/s/:artifactId` validates token and records share event.

### Token Stats
- `GET /api/token-stats` uses cache + optional external provider (Dexscreener).

## Configuration Sources
- Backend config in `server/src/config.ts`.
- Frontend env through `VITE_*` and `NEXT_PUBLIC_*` prefixes.

## Related Docs
- `docs/SECURITY.md` for auth, secrets, and rate limiting.
- `docs/OPS_RUNBOOK.md` for operational checks.
- `docs/TESTING.md` for test coverage and commands.
