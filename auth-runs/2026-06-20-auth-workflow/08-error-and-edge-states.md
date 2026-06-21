# Error And Edge States

## User-Facing Errors

- Added auth store error state and `clearError()`.
- Added sign-in page `ErrorAlert` for Google popup/session failures.
- Added in-progress sign-in state to prevent overlapping popup attempts.

## Redirect Safety

- Existing `normalizeNextPath()` only allows protected internal prefixes and rejects protocol-relative/absolute redirects.
- Sign-in now redirects only after server session creation succeeds.

## CSRF And Abuse Guardrails

- Session POST now validates parsed origins/referers.
- Local development allows trusted local hostnames on any port, including the current `localhost:3007`.
- Foreign origins still receive `403 Invalid request origin`.
- Server session creation still validates ID token shape before Firebase Admin work.

## Stale Session Handling

- Proxy verifies session cookies server-side through `/api/auth/verify`.
- Failed protected-route verification clears stale session cookies.
- Firebase sign-out/null state also clears server session cookies.
