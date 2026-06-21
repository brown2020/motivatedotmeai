# Decision Log

| ID | Decision | Evidence | Alternatives | Result |
| --- | --- | --- | --- | --- |
| DEC-001 | Keep Firebase as the sole auth provider. | Firebase SDK/Admin/session code present; no competing auth provider found. | Replace with another auth provider. | No provider migration needed. |
| DEC-002 | Allow trusted local development hostnames on any port for session CSRF checks. | Active browser OAuth flow uses `localhost:3007`; route previously allowed only `localhost:3000`. | Keep fixed port allowlist and require dev server on 3000. | Implemented parsed local origin validation. |
| DEC-003 | Surface auth/session failures in the sign-in UI. | Previous failures only logged to console and returned `false`. | Leave failures silent. | Added auth error state and alert. |
| DEC-004 | Do not add email/password flows in this repair batch. | Current app is Google-only and AGENTS.md prefers small evidence-based changes. | Add new sign-up/reset/verification product surface immediately. | Deferred behind Firebase provider/product setup gate. |
