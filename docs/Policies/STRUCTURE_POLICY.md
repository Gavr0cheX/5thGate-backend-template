# Structure Policy

This repository should stay organized as a reusable API template.
The structure must make it obvious where to add features, how to extend routes, and where business logic belongs.

## Core layout rules

- `app.js` is the bootstrap entry point.
- `routes/` defines HTTP wiring.
- `controllers/` handles request/response behavior.
- `services/` holds reusable business logic.
- `models/` and `admin/` handle provider-specific data access and shared configuration.
- `helpers/` contains shared response and utility helpers.
- `middlewares/` contains cross-cutting request middleware.

## Separation rules

- Controllers should not own database logic.
- Services should not know about HTTP specifics.
- Models should not format HTTP responses.
- Route files should stay thin and descriptive.
- Shared utilities should live in one obvious place instead of being copied around.

## Provider rules

- Keep the MySQL and MongoDB implementations behind the provider abstraction.
- Add provider-specific code in the relevant model/bootstrap file, not in random controllers.
- Do not scatter `DB_PROVIDER` conditionals throughout the codebase.

## Documentation rules

- Keep the README aligned with the runtime behavior.
- Keep plan files current while work is in progress.
- Add new reusable patterns to the README when they help the next developer or agent.

## Template hygiene rules

- Remove stale starter leftovers that do not belong to the reusable template.
- Keep file names and route names generic.
- Preserve a clear path for adding new CRUD resources.
- Keep the public surface small, obvious, and easy to navigate.

## AI agent rules

- Read the structure before adding new code.
- Follow the existing pattern unless there is a clear reason to improve it.
- If a new pattern is introduced, document the directory and flow.
- When cleanup is needed, verify references first so source files are not removed accidentally.
