## motivatedotmeai

A Next.js app for tracking goals/habits with Firebase-backed auth and an AI “goal insights” endpoint.

### Tech stack (from `package-lock.json`)

- **Framework**: Next.js `^16.0.3`
- **UI**: React `^19.0.0`, Tailwind CSS `^4.0.8`
- **State**: Zustand `^5.0.2`
- **Validation**: Zod `^4.1.13`
- **Auth/Data/Storage**: Firebase `^12.6.0` (client), `firebase-admin` `^13.4.0` (server)
- **AI**: Vercel AI SDK (`ai` `^6.0.3`) + `@ai-sdk/openai` `^3.0.1`

### Requirements

- **Node.js**: `>= 18` (required by the AI SDK dependencies)
- **Firebase project**: for client-side auth + Firestore/Storage
- **OpenAI API key** (optional): to enable the AI goal insights route

### Setup

Install dependencies:

```bash
npm install
```

Create a `.env.local` (or set equivalent environment variables in your hosting environment).

### Environment variables

Firebase (client):

- **`NEXT_PUBLIC_FIREBASE_API_KEY`**
- **`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`**
- **`NEXT_PUBLIC_FIREBASE_PROJECT_ID`**
- **`NEXT_PUBLIC_FIREBASE_APP_ID`**

Firebase (server / session cookies):

- **`FIREBASE_SERVICE_ACCOUNT_KEY`**: the full Firebase service account JSON, as a single JSON string.
  - This is required in **production** to create/verify session cookies.
  - If missing in production, `/api/auth/session` returns `SESSION_NOT_CONFIGURED`.

Local dev convenience (optional):

- **`ALLOW_DEV_SESSION=1`**: enables a **dev-only session bypass** when `FIREBASE_SERVICE_ACCOUNT_KEY` is not set and `NODE_ENV !== "production"`.

AI (optional):

- **`OPENAI_API_KEY`**: enables `/api/ai/goal-insights`. If missing, the route responds with `501` and `AI not configured`.

### Running locally

```bash
npm run dev
```

Then open `http://localhost:3000`.

### Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

### License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. See `LICENSE.md`.
