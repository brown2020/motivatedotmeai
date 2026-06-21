# Navigation, Account, And Sign-Out

## Navbar

- Header is rendered on protected pages and shows protected links.
- Because protected pages are already guarded by `proxy.ts`, signed-out users should not reach this header.

## Account Menu

- Header account menu links to `/profile` and includes sign-out.
- No separate admin menu exists.

## Avatar

- Header avatar uses app user photo, Firebase `photoURL`, then generated initials.
- Profile page uses app user photo, Firebase `photoURL`, then Gravatar fallback.

## Footer Hard Sign-Out

- No footer hard sign-out exists in the current app.
- Deferred because the public footer currently only contains public/legal links and the app has a header sign-out on protected pages.

## Navbar And Footer State Matrix

| State | Navbar Result | Footer Hard Logout Result | Evidence |
| --- | --- | --- | --- |
| Unknown/bootstrap | Protected pages show app loading state before data. | N/A. | `providers.tsx` and protected pages inspected. |
| Signed out | Protected header not reachable by normal routing. | N/A. | `proxy.ts` protected prefixes. |
| Signed in unverified | Not applicable to Google-only UI. | N/A. | Provider gate recorded. |
| Signed in verified | Header links and account menu available. | N/A. | `Header.tsx`. |
| Non-admin | No admin links. | N/A. | No admin routes. |
| Admin | No admin links. | N/A. | No admin routes. |
| Stale/invalid | Proxy redirects and clears cookies before header. | N/A. | `proxy.ts`. |
| After logout | Full navigation to `/signin`. | N/A. | `auth-store.ts`. |
