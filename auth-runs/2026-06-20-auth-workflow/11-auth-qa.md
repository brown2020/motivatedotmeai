# Auth QA

## Browser QA

- `/signin` loads from the existing dev server on `http://localhost:3007/signin`.
- Live Google sign-in was not completed because it requires user Google account interaction in the browser.

## API/Server QA

- `POST http://localhost:3007/api/auth/session` with `Origin: http://localhost:3007` and a fake token returned `400 Invalid idToken`; this proves the local origin passes the CSRF gate.
- `POST http://localhost:3007/api/auth/session` with `Origin: https://evil.example` returned `403 Invalid request origin`; this proves the foreign-origin guard remains active.

## Accessibility

- Sign-in errors now render through `ErrorAlert` inside an `aria-live="polite"` region.
- Button disabled state prevents repeated popup attempts.

## Responsive States

- Not visually re-tested in browser screenshots in this run.
- The sign-in page uses existing responsive Tailwind layout and the added alert is constrained to `max-w-md`.
