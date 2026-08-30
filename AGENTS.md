# AGENTS.md — AI Agent Guide for 5thGate Backend Template

This repository is a reusable Node.js/Express API template with both MySQL and MongoDB support.
AI agents working here should treat this file as the operating guide for safe, high-quality changes.

## Required reading

Before making changes, read:

- `docs/Policies/SECURITY_POLICY.md`
- `docs/Policies/PERFORMANCE_POLICY.md`
- `docs/Policies/STRUCTURE_POLICY.md`
- `README.md`
- `docs/Planning/revamp-plan.md`

If any of those files conflict with a task request, follow the task request first and then keep the repository aligned with the policies as much as possible.

## What this template is for

- A clean starter for public or internal API projects
- A backend that can run with either `DB_PROVIDER=mysql` or `DB_PROVIDER=mongodb`
- A codebase that future agents should be able to extend without re-learning the structure

## How AI agents should work here

1. **Inspect before editing**
   - Read the relevant files first.
   - Trace symbols to their definitions and usages.
   - Never invent paths, modules, or runtime behavior that was not verified.

2. **Keep changes small and intentional**
   - Prefer narrow patches over broad refactors.
   - Touch only the files needed for the task.
   - Preserve the current template direction unless the user explicitly asks for a redesign.

3. **Prefer real verification**
   - When you change runtime code, run the relevant checks.
   - For this repo that usually means:
     - `npm test`
     - `npm run lint`
     - `npm run test:coverage` when coverage changes matter
   - Do not claim success without real tool output.

4. **Keep the repo reusable**
   - Remove hard-coded personal data.
   - Keep the default path generic.
   - Keep SQL and MongoDB paths cleanly separated.
   - Keep controllers thin and move logic into services or models when appropriate.

5. **Update the plan when execution lands**
   - If a task affects roadmap progress, update `docs/Planning/revamp-plan.md` while you work.
   - Mark items done only after they are verified.

## Quality guardrails

### Security
- Never print or commit secrets.
- Keep environment variables in `.env.example` only.
- Validate auth, cookie, and provider paths explicitly.
- Prefer defensive error handling and clear status codes.

### Performance
- Avoid unnecessary DB round-trips.
- Reuse cached database connections and bootstrap state.
- Keep startup logic cheap and deterministic.
- Do not add heavy dependencies unless they are justified by the template.

### Structure
- Keep route modules as route wiring only.
- Keep controller modules focused on request/response behavior.
- Keep database access inside models/repositories.
- Keep helper logic in `helpers/`, `services/`, or `admin/` when it is shared.
- Maintain the MySQL/MongoDB provider abstraction instead of scattering provider checks everywhere.

## Working rules for agents

- Use the repository documentation as the source of truth.
- Prefer maintainable code over clever code.
- If you find outdated docs, update them.
- If you find stale files, remove them only after checking references.
- If a task would create a new reusable pattern, document it.

## Verification expectations

Before finishing any meaningful code task, confirm the relevant command output.
Common checks in this repo:

- `npm test`
- `npm run lint`
- `npm run test:coverage`
- `git status --short`

## Bottom line

This repository should read like a clean API template, not a one-off app.
Every change should make it easier for the next agent or developer to extend safely.
