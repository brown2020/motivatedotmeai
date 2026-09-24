# Motivate.me AI

Goal and habit tracking with Firebase auth, daily logs, and optional AI coaching insights. Create goals with milestones, track habits, log mood/energy/weight, and ask OpenAI for goal insights when configured. Demo: [https://motivatedotmeai.vercel.app](https://motivatedotmeai.vercel.app).

> Product inventory: [`SPEC.md`](./SPEC.md). Agent notes: [`AGENTS.md`](./AGENTS.md).

## Features

- **Goals** — create, update, delete; milestones; progress; quickstart templates; AI goal insights (when `OPENAI_API_KEY` is set)
- **Habits** — create, delete, toggle today’s completion, analytics
- **Tracker** — daily logs (mood, energy, weight, notes)
- **Dashboard** — progress overview
- **Profile** — preferences and profile photo URL
- **Auth** — Firebase email/password (sign-in, sign-up, forgot password) and Google; server session cookies via `/api/auth/session` + `/api/auth/verify`
- Public marketing / legal pages: home, about, privacy, terms

## Tech stack

| Layer | Tech |
| --- | --- |
| Framework | Next.js ^16.2.4 (App Router) |
| UI | React ^19.2.5, Tailwind CSS ^4.2.4 |
| Language | TypeScript ^6 |
| State | Zustand ^5.0.12 |
| Backend | Firebase ^12.12.1 + Firebase Admin ^13.8.0 |
| AI | Vercel AI SDK (`ai` ^6) + `@ai-sdk/openai` ^3 |
| Validation | Zod ^4.3.6 |
| Tests | Node.js built-in test runner (`tests/*.test.ts`) |

Requires Node.js `>= 22`.

## Project structure

```
src/
  app/                 # Pages + API routes
    api/auth/          # session, verify
    api/ai/goal-insights/
    dashboard/ goals/ habits/ tracker/ profile/
    signin/ signup/ forgot-password/
  components/          # Shared UI, auth, chrome
  stores/              # auth-store, app-store (Firestore)
  lib/                 # firebase, firebase-admin, session helpers, templates
  types/
proxy.ts               # Session-cookie route protection
firestore.rules  storage.rules
```

## Getting started

### Prerequisites

- Node.js 22+
- npm
- Firebase project (Auth, Firestore, Storage)
- Optional: OpenAI API key for goal insights

### Install

There is no `.env.example` in the repo; create `.env.local` with the variables below.

```bash
git clone https://github.com/brown2020/motivatedotmeai.git
cd motivatedotmeai
# Create .env.local (see table) — never commit secrets
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Deploy `firestore.rules` and `storage.rules` to Firebase before production use.

## Environment variables

| Name | Purpose | Where to get it |
| --- | --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client Firebase API key | Firebase Console → Project settings |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain | Same |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project id | Same |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App id | Same |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Admin service account JSON (string) for session cookies | Firebase Console → Service accounts |
| `OPENAI_API_KEY` | Enables `/api/ai/goal-insights` (returns 501 if unset) | [platform.openai.com](https://platform.openai.com) |
| `NEXT_PUBLIC_APP_URL` | Optional public app URL | Your deployment URL |
| `ALLOW_DEV_SESSION` | Dev-only session bypass when Admin is unset (`1` to enable). **Never enable in production.** | Local only |

Firebase client init is deferred so CI builds can succeed without secrets.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Node test runner on `tests/*.test.ts` |
| `npm run doctor` | React Doctor |

## Testing and CI

- `.github/workflows/ci.yml` on `dev` / `main`: lint → typecheck → test → build (secret-free gate).

## Deployment

Vercel-friendly. Set env vars in the host. Keep `ALLOW_DEV_SESSION` off in production.

## Contributing

Branch from `dev`. Preserve the session-cookie auth model. See [`AGENTS.md`](./AGENTS.md).

## License

GNU Affero General Public License v3.0 — see [LICENSE.md](LICENSE.md).
