# API + Backend Spec (Canonical)

## Architecture
- **Frontend**: Vite + React SPA (root). Proxies `/api`, `/health`, `/horny_base` to the backend in dev.
- **Backend**: Express app in `server/` with TypeScript builds (`npm --prefix server run build`).

## Required Environment (Backend)
Defined in `server/src/config.ts`.

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY` (required for forge, can be skipped in tests with overrides)
- `SITE_URL`
- `SHARE_TOKEN_SECRET`
- Token identifier (one of): `TOKEN_MINT` or `TOKEN_PAIR` / `DEX_LINK`

Optional config:
- `PORT` (default `3001`)
- `BASE_IMAGES_PATH` (default `./server/public/horny_base`)
- `FORGE_RATE_LIMIT_*`, `RELEASE_RATE_LIMIT_PER_DAY`, `BRAND_SIMILARITY_THRESHOLD`

## Required Environment (Frontend)
Token stat helpers read from:
- `NEXT_PUBLIC_TOKEN_MINT` / `VITE_TOKEN_MINT`
- `NEXT_PUBLIC_DEX_LINK` / `VITE_DEX_LINK`

## Core Routes (Server)
Configured in `server/src/app.ts`.

### Forge
- `POST /api/forge` (auth required)
- `POST /api/forge/release` (auth required)

### Gamification + Events
- `POST /api/event` (auth required; awards XP)
- `GET /api/gamification/me`
- `POST /api/gamification/action`

### Token stats
- `GET /api/token-stats` (query `mint`, or fallback to env)

### Misc
- `GET /health`
- `/api/share/*` (share API)
- `/share/*` (share redirects)
- `/og/*` (OG image HTML)

## Static Assets
- Backend serves `server/public` via `express.static` (base images at `/horny_base`).

## Supabase + Storage
- `artifacts` bucket (public read; authenticated write)
- Artifact uploads are stored by the backend or via authenticated client.

## HornyMatrix Contract (Server)
- Prompt composition and fallback logic live in `server/src/services/hornyMatrix/*`.
- Fallback prompts must always include Brand Directives.
