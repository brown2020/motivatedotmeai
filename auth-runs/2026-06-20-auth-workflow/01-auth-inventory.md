# Auth Inventory

## Sources Read

- `AGENTS.md`
- `SPEC.md`
- `README.md`
- `CLAUDE.md`
- `package.json`
- `src/lib/firebase.ts`
- `src/lib/firebase-admin.ts`
- `src/lib/dev-session.ts`
- `src/lib/require-session.ts`
- `src/stores/auth-store.ts`
- `src/stores/app-store.ts`
- `src/app/signin/page.tsx`
- `src/app/signin/sign-in-client.tsx`
- `src/app/api/auth/session/route.ts`
- `src/app/api/auth/verify/route.ts`
- `src/app/api/ai/goal-insights/route.ts`
- `src/app/providers.tsx`
- `src/components/Header.tsx`
- `src/components/Footer.tsx`
- `proxy.ts`

## Framework And Firebase

- Framework: Next.js App Router, Next 16, React 19, TypeScript strict mode.
- Firebase client SDK is initialized in `src/lib/firebase.ts`.
- Firebase Admin is initialized from `FIREBASE_SERVICE_ACCOUNT_KEY` in `src/lib/firebase-admin.ts`.
- Server truth uses Firebase Admin session cookies named `__session`, with a development-only `__dev_session` bypass guarded by `ALLOW_DEV_SESSION=1`.

## Current Auth Provider

| Provider | Evidence | Verdict | Replacement Needed |
| --- | --- | --- | --- |
| Firebase | `firebase`, `firebase-admin`; `GoogleAuthProvider`; session cookie exchange in `/api/auth/session`. | Active provider. | No. |
| Clerk | No packages/imports found. | Not present. | No. |
| NextAuth/Auth.js | No packages/imports/routes found. | Not present. | No. |
| Auth0 | No packages/imports found. | Not present. | No. |
| Supabase Auth | No packages/imports found. | Not present. | No. |
| WorkOS/AuthKit | No packages/imports found. | Not present. | No. |
| Cognito/Amplify | No packages/imports found. | Not present. | No. |
| Custom auth | Custom Firebase session endpoints only. | Keep as Firebase session layer. | No. |

## Firebase Setup Gate

- Client Firebase env names are present in `.env`.
- `FIREBASE_SERVICE_ACCOUNT_KEY` is not present in `.env` or `.env.local`; production session cookies require it.
- Google provider is implemented in code, but Firebase Console provider state and authorized domains cannot be proven from local files.
- The active browser OAuth flow uses `http://localhost:3007`; the previous session endpoint allowed only port 3000 for local origin checks.
- Email/password, email link, password reset, and email verification providers/forms are not implemented in this repo. Treat these as a product/setup decision and Firebase Console setup gate before adding code paths.
- No admin routes or `ADMIN_UID`/`ADMIN_UIDS` environment variables were found.

## Route Classes

| Route | Class | Evidence | Required Guard |
| --- | --- | --- | --- |
| `/`, `/about`, `/privacy`, `/terms` | Public | `proxy.ts` public prefixes. | No session required; `/` redirects signed-in users to dashboard. |
| `/signin` | Auth-only public | `proxy.ts` special-cases signed-in redirect. | Signed-out users allowed; signed-in users redirect to `/dashboard`. |
| `/dashboard`, `/goals`, `/goals/[id]`, `/habits`, `/habits/[id]`, `/tracker`, `/profile` | Protected | `proxy.ts` protected prefixes. | Session cookie or dev session bypass required. |
| `/api/auth/session` | Public session exchange | Route owns CSRF and token validation. | Origin/referer check plus ID token validation. |
| `/api/auth/verify` | Server session verification | Called by `proxy.ts`. | Session cookie or dev session cookie. |
| `/api/ai/goal-insights` | Protected API | Calls `requireSessionUserId()`. | Server session required before OpenAI call. |
| Admin routes | None found | No `/admin` route or admin UID env found. | Add server-only UID allowlist before adding admin routes. |

## Auth State Sources

- Client bootstrap: Firebase `onAuthStateChanged` in `src/stores/auth-store.ts`.
- Server truth: Firebase Admin session cookie verified by `/api/auth/verify`, `proxy.ts`, and `requireSessionUserId()`.
- App data: Zustand app store subscriptions use Firebase client user state.
- Profile avatar: uploaded Firebase Storage URL, Firebase `photoURL`, then Gravatar fallback.

## Auth State Model And Drift Risks

| State Or Drift Case | Evidence | Expected Behavior | Verification |
| --- | --- | --- | --- |
| Unknown/bootstrap | `isLoading` in auth store; providers init once. | Sign-in page shows loading shell; protected client pages wait. | Build passed. |
| Signed out | `user: null`; session cookies cleared on sign-out/Firebase null state. | Public routes render; protected routes redirect. | Route policy inspected. |
| Signed in unverified | No email/password verification flow in current product surface. | Not applicable for Google-only flow; record provider setup gate. | Not run. |
| Signed in verified | Firebase user plus server session cookie. | Protected pages/API allowed after server verification. | Build passed; manual live login not run. |
| Admin | No admin routes/env present. | No admin behavior exposed. | Inventory only. |
| Stale/invalid session | `proxy.ts` calls `/api/auth/verify`; failed verify redirects and clears cookies. | Protected route blocked and stale cookies cleared. | Code inspected. |
| Signing out | Auth store clears server cookie, Firebase auth, then navigates to `/signin`. | Full navigation refreshes server/proxy state. | Code inspected. |
| Client/server mismatch | Client sign-in must create server session before navigation. | Failed session creation resets Firebase auth and now shows an error. | Implemented in this run. |
| Cross-tab logout | Firebase auth observer clears cookies when user becomes null. | Other tabs converge when Firebase auth state changes. | Code inspected; browser QA not run. |

## Navbar Account Avatar Footer

- Header appears on protected pages and uses auth/app user data.
- Header sign-out uses the auth store and redirects to `/signin`.
- Footer is public-link only; no hard sign-out footer control exists.
- Avatar fallback currently uses Gravatar remote fallback.

## Gaps And Risks

- Primary fixed gap: `/api/auth/session` only allowed `localhost:3000`, while the active local OAuth flow uses `localhost:3007`.
- Primary fixed gap: Google sign-in/session failures were console-only and not user-facing.
- Remaining setup gate: production needs `FIREBASE_SERVICE_ACCOUNT_KEY`.
- Remaining setup gate: Firebase Console provider status and authorized domains, especially `localhost:3007`, must be confirmed.
- Remaining product decision: email/password, email link, password reset, and verification UI are not part of the current app surface.
- Remaining admin decision: no server-only admin UID allowlist exists because no admin routes exist.

## Baseline Commands

- `npm run lint`: passed after code changes.
- `npm run build`: passed after code changes.
