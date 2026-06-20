# SPEC.md

## Product Purpose

Motivate.me AI is a goal and habit tracking web app. It helps signed-in users create goals, define milestones, track habits and daily logs, view dashboard progress, and request AI-generated coaching for a selected goal when `OPENAI_API_KEY` is configured.

## Current User-Facing Surface

- Public pages: home, about, privacy, terms, and sign-in.
- Protected pages: dashboard, goals, goal detail, habits, habit detail, tracker, and profile.
- Auth flow: Google sign-in through Firebase client auth, followed by server session-cookie creation through `/api/auth/session`.
- Goal workflows: create, update, delete, view progress, complete milestones, apply quickstart templates, and request AI goal insights.
- Habit workflows: create, delete, toggle today's completion, and view analytics.
- Tracker workflows: load and save daily logs with mood, energy, weight, and notes.
- Profile workflow: update user preferences and profile photo URL.

## Current Architecture

- `src/app/layout.tsx` wraps the app with client providers and shared layout.
- `src/app/providers.tsx` initializes auth, initializes the Firestore app store for the current UID, applies the dark-mode class, and redirects unauthenticated client navigation away from protected pages.
- Root `proxy.ts` verifies signed-in state for protected routes by checking session cookies and calling `/api/auth/verify`.
- `src/lib/require-session.ts` protects server API routes by validating Firebase Admin session cookies or the explicit development bypass.
- `src/stores/auth-store.ts` manages Firebase auth state and server session-cookie creation/deletion.
- `src/stores/app-store.ts` manages Firestore subscriptions and writes for goals, habits, user documents, and daily logs.
- `src/components/` provides shared page chrome, analytics, progress, error, loading, and quickstart UI.

## Data and External Services

- Firebase client environment variables are required for auth and Firestore client operations.
- `FIREBASE_SERVICE_ACCOUNT_KEY` is required in production for session-cookie creation and verification.
- `ALLOW_DEV_SESSION=1` enables a development-only session bypass when Firebase Admin is not configured.
- `OPENAI_API_KEY` enables `/api/ai/goal-insights`; without it, that route returns a 501 response.
- Firestore collections documented in code are `goals`, `habits`, `users`, and `users/{uid}/dailyLogs`.

## Validation State

- `npm run build` is the strongest package-defined quality gate at the start of the 2026-06-20 codebase improvement pass.
- No package-defined lint, test, or typecheck scripts currently exist.
- ESLint configuration and dependencies exist, but there is no `npm run lint` script.

## Current Codebase Risks

- `src/stores/app-store.ts` is a large shared store that mixes subscriptions, writes, derived calculations, and daily-log logic.
- Some Firestore writes still derive updates from client-side store snapshots, which can be stale under rapid interaction or multiple tabs.
- The repository has documented GitHub dependency vulnerabilities on push; package cleanup requires a dedicated dependency pass.
- Automated test coverage is not present in the package scripts.

## Non-Roadmap Improvement Goals

- Keep route protection and server API authorization verifiable.
- Make Firestore write paths safer under repeated or concurrent user actions.
- Add explicit quality scripts when safe and align docs with package scripts.
- Reduce shared-store complexity through small, behavior-preserving changes.
