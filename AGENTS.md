# AGENTS.md

## Project Overview

Motivate.me AI is a Next.js App Router application for goal and habit tracking. It uses Firebase client auth, Firebase Admin session cookies on the server, Firestore-backed goal/habit/user data, Zustand client stores, and an optional AI goal-insights API backed by the Vercel AI SDK and OpenAI.

## Current Stack

- Next.js 16 with React 19 and TypeScript strict mode.
- Tailwind CSS 4 through PostCSS.
- Zustand stores in `src/stores/`.
- Firebase client SDK in `src/lib/firebase.ts` and Firebase Admin in `src/lib/firebase-admin.ts`.
- Route protection is implemented in root `proxy.ts`, with session verification through `/api/auth/verify`.
- Firestore and Storage rules live in `firestore.rules` and `storage.rules`.

## Commands

```bash
npm run dev
npm run build
npm run start
```

`package.json` does not currently define a lint, test, or typecheck script. ESLint dependencies and `eslint.config.mjs` exist, so use a direct ESLint invocation only after confirming the installed ESLint version supports the repo config.

## Important Paths

- `src/app/` contains pages, layouts, client providers, and API routes.
- `src/components/` contains shared UI components.
- `src/lib/` contains Firebase, session, date, and template utilities.
- `src/stores/app-store.ts` owns goal, habit, user, and daily-log Firestore state.
- `src/stores/auth-store.ts` owns Firebase auth state and session-cookie sync.
- `src/types/` contains goal, habit, and user domain types.
- `proxy.ts` protects authenticated routes and redirects public signed-in traffic.

## Operating Notes

- Preserve the session-cookie model: client auth personalizes UI, server routes must validate session cookies before protected work.
- Keep Firebase dev-session bypass development-only. `ALLOW_DEV_SESSION=1` must never authorize production traffic.
- Treat `src/stores/app-store.ts` as a high-risk shared module because it owns subscriptions, writes, and derived state for several domains.
- Prefer small, verifiable changes. Keep bug fixes separate from package updates and cleanup.
- Do not invent product roadmap direction in codebase-health work. Update `SPEC.md` current-state and validation notes only when code evidence changes.
- Before pushing code changes, run `npm run build` until stronger project scripts are added.
