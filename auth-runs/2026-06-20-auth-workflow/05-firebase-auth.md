# Firebase Auth

## Providers

- Active code path: Firebase Google provider with `signInWithPopup`.
- Session exchange: fresh Firebase ID token is POSTed to `/api/auth/session`.
- Email/password, email link, password reset, and verification flows are not present in code and require product/setup approval before implementation.

## Email Verification

- No current email/password users are supported by the app UI.
- Add verification send/resend/refresh and gating if email/password is introduced.

## Error Mapping

- Added centralized client-side Google auth error mapping for popup cancel, popup blocked, network failure, duplicate credential, and rate-limit states.
- Added session exchange error mapping for missing Admin SDK configuration and disabled local dev session bypass.

## Account/Profile

- Profile page reads Firebase auth user and app user state.
- Avatar order remains uploaded profile image, Firebase `photoURL`, then Gravatar fallback.
