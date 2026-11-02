# SPEC.md

## Product Purpose

Motivate.me AI is a goal and habit tracking web app. It helps signed-in users create goals, define milestones, track habits and daily logs, view dashboard progress, and request AI-generated coaching for a selected goal when `OPENAI_API_KEY` is configured.

## Current User-Facing Surface

- Public pages: home, about, privacy, terms, sign-in, sign-up, and forgot-password.
- Protected pages: dashboard, goals, goal detail, habits, habit detail, tracker, and profile.
- Auth flow: email/password (sign-in, create-account, forgot-password with show/hide password) and Google sign-in through Firebase client auth, followed by server session-cookie creation through `/api/auth/session`. Email/password accounts must verify their email before that cookie is issued. Session requests are accepted from the configured app URL, from the request's own `Host` or `x-forwarded-host`, and from `https://*-ignitechannel.vercel.app` previews. Other origins are rejected. Verification and password-reset emails include the current site as the continue URL, then retry without it when Firebase returns `auth/unauthorized-continue-uri` (Vercel preview hosts that are not authorized domains). Sign-in and sign-up expose Resend verification email, which waits 60 seconds after a send so it does not trip Firebase's email limit.
- Goal workflows: create, update, delete, view progress, complete milestones, apply quickstart templates, and request AI goal insights.
- Habit workflows: create, delete, toggle today's completion, and view analytics.
- Tracker workflows: load and save daily logs with mood, energy, weight, and notes.
- Profile workflow: update user preferences and profile photo URL.

## Current Architecture

- `src/app/layout.tsx` wraps the app with client providers and shared layout.
- `src/app/providers.tsx` initializes auth, initializes the Firestore app store for the current UID, applies the dark-mode class, and redirects unauthenticated client navigation away from protected pages.
- `src/proxy.ts` verifies signed-in state for protected routes by checking session cookies and calling `/api/auth/verify`. It has to live next to `src/app` or Next.js will not register it.
- `src/lib/require-session.ts` protects server API routes by validating Firebase Admin session cookies or the explicit development bypass.
- `src/stores/auth-store.ts` manages Firebase auth state and server session-cookie creation/deletion.
- `src/stores/app-store.ts` manages Firestore subscriptions and writes for goals, habits, user documents, and daily logs.
- `src/components/` provides shared page chrome, analytics, progress, error, loading, and quickstart UI.

## Data and External Services

- Firebase client environment variables are required for auth and Firestore client operations.
- `FIREBASE_SERVICE_ACCOUNT_KEY` is required in production for session-cookie creation and verification.
- `NEXT_PUBLIC_APP_URL` is required in production. Session cookie create/delete requests are rejected unless their origin matches it.
- `ALLOW_DEV_SESSION=1` enables a development-only session bypass when Firebase Admin is not configured.
- `OPENAI_API_KEY` enables `/api/ai/goal-insights`; without it, that route returns a 501 response.
- Firestore collections documented in code are `goals`, `habits`, `users`, and `users/{uid}/dailyLogs`.

## Validation State

- `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` are the local quality gates. `npm test` runs the Node test runner on `tests/*.test.ts`.
- React Doctor score target is 100 (`npm run doctor`).
- `npm audit` reports 0 vulnerabilities. Transitive `minimatch` is overridden to 11.0.4 and `glob` to 14.0.3. `@grpc/grpc-js` stays at `>=1.14.7`. `jwks-rsa`'s `jose` stays pinned to 5.10.0 so `require("firebase-admin/auth")` keeps working (jose 6 is ESM-only and `jwks-rsa` loads it with `require()`).

## Current Codebase Risks

- `src/stores/app-store.ts` is a large shared store that mixes subscriptions, writes, derived calculations, and daily-log logic.
- Some Firestore writes still derive updates from client-side store snapshots, which can be stale under rapid interaction or multiple tabs.
- TypeScript stays on 6.0.3. TypeScript 7.0.2 typechecks with `tsc`, but it ships no programmatic API and `typescript-eslint` 8.72.1 refuses to load it.
- `npm test` covers auth/session helpers, goal status, habit streaks, the AI coach prompt, and quickstart template application. UI flows are not covered by a browser runner.

## Non-Roadmap Improvement Goals

- Keep route protection and server API authorization verifiable.
- Make Firestore write paths safer under repeated or concurrent user actions.
- Add explicit test/typecheck scripts when safe and align docs with package scripts.
- Reduce shared-store complexity through small, behavior-preserving changes.
