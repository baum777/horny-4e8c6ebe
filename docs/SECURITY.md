# Security

## Authentication & Authorization
- Authentication relies on Supabase JWTs extracted from the `Authorization` header.
- Protected routes use `requireAuth` to enforce authentication.
- Admin routes are gated by `ADMIN_USER_IDS` env var (ensure it is set in production).

## Secrets Handling
- Backend uses `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY`; store these in a secrets manager.
- Frontend env vars are public and must not include sensitive secrets.

## CORS
- CORS is configured in `server/src/app.ts`. Production deployments should use a strict allowlist for `origin`.

## Rate Limiting
- Current rate limiting is in-memory and per-instance only.
- Use a shared store (Redis) if deploying multiple instances.

## Logging
- Avoid logging access tokens or sensitive payloads.
- Ensure logs are retained and scrubbed per compliance requirements.
