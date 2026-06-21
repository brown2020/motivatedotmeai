# Auth Validation

| Check | Command Or Manual Path | Result | Evidence | Notes |
| --- | --- | --- | --- | --- |
| Lint | `npm run lint` | Passed | ESLint completed. | Default project gate. |
| Build | `npm run build` | Passed | Next build and TypeScript completed. | Default project gate. |
| Sign in | Live Google login | Not run | Requires user Google interaction. | Code path repaired; manual account QA still recommended. |
| Session local origin | POST `/api/auth/session` with `Origin: http://localhost:3007` and fake token. | Passed | Returned `400 Invalid idToken`, not origin rejection. | Proves local origin gate is no longer the blocker. |
| Session foreign origin | POST `/api/auth/session` with `Origin: https://evil.example` and fake token. | Passed | Returned `403 Invalid request origin`. | Confirms CSRF guard still rejects foreign origin. |
| Password visibility toggles | N/A | N/A | No password fields exist. | Deferred with provider setup gate. |
| Protected route | Code inspection | Passed by inspection | `proxy.ts` protected prefixes and `/api/auth/verify`. | Manual browser check still useful. |
| Admin route | N/A | N/A | No admin routes exist. | Add UID env before future admin routes. |
| Hard sign-out | Code inspection | Partial | Header sign-out clears session cookie and Firebase auth. | Footer hard sign-out/cache broadcast deferred. |
| Auth state matrix | Report inspection | Partial | `01-auth-inventory.md`, `06-session-and-proxy.md`. | Email/password/admin states are deferred gates. |
| Route protection matrix | Report inspection | Partial | `06-session-and-proxy.md`. | Manual stale/revoked session QA not run. |
| Navbar state matrix | Report inspection | Partial | `07-navigation-account-signout.md`. | Live state QA not run. |
| Footer hard logout while signed out | N/A | N/A | No footer sign-out. | Deferred. |
| Client/server mismatch | Code inspection/build | Passed | Failed session creation resets Firebase auth and shows UI error. | New behavior in `auth-store.ts` and `/signin`. |
