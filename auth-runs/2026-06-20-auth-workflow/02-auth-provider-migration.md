# Auth Provider Migration

## Provider Verdict

- Verdict: Firebase is already the active auth provider.
- Evidence: Firebase client/Admin SDK dependencies, `GoogleAuthProvider`, Firebase Admin session cookie exchange, and Firebase session verification in `proxy.ts`.
- Replacement needed: No. No non-Firebase provider was found.

## Old Auth Surfaces

| Surface | Evidence | Firebase Replacement | Remove/Keep/Defer | Notes |
| --- | --- | --- | --- | --- |
| Packages | `firebase`, `firebase-admin` present; no Clerk/Auth0/etc. | Existing Firebase packages. | Keep. | No package migration. |
| Routes/callbacks | `/api/auth/session`, `/api/auth/verify`. | Existing Firebase session endpoints. | Keep and repair. | Session origin handling repaired. |
| Middleware/proxy | `proxy.ts` verifies session through `/api/auth/verify`. | Existing Firebase session truth. | Keep. | Admin policy deferred because no admin routes exist. |
| Cookies/storage | `__session`, `__dev_session`, Firebase client state. | Existing cookie/session model. | Keep. | Hard sign-out clears server cookie and Firebase state. |
| Env vars | Firebase client envs present; Admin key absent locally. | Firebase envs. | Keep. | No secret values recorded. |
| UI components | Google-only sign-in page. | Firebase Google provider. | Keep and repair. | User-facing error added. |
| Tests/mocks | No test script in `package.json`. | Lint/build plus targeted curl QA. | Defer. | Add auth tests when test runner exists. |

## Firebase Setup Checklist

| Item | Status | Evidence Or User Action |
| --- | --- | --- |
| Firebase project selected/created | Unknown | Confirm in Firebase Console. |
| Web app registered | Likely | Client env names are present locally. |
| Client env names documented | Present | `.env` contains `NEXT_PUBLIC_FIREBASE_*` names. |
| Authentication enabled | Unknown | Confirm in Firebase Console. |
| Google provider enabled | Unknown | Code uses Google; Console state must be confirmed. |
| Email/password enabled | Unknown | No current app UI; enable only if product surface is approved. |
| Email link enabled if needed | Unknown | No current app UI; enable only if product surface is approved. |
| Authorized domains set | Unknown | Confirm `localhost`, the active local dev origin, and the production domain. |
| Email action URLs set | Unknown | Required before email verification/password reset flows are added. |
| Admin SDK server env ready | Missing locally | Add `FIREBASE_SERVICE_ACCOUNT_KEY` in production/server env. |
| ADMIN_UID/ADMIN_UIDS server env ready | Not applicable | No admin route exists; add before admin routes. |

## Migration Plan

1. Keep Firebase as the sole provider.
2. Repair the Google sign-in session exchange for local ports.
3. Add user-facing auth/session errors to the sign-in UI.
4. Record Firebase Console and product-surface setup gates for flows not currently implemented.

## User Setup Handoff

- Confirm Google provider is enabled in Firebase Authentication.
- Confirm the local development origin used by the app, currently `http://localhost:3007`, is authorized where Firebase/Google requires it.
- Add `FIREBASE_SERVICE_ACCOUNT_KEY` to production/server env before relying on real session cookies in production.
- Decide whether this app should add email/password, email link, password reset, and email verification flows; then enable the matching Firebase providers and email action URLs.

## Result

- No provider migration required.
- Google/session repair completed in code.
- External Firebase setup gates recorded.
