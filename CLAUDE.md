# CLAUDE.md

This file provides guidance for Claude Code when working with this codebase.

## Project Overview

**Motivate.me AI** - A Next.js goal/habit tracking app with Firebase auth, Firestore real-time data, and AI-powered coaching via OpenAI.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **UI**: React 19, Tailwind CSS 4.0
- **State**: Zustand 5
- **Validation**: Zod 4
- **Auth/Database**: Firebase 12 (client) + Firebase Admin 13 (server)
- **AI**: Vercel AI SDK 6 with OpenAI

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Run production server
npm run lint     # ESLint check
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/
│   │   ├── auth/session/   # Session cookie management (POST/DELETE)
│   │   ├── auth/verify/    # Session verification
│   │   └── ai/goal-insights/ # AI coaching endpoint (streaming)
│   ├── about/              # About page
│   ├── dashboard/          # Main dashboard
│   ├── goals/              # Goals list & [id] detail pages
│   ├── habits/             # Habits list & [id] detail pages
│   ├── privacy/            # Privacy policy
│   ├── profile/            # User profile
│   ├── signin/             # Auth pages
│   ├── terms/              # Terms of service
│   ├── tracker/            # Activity tracker
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page (public)
│   └── providers.tsx       # Client-side initialization
├── components/             # Shared React components
│   ├── ErrorAlert.tsx      # Error message display
│   ├── ErrorBoundary.tsx   # Error boundary
│   ├── Footer.tsx          # Footer with legal links
│   ├── GoalAiCoach.tsx     # AI coach streaming UI
│   ├── GoalInsights.tsx    # Goal progress display
│   ├── HabitAnalytics.tsx  # Habit tracking analytics
│   ├── Header.tsx          # Navigation header (mobile-responsive)
│   ├── LoadingSpinner.tsx  # Loading indicator
│   ├── QuickstartTemplatePicker.tsx # Onboarding templates
│   └── ui/                 # Low-level UI components
│       ├── HabitCheckbox.tsx
│       └── ProgressBar.tsx
├── lib/
│   ├── date-utils.ts       # Date utility functions
│   ├── dev-session.ts      # Dev session bypass utilities
│   ├── firebase-admin.ts   # Firebase Admin SDK
│   ├── firebase.ts         # Firebase client init
│   ├── quickstart-templates.ts # Goal/habit templates
│   └── require-session.ts  # Server-side auth guard
├── stores/                 # Zustand state management
│   ├── auth-store.ts       # Firebase auth state
│   └── app-store.ts        # Goals, habits, user data
└── types/
    ├── goals.ts            # Goal and milestone types
    ├── habits.ts           # Habit types
    ├── index.ts            # Re-exports all types
    └── user.ts             # User and daily log types

proxy.ts                    # Next.js 16 route protection middleware
```

## Architecture Patterns

### State Management (Zustand)
- **`useAuthStore()`**: Firebase auth state, sign-in/out methods
- **`useAppStore()`**: Goals, habits, user data with Firestore real-time sync
- Stores use `onSnapshot()` for live Firestore updates
- Unsubscribers stored in state to prevent memory leaks
- Direct hook access, no provider wrapping needed

### Authentication Flow
1. Client: Firebase Google popup auth
2. Server: httpOnly session cookies (14-day expiry, `sameSite: strict`)
3. Middleware (`proxy.ts`): Validates session on protected routes
4. CSRF protection via origin header validation
5. Dev mode: `ALLOW_DEV_SESSION=1` bypasses Firebase Admin (never in production)

### API Routes
- All require authentication via session cookies
- `/api/auth/session` - Create/delete session cookies (CSRF protected)
- `/api/auth/verify` - Validate session (called by middleware)
- `/api/ai/goal-insights` - Stream AI coaching (uses Zod validation)

### Protected Routes
Dashboard, goals, habits, tracker, profile require authentication. Middleware redirects unauthenticated users to `/signin?next={path}`.

### Public Routes
Home (`/`), About, Privacy, Terms, Sign In are public. Signed-in users on `/` or `/signin` are redirected to `/dashboard`.

## Conventions

### File Naming
- Components: PascalCase (`GoalInsights.tsx`)
- Routes: kebab-case folders with `page.tsx`
- Dynamic routes: `[id]` folders
- Client components: `"use client"` directive at top

### TypeScript
- Strict mode enabled
- Types organized in `src/types/` by domain (goals, habits, user)
- Zod schemas for API request validation
- Path alias: `@/*` maps to `./src/*`

### Styling
- Tailwind CSS utility classes (no CSS modules)
- Dark mode: use `dark:` prefix classes
- Primary color: indigo-600 / indigo-400 (dark)
- Progress colors: green (complete), indigo (in progress), yellow (starting)

### Data Handling
- Firestore `Timestamp` converted to JS `Date` on read
- Dates stored back as `Timestamp` on write
- Use `isSameLocalDay()` from `lib/date-utils.ts` for date comparisons
- Error state centralized in Zustand stores

## Environment Variables

```env
# Firebase Client (required)
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_APP_ID

# Firebase Admin (required in production)
FIREBASE_SERVICE_ACCOUNT_KEY    # Full JSON as string

# AI (optional)
OPENAI_API_KEY                  # Enables /api/ai/goal-insights

# Production URL (for CSRF validation)
NEXT_PUBLIC_APP_URL             # e.g., https://motivate.me

# Dev Mode (optional, never use in production)
ALLOW_DEV_SESSION=1             # Bypass Firebase Admin locally
```

## Firestore Collections

- `goals` - Goal documents (userId indexed)
- `habits` - Habit documents with completion tracking
- `users` - User profiles and preferences
- `users/{uid}/dailyLogs` - Sub-collection for daily logs

## Key Components

| Component | Purpose |
|-----------|---------|
| `Header` | Navigation with mobile hamburger menu |
| `Footer` | Links to About, Privacy, Terms |
| `GoalAiCoach` | Streaming AI coaching interface |
| `GoalInsights` | Goal progress, milestones, status |
| `HabitAnalytics` | Habit completion trends |
| `ProgressBar` | Progress indicator with color variants |
| `QuickstartTemplatePicker` | Onboarding template selection |

## Common Tasks

### Adding a new page
1. Create folder in `src/app/` with `page.tsx`
2. Add `"use client"` if client-side interactivity needed
3. Use `useAuthStore()` and `useAppStore()` for state
4. Add to `PROTECTED_PREFIXES` in `proxy.ts` if auth required
5. Add to `PUBLIC_PREFIXES` in `proxy.ts` if public

### Adding an API route
1. Create folder in `src/app/api/` with `route.ts`
2. Use `requireSessionUserId()` from `lib/require-session.ts` for auth
3. Validate input with Zod schemas
4. Return `NextResponse.json()` or stream with AI SDK

### Working with Firestore
1. Access via `useAppStore()` methods (handles subscriptions)
2. For direct access: `collection(db, 'collectionName')`
3. Convert Timestamps: check for `.toDate()` method on read

### Adding dark mode support
Add `dark:` variants for colors:
```tsx
className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
```
