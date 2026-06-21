# Auth Add-Ons

## Implemented

- Local development origin validation now supports the active dev port instead of hard-coding port 3000.
- User-facing auth error mapping and sign-in loading state were added.
- Session fetches explicitly include credentials.

## Deferred

- Email/password, email link, password reset, and email verification flows: deferred until product approval and Firebase Console provider setup are confirmed.
- Footer hard sign-out: deferred because current app has protected header sign-out and no signed-in footer surface.
- Admin UID gating: deferred because no admin routes exist.
- Full hard logout cache clearing/cross-tab broadcast: useful hardening, but not required for the immediate Google session blocker.

## Proposed For Approval

- Decide whether to add email/password and email-link auth as first-class product flows.
- If yes, enable Firebase providers, configure email action URLs, and add sign-up/forgot/verify/account credential UI with password visibility controls.
- Decide whether the app needs admin routes; if yes, add server-only UID env config and tests before exposing admin UI.
