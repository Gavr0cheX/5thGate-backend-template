# Performance Policy

This repository should stay lightweight, fast to start, and easy to extend.
Performance work should support the template’s long-term usability, not add complexity for its own sake.

## Core principles

- Keep startup cheap.
- Avoid unnecessary abstraction layers.
- Reuse shared configuration and connections.
- Prefer predictable, low-overhead dependencies.
- Measure before optimizing.

## Runtime rules

- Database connections should be initialized once and reused.
- Avoid repeated bootstrap work on every request.
- Keep health and readiness endpoints fast.
- Do not add blocking work to startup unless it is required.
- Keep request handlers focused and small.

## Data access rules

- Use efficient queries and indexes.
- Avoid duplicate round-trips when the result can be fetched once.
- Keep repository/model methods responsible for their own data path.
- For MongoDB, seed and index work should be deterministic and cached where possible.
- For MySQL, keep migrations and schema access clean and explicit.

## Dependency rules

- Prefer built-in Node.js capabilities when they are sufficient.
- Avoid watchers, transpilers, or dev-time tools in runtime code paths.
- Only keep packages that serve the template’s core workflows.
- If a package upgrade changes behavior, verify the actual runtime impact.

## Testing rules

- Use tests to catch regressions that affect startup, auth, DB selection, and request flow.
- Coverage is useful only when it is tied to meaningful behavior.
- Do not add expensive test setup unless it is needed to verify a real path.

## AI agent rules

- Keep edits minimal when improving performance.
- Prefer measured improvements over speculative ones.
- If a change trades speed for clarity, document why.
- When modifying bootstrap or DB code, verify the app still starts cleanly and the expected endpoints respond.
