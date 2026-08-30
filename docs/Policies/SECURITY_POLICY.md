# Security Policy

This repository is a public API template. Security decisions should favor safe defaults, explicit configuration, and predictable failure modes.

## Core principles

- Never commit secrets, credentials, tokens, or connection strings.
- Keep secret values in environment variables only.
- Keep `.env.example` generic and non-sensitive.
- Fail closed when auth or provider configuration is missing.
- Prefer clear HTTP status codes and safe error messages.

## Authentication and session rules

- JWT secrets must be required at startup.
- Access tokens should be short-lived.
- Refresh tokens should be stored and cleared explicitly.
- Refresh cookies should remain HttpOnly.
- Logout must invalidate the stored refresh token and clear the cookie.
- Protected routes must require authentication before hitting the data layer.

## Database rules

- Validate the selected provider through configuration.
- Keep SQL and MongoDB implementations separate.
- Do not leak internal DB errors to clients.
- Use parameterized queries or driver-safe methods for data access.
- Seed only generic, non-sensitive starter data.

## Dependency rules

- Prefer dependencies that reduce risk and maintenance overhead.
- Remove direct dependencies that are no longer needed.
- Review security-sensitive upgrades with real tests and audit output.
- Do not add packages just to solve a one-line problem if a standard library solution exists.

## Logging rules

- Log enough for debugging, but avoid sensitive payloads.
- Do not log passwords, tokens, or full secret values.
- Keep request logs useful without exposing private data.

## AI agent rules

- Do not guess credentials or bypass authorization.
- Do not weaken security just to make a test easier.
- If a task requires a security tradeoff, document it clearly in the plan or README.
- When changing auth, run the relevant tests and verify the behavior end to end.
