# Task Queue

| ID | Priority | Status | Phase | Owned Files | Done-Check | Verification | Attempts | Stop Condition | Next Action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AUTH-001 | P1 | Done | Discovery | `01-auth-inventory.md` | Auth surfaces inventoried | Evidence matrix completed | 1/2 | Inventory complete or blocker recorded | Done |
| AUTH-002 | P1 | Done | Provider migration | `02-auth-provider-migration.md` | Existing provider replacement path documented | Migration matrix completed | 1/2 | Firebase path executable or setup blocker recorded | Done |
| AUTH-003 | P1 | Done | Session repair | `src/app/api/auth/session/route.ts` | Local dev origins work beyond port 3000 | Curl origin checks | 1/2 | `localhost:3007` reaches token validation and foreign origin remains blocked | Done |
| AUTH-004 | P1 | Done | UI error handling | `src/stores/auth-store.ts`, `src/app/signin/sign-in-client.tsx` | Auth errors are user-facing | Lint/build | 1/2 | Failed sign-in/session can show alert | Done |
| AUTH-005 | P1 | Open | Commit/push | Auth code and run reports | Commit pushed to `origin/dev` | Git status and push result | 0/2 | Branch clean and pushed | Stage and commit |
