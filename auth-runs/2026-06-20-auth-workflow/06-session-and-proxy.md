# Session And Proxy

## Auth State Model

| State | Source Of Truth | UI Behavior | Server Behavior | Verification |
| --- | --- | --- | --- | --- |
| Unknown/bootstrap | Firebase auth observer pending. | Sign-in loading shell; protected client pages wait. | Server still requires cookies. | Build passed. |
| Signed out | Firebase user null and no session cookie. | Public pages render; protected pages redirect. | `proxy.ts` redirects protected pages. | Code inspected. |
| Signed in unverified | Not applicable to current Google-only UI. | Deferred. | Deferred. | Provider gate recorded. |
| Signed in verified | Firebase user plus valid server session cookie. | Protected pages render. | `/api/auth/verify` succeeds. | Build passed; live login not run. |
| Admin | No admin routes/env today. | No admin links. | No admin route policy. | Inventory only. |
| Stale/invalid | Session cookie present but verify fails. | Redirect to sign-in. | `proxy.ts` clears stale cookies. | Code inspected. |
| Signing out | Auth store sign-out. | Clears session, Firebase auth, navigates to `/signin`. | Session cookies deleted. | Code inspected. |

## Session Endpoints

- `POST /api/auth/session`: validates Origin/Referer, validates Firebase ID token shape, creates `__session` with Firebase Admin or `__dev_session` in explicit local dev mode.
- `DELETE /api/auth/session`: clears both session cookies.
- `GET /api/auth/verify`: verifies the session cookie or dev bypass cookie.
- This run changed local CSRF origin handling from fixed `localhost:3000` prefixes to parsed local origins for `localhost`, `127.0.0.1`, and `[::1]` on any port.

## Bootstrap And Refresh

- Client auth is initialized once in `src/app/providers.tsx`.
- Auth store watches Firebase auth state and clears server cookies when Firebase signs out.
- The sign-in flow now creates the server session before routing to the protected target and resets Firebase auth if session creation fails.

## Server Verification

- Protected pages use `proxy.ts`.
- Protected API work uses `requireSessionUserId()`.
- Production session cookies require `FIREBASE_SERVICE_ACCOUNT_KEY`.

## proxy.ts

- Public route handling and protected route redirects remain unchanged.
- API routes are skipped by proxy; individual protected APIs must verify server sessions.
- Signed-in users visiting `/` or `/signin` redirect to `/dashboard`.

## Route Protection Matrix

| Scenario | Result | Evidence | Notes |
| --- | --- | --- | --- |
| Public route signed out | Pass by inspection | `proxy.ts` public prefixes. | Live browser not required. |
| Auth-only route signed in | Pass by inspection | `/signin` redirects signed-in users. | Requires live session for manual QA. |
| Protected page signed out | Pass by inspection | Protected prefixes redirect without session. | Requires live browser for end-to-end QA. |
| Protected API/server action signed out | Pass by inspection | `goal-insights` calls `requireSessionUserId()`. | No token-spending without session. |
| Protected data not public/static cached | Pass by inspection | Protected pages are client data surfaces behind proxy. | Build route output reviewed. |
| Admin route non-admin | N/A | No admin routes. | Add UID allowlist before adding admin routes. |
| Admin route admin | N/A | No admin routes. | Add UID allowlist before adding admin routes. |
| Stale/revoked session | Pass by inspection | `proxy.ts` verifies via `/api/auth/verify` and clears cookies on redirect. | Manual revoked-token QA not run. |

## Admin Routes

- None found.
- Future admin routes should use server-only UID membership configured by env.

## Drift And Cache Cleanup

- Sign-in session failure now resets Firebase auth and server cookies, then shows a user-facing error.
- Sign-out clears server cookie and Firebase state, then forces full navigation to `/signin`.
- Full local storage/cache clearing and cross-tab broadcast hard logout remain deferred hardening items.
