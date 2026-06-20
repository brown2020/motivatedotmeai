# Orchestration Plan

## Mode Selection

- Repo: /Users/stephenbrown/Code/OPENSOURCE/motivatedotmeai
- Branch: dev
- Work mode: full
- Run folder: /Users/stephenbrown/Code/OPENSOURCE/motivatedotmeai/agent-runs/2026-06-20-codebase-pass
- Verifiable gates: Git remote read, dry-run push, `npm run build`, source search, diff review, and branch sync checks.
- Human-decision blockers: broad product roadmap changes, major dependency upgrades with migration risk, external Firebase/OpenAI credential setup, or architecture rewrites without a local verification path.
- Resume policy: resume from `run-state.md`, `task-queue.md`, current Git state, and latest phase report; push any validated local phase commit before new edits.

## Loop Plan

| Phase | Loop | Verify Gate | Stop Condition |
| --- | --- | --- | --- |
| Preflight and Repo Docs | Orchestration Planning Loop, Docs Sweep Loop | Docs match current repo and checks pass | Plan, state, queue, docs, and report pushed |
| Baseline Validation | Baseline Validation Loop | Package-defined checks pass or failures are classified | Baseline report pushed |
| Findings Backlog | Findings Queue Loop, Architecture Fitness Loop, Lean Code Loop | Evidence-backed backlog and scorecard | Backlog, scorecard, and queue are pushed |
| Execute Fixes and Improvements | Task Queue Loop, Fix Validation Loop, Architecture Fitness Loop, Lean Code Loop | Targeted checks and `npm run build` pass | Highest-priority verifiable fixes pushed or deferred |
| Package and Dead-Code Cleanup | Package Cleanup Loop, Dead Code Loop | Safe dependency/deletion changes verified | Cleanup pushed or deferred with evidence |
| Review | Judge Loop | Diff, reports, and gates pass strict review | Review report pushed and P0/P1 tasks queued |
| Stabilization Loop | Stabilization Loop, Judge Loop | Completion criteria pass | Stabilization report pushed or blocker recorded |
| Integrator | Final Completion Gate | Remote read, dry-run push, clean tree, branch sync, and final gate pass | Final report pushed |

## File Ownership

| Task | Owned Files | Notes |
| --- | --- | --- |
| T-001 | `AGENTS.md`, `SPEC.md`, `00-orchestration-plan.md`, `01-preflight-and-repo-docs.md`, `run-state.md`, `task-queue.md` | Startup planning, repo guidance, current-state spec, and resume state |
| T-002 | `02-baseline-validation.md`, `run-state.md`, `task-queue.md` | Baseline checks and failure classification |
| T-003 | `03-findings-backlog.md`, `run-state.md`, `task-queue.md` | Evidence-backed findings and architecture scorecard |
| T-004 | Source files from selected finding plus `04-execute-fixes-and-improvements.md`, `run-state.md`, `task-queue.md` | Small verifiable bug or lean-code fix |
| T-005 | `package.json`, `package-lock.json`, dead-code targets, `05-package-and-dead-code-cleanup.md`, `run-state.md`, `task-queue.md` | Safe package and dead-code cleanup |
| T-006 | `06-review.md`, `run-state.md`, `task-queue.md` | Judge review report and follow-up queue updates |
| T-007 | Stabilization-owned source/report files | Completion criteria fixes |
| T-008 | `final-report.md`, `run-state.md` | Final completion report |
