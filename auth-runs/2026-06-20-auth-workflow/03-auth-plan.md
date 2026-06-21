# Auth Architecture Plan

## Route Policy

- Public: `/`, `/about`, `/privacy`, `/terms`.
- Auth-only: `/signin`; signed-in users redirect to `/dashboard`.
- Protected: `/dashboard`, `/goals`, `/habits`, `/tracker`, `/profile` and nested detail pages under those prefixes.
- Protected API: `/api/ai/goal-insights` requires `requireSessionUserId()`.
- Session API: `/api/auth/session` remains public but CSRF-guarded and token-validated.
- Admin: none currently. Future admin routes must use server-only `ADMIN_UID` or `ADMIN_UIDS` before exposure.

## Session Truth Model

- Firebase client auth personalizes UI and obtains fresh ID tokens.
- Server session truth is an httpOnly Firebase Admin session cookie named `__session`.
- `proxy.ts` verifies session cookies through `/api/auth/verify` before allowing protected pages.
- API routes performing protected work must call `requireSessionUserId()`.
- Development-only bypass uses `__dev_session` only when `ALLOW_DEV_SESSION=1` and never in production.

## Admin UID Source

- No admin routes or admin UID env names exist today.
- Future admin behavior should read UID allowlists only on the server from `ADMIN_UID` or `ADMIN_UIDS`.

## Owned Files

- `src/app/api/auth/session/route.ts`
- `src/stores/auth-store.ts`
- `src/app/signin/sign-in-client.tsx`
- `auth-runs/2026-06-20-auth-workflow/*`

## Validation Plan

- Run `npm run lint`.
- Run `npm run build`.
- Use local dev server on port 3007 to verify:
  - `Origin: http://localhost:3007` reaches ID token validation.
  - foreign origins still receive `403 Invalid request origin`.
- Manual live Google login was not completed because it requires user account interaction in the browser.
