# 5thGate Backend Template

A reusable **Node.js / Express REST API starter** for teams that want a cleaner, safer, and more maintainable backend foundation from day one.

This template is designed to reduce the usual starter-project drift: it gives you a clear structure, a documented auth flow, provider-aware persistence, and built-in quality guardrails so new projects start with a stronger baseline and stay easier to evolve.

## Why this template improves project quality

- **Clearer architecture** — controllers, services, models, helpers, and middleware are separated so responsibilities stay obvious.
- **Safer defaults** — authentication, provider selection, and environment handling are already wired to fail closed instead of relying on ad hoc setup.
- **Less copy-paste debt** — reusable helpers and shared patterns reduce duplicated logic across future features.
- **Better consistency** — response shapes, route conventions, and resource patterns are documented and repeatable.
- **Faster onboarding** — developers and AI agents can understand the template without reverse-engineering the codebase first.
- **Built-in guardrails** — security, performance, and structure policies live alongside the repo and explain how to extend it safely.
- **Verified baseline** — tests, linting, and coverage are part of the workflow, so quality is measured instead of assumed.

## What this template gives you

- JWT authentication with access and refresh tokens
- HttpOnly refresh-token cookies
- role-based authorization middleware
- MySQL support with Knex migrations
- MongoDB support through a provider switch
- request logging and security middleware
- health and readiness endpoints
- reusable CRUD structure for future features

## Tech stack

- Node.js
- Express
- MySQL / mysql2
- MongoDB / mongodb
- Knex migrations
- JWT
- bcryptjs
- helmet, cors, morgan, cookie-parser

## Documentation

Template-level guidance lives in:

- `AGENTS.md` — instructions for AI agents working in this template
- `docs/README.md` — index for policy and planning docs
- `docs/Policies/SECURITY_POLICY.md` — auth, secrets, logging, and dependency guardrails
- `docs/Policies/PERFORMANCE_POLICY.md` — startup, DB, and runtime efficiency guardrails
- `docs/Policies/STRUCTURE_POLICY.md` — code organization and extension guardrails
- `docs/Planning/revamp-plan.md` — working revamp checklist

## Quick start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your environment file:

   ```bash
   copy .env.example .env
   ```

3. Fill in the required values in `.env`.

4. Choose a database provider:

   - SQL mode: set `DB_PROVIDER=mysql`
   - NoSQL mode: set `DB_PROVIDER=mongodb` and point `MONGO_URI` at your MongoDB Docker instance
   - MongoDB mode seeds the default roles on first use; MySQL mode uses Knex migrations

5. Run migrations when using MySQL:

   ```bash
   npm run migrate
   ```

6. Start the app:

   ```bash
   npm run dev
   ```

## Scripts

- `npm start` — run the server
- `npm run dev` — run the server with Node watch mode
- `npm test` — run the smoke check, provider checks, and the full Node test suite
- `npm run test:unit` — run the Node test suite once without coverage
- `npm run test:coverage` — run the Node test suite with built-in coverage reporting
- `npm run check:provider` — verify the selected DB provider exports the expected repository API
- `npm run check:providers` — verify both MySQL and MongoDB selectors load without connecting to a live database
- `npm run mongo:up` — start the local MongoDB Docker container
- `npm run mongo:down` — stop the local MongoDB Docker container
- `npm run mongo:logs` — follow MongoDB container logs
- `npm run lint` — syntax check the main executable files
- `npm run migrate` — run Knex migrations for MySQL
- `npm run migrate:rollback` — rollback the latest migration batch
- `npm run seed` — run Knex seed files, if any exist

## Environment variables

See `.env.example` for the complete list.

### Required secrets

- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`

### Common values

- `PORT`
- `HOST`
- `DB_PROVIDER`
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `MONGO_URI`
- `MONGO_DB_NAME`
- `CORS_ORIGINS`

## Database providers

This template supports two interchangeable backends:

- `DB_PROVIDER=mysql` — uses MySQL + Knex migrations
- `DB_PROVIDER=mongodb` — uses the MongoDB driver and a MongoDB Docker instance

### MongoDB

- set `MONGO_URI` to your running Docker instance
- set `MONGO_DB_NAME` to the database name you want
- start it with `npm run mongo:up` or `docker compose -f docker-compose.mongodb.yml up -d`
- the template auto-seeds the default role documents on first access

### MySQL

- keep `DB_PROVIDER=mysql`
- set the `DB_*` values
- run `npm run migrate`

## API routes

### Public routes

- `POST /user/login`
- `GET /user/refresh`
- `GET /user/logout`

### Protected routes

- `POST /user/create`
- `GET /users`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`

### Health

- `GET /health`
- `GET /ready`

## Authentication flow

1. Login returns an access token and sets a refresh-token cookie.
2. Protected routes require an Authorization Bearer token header.
3. Refresh uses the cookie to issue a new access token.
4. Logout clears the refresh token from the database and deletes the cookie.

## Roles

The current starter seed uses numeric role IDs:

- `1001` — Admin
- `2001` — User

## Project structure

- `app.js` — server bootstrap and middleware wiring
- `controllers/` — request/response logic
- `models/` — database access layer
- `routes/` — route modules
- `middlewares/` — JWT, roles, logging
- `migrations/` — Knex schema migrations
- `admin/` — config, DB pool, and shared app settings
- `helpers/` — shared response and cookie helpers
- `services/` — business logic for reusable flows

## Adding a new CRUD resource

Use this pattern when adding a new domain resource:

1. Create a model method for all database access.
2. Add a controller for request validation and responses.
3. Add a route module that wires HTTP verbs to controller handlers.
4. Mount the route in `app.js` under a clear resource path.
5. Protect the route with `verifyJWT` and `verifyRoles` when needed.
6. Add a migration if the resource needs new tables or columns.
7. Add at least one smoke test or request example in the docs.

## Notes

- This repo is intentionally cleaned up as a public proof-of-work template.
- Personal seed data and stale domain-specific references were removed or neutralized.
- No generic seed data is committed yet; add your own safe seed file if your fork needs one.
- Use this as a base, then layer your own domain modules on top.
