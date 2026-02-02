# Codebase Improvement Plan

## Executive Summary

This plan identifies bugs, design issues, missing pages, security gaps, dead code, and organizational problems. Items are prioritized as **Critical**, **Important**, or **Nice-to-Have**.

---

## Critical Issues

### 1. Middleware Not Registered (Route Protection Broken)

**Location:** `proxy.ts` (project root)

**Problem:** The middleware file exists but is **not registered** with Next.js. There's no `src/middleware.ts` that exports it.

**Impact:** Server-side route protection is completely non-functional. Protected routes rely only on client-side guards.

**Fix:**
```typescript
// Create src/middleware.ts
export { default, config } from "../../proxy";
```

Or move `proxy.ts` to `src/middleware.ts` directly.

---

### 2. Auth Race Conditions & Duplicate State Systems

**Locations:**
- `src/stores/auth-store.ts:20-42`
- `src/stores/app-store.ts:169-195`
- `src/context/AuthContext.tsx` (entire file - unused)
- `src/context/AppContext.tsx` (entire file - unused)

**Problems:**
1. Module-level `unsubscribeAuth` variable creates race conditions with multiple listeners
2. App store subscription cleanup can race when switching users
3. Two complete auth systems exist (Zustand + Context) but only Zustand is used
4. `onAuthStateChanged` fires before session cookie creation completes

**Fix:**
- Delete `src/context/AuthContext.tsx` and `src/context/AppContext.tsx` (650 lines of dead code)
- Store unsubscribers in Zustand state, not module-level variables
- Add a flag to prevent auth listener from triggering redirects until session is created

---

### 3. Missing Core Pages

**Status:**
| Page | Exists |
|------|--------|
| Home (/) | Redirects only - no marketing landing page |
| About (/about) | **Missing** |
| Privacy Policy (/privacy) | **Missing** |
| Terms of Service (/terms) | **Missing** |

**Fix:** Create these pages:
- `src/app/about/page.tsx`
- `src/app/privacy/page.tsx`
- `src/app/terms/page.tsx`
- Update `src/app/page.tsx` with a public landing page
- Create a `Footer` component with links to legal pages

---

### 4. Client-Side Auth Guard Race Condition

**Location:** `src/app/providers.tsx:29-50`

**Problem:** Protected content renders while `isAuthLoading` is true. Users can see authenticated UI briefly before redirect.

**Fix:** Don't render children until auth state is resolved:
```typescript
if (isAuthLoading) {
  return <LoadingSpinner />;
}
```

---

### 5. Non-Atomic Firestore Operations

**Locations:**
- `src/stores/app-store.ts:451-478` (habit toggle)
- `src/stores/app-store.ts:696-728` (daily log save)

**Problem:** Read-modify-write without transactions. Rapid clicks cause data corruption.

**Fix:** Use Firestore transactions or Cloud Functions for atomic operations.

---

## Important Issues

### 6. Dark Mode Not Implemented

**Location:** All pages and components

**Problem:** Dark mode toggle exists in profile, but no `dark:` Tailwind classes are applied anywhere. Toggle does nothing visually.

**Fix:** Add dark mode classes to all components:
```tsx
// Before
<div className="bg-white text-gray-900">

// After
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
```

---

### 7. Header Not Mobile-Responsive

**Location:** `src/components/Header.tsx`

**Problem:** Navigation links don't collapse on mobile. Will overflow or wrap awkwardly.

**Fix:** Add hamburger menu for mobile with a slide-out or dropdown navigation.

---

### 8. Missing Input Border Classes

**Location:** All form inputs across pages

**Problem:** Inputs use `border-gray-300` but missing the `border` class itself.

**Fix:** Add `border` class to all form inputs:
```tsx
className="border border-gray-300 ..."
```

Affected files:
- `src/app/goals/page.tsx`
- `src/app/habits/page.tsx`
- `src/app/tracker/page.tsx`
- `src/app/profile/page.tsx`

---

### 9. Inconsistent Progress Bar Colors

**Locations:**
- `src/app/dashboard/page.tsx:387` - Uses green/blue/yellow logic
- `src/app/goals/[id]/page.tsx:145` - Uses single indigo
- `src/components/ui/ProgressBar.tsx:21` - Uses blue
- `src/components/GoalInsights.tsx:54` - Uses green/blue/yellow logic

**Fix:** Create a single color strategy and apply consistently via the `ProgressBar` component.

---

### 10. HabitCheckbox Color Mismatch

**Location:** `src/components/ui/HabitCheckbox.tsx:27`

**Problem:** Uses `text-blue-600` while all other checkboxes use `text-indigo-600`.

**Fix:** Change to `text-indigo-600 focus:ring-indigo-500`.

---

### 11. Dev Session Bypass Security Risk

**Locations:**
- `proxy.ts`
- `src/lib/require-session.ts`
- `src/app/api/auth/session/route.ts`
- `src/app/api/auth/verify/route.ts`

**Problem:** `ALLOW_DEV_SESSION=1` duplicated in 4 places. If accidentally set in production, auth is bypassed entirely.

**Fix:**
- Centralize dev bypass check in a single utility
- Add explicit warning logs when dev bypass is active
- Ensure it cannot be enabled in production builds

---

### 12. Missing CSRF Protection

**Location:** `src/app/api/auth/session/route.ts`

**Problem:** Session creation endpoint doesn't validate origin/referrer.

**Fix:** Add CSRF token validation or check `Origin` header matches allowed domains.

---

### 13. Session Cookie Security

**Location:** `src/app/api/auth/session/route.ts:68-74`

**Problem:** Uses `sameSite: "lax"` which allows same-site POST requests.

**Fix:** Change to `sameSite: "strict"` for better CSRF protection.

---

### 14. Type Definitions Scattered

**Locations:**
- `src/stores/app-store.ts:27-84` (Habit, UserDoc, DailyLog types)
- `src/context/AppContext.tsx:27-101` (duplicate types)
- `src/types/goals.ts` (only file in types/)

**Fix:**
- Create `src/types/habits.ts`
- Create `src/types/user.ts`
- Move types from stores to type files
- Delete duplicate types in context files

---

### 15. Empty Directory

**Location:** `src/app/components/` (empty)

**Fix:** Delete this directory. Shared components are correctly in `src/components/`.

---

## Nice-to-Have Improvements

### 16. Large Store File

**Location:** `src/stores/app-store.ts` (775 lines)

**Suggestion:** Consider splitting into focused stores:
- `src/stores/goal-store.ts`
- `src/stores/habit-store.ts`
- `src/stores/daily-log-store.ts`

---

### 17. Unused Store Methods

**Location:** `src/stores/app-store.ts`

**Dead code:**
- `calculateGoalProgress()` (lines 552-583) - defined but never called
- `updateGoalStatus()` (lines 585-607) - defined but never called

**Fix:** Remove or document as future features.

---

### 18. Unused Type Definition

**Location:** `src/types/goals.ts:14`

**Problem:** `ReminderFrequency` type is defined but never used (always set to `undefined`).

**Fix:** Remove or document as future feature.

---

### 19. Duplicate Utility Function

**Location:** `isSameLocalDay()` defined in 3 places:
- `src/context/AppContext.tsx:321-327`
- `src/stores/app-store.ts:139-145`
- Inline in `src/app/tracker/page.tsx`

**Fix:** Create `src/lib/date-utils.ts` and consolidate.

---

### 20. Inconsistent Button Styles

**Locations:** Various pages

**Problem:** Secondary buttons have different styles across pages (some use `ring-1 ring-gray-200`, others use `border border-gray-300`).

**Fix:** Create standardized button variants in a shared component or Tailwind config.

---

### 21. Missing Footer Component

**Problem:** No footer exists. Legal pages (once created) won't be linked.

**Fix:** Create `src/components/Footer.tsx` with links to About, Privacy, Terms.

---

### 22. Empty State Inconsistency

**Locations:**
- `src/app/goals/page.tsx:292-312` - Full empty state with icon
- `src/app/tracker/page.tsx:172` - Simple text
- `src/app/habits/[id]/page.tsx:163-164` - List item text

**Fix:** Create reusable `EmptyState` component.

---

### 23. Error Wrapper Spacing

**Locations:** Various pages use `mt-6` or `mt-4` inconsistently for error alerts.

**Fix:** Standardize to `mt-6` everywhere.

---

### 24. Modal Z-Index and Mobile Padding

**Locations:**
- `src/app/goals/page.tsx:122` - Missing `z-50` and mobile padding
- `src/components/QuickstartTemplatePicker.tsx:21` - Has both (good)

**Fix:** Add `z-50` and `p-4` wrapper to all modals.

---

### 25. No Testing Framework

**Problem:** No test files, no test configuration, no test dependencies.

**Fix:** Add Vitest for unit tests, Playwright for E2E tests.

---

## Firebase Security Rules

**Status:** Well-implemented

The Firestore and Storage rules are properly secured with:
- Authentication checks on all operations
- Ownership validation via `userId` fields
- Default deny policies
- File size and type validation in storage

**Minor improvement:** Add field validation to ensure required fields exist on document creation.

---

## Summary by Priority

| Priority | Count | Key Items |
|----------|-------|-----------|
| Critical | 5 | Middleware not registered, auth race conditions, missing core pages, client guard race, non-atomic operations |
| Important | 10 | Dark mode incomplete, mobile header, input borders, progress colors, dev bypass security, CSRF, types scattered |
| Nice-to-Have | 10 | Large store file, unused methods, button styles, empty states, testing |

---

## Recommended Order of Implementation

1. **Register middleware** (5 min fix, critical security)
2. **Delete dead context files** (immediate cleanup)
3. **Fix client auth guard** (prevent content flash)
4. **Create core pages** (About, Privacy, Terms, Landing)
5. **Add Footer component** with links
6. **Fix input borders** (quick visual fix)
7. **Implement dark mode classes** (visual completeness)
8. **Mobile-responsive header** (usability)
9. **Centralize dev bypass** (security hygiene)
10. **Add CSRF protection** (security)
11. **Consolidate types** (maintainability)
12. **Standardize UI patterns** (consistency)
13. **Add testing** (quality assurance)
