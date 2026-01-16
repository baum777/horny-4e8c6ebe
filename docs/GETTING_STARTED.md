# Getting Started

## Prerequisites
- Node.js 20.x
- npm 9+

## Install
```bash
npm ci
npm --prefix server install
```

## Environment Variables
### Backend (Express)
Required in production (validated on startup in `server/src/config.ts`):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY` (required unless `NODE_ENV=test`)
- `SITE_URL`
- `SHARE_TOKEN_SECRET`
- Token identifier: `TOKEN_MINT` **or** `TOKEN_PAIR` / `DEX_LINK`

Optional:
- `PORT` (default `3001`)
- `BASE_IMAGES_PATH` (default `./server/public/horny_base`)
- `FORGE_RATE_LIMIT_*`, `RELEASE_RATE_LIMIT_PER_DAY`, `BRAND_SIMILARITY_THRESHOLD`

### Frontend (Vite)
The SPA reads public env vars using `VITE_*` or `NEXT_PUBLIC_*` prefixes:
- `VITE_TOKEN_MINT` / `NEXT_PUBLIC_TOKEN_MINT`
- `VITE_DEX_LINK` / `NEXT_PUBLIC_DEX_LINK`
- `VITE_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Run (Local Development)
```bash
npm run dev
npm --prefix server run dev
```
- Frontend: http://localhost:8080
- Backend: http://localhost:3001

The Vite dev server proxies `/api`, `/health`, and `/horny_base` to the backend.

## Build & Preview
```bash
npm run build
npm --prefix server run build
npm run preview
```

## Common Scripts
- `npm run lint`
- `npm run typecheck`
- `npm test` (runs server tests)
