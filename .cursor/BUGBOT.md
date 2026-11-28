# Bugbot review contract

## What this file is

This file tells you what is intended on SolZeroAI/solstatus and what is a regression.
You include this root file on every review.
Do not expect nested `.cursor/BUGBOT.md` copies under packages.
The repo is public at https://github.com/SolZeroAI/solstatus.
The license is AGPL-3.0-only.

## Review posture

You flag real regressions.
You do not flag intended locks.
Locks below are intended for this repository.
Do not recommend changing a lock.
Do not recommend Clerk.
Do not recommend Effect 3.x.
Do not recommend turbo.
Do not recommend moving the database off Cloudflare D1.
Do not recommend publishing the workspace packages to npm.

## Locks you treat as intended

### Database

Cloudflare D1 is the database.
The Worker binding is `DB`.
`useDrizzle` in `packages/common/src/db/index.ts` opens it with `drizzle-orm/d1`.
Better Auth uses that same D1 binding through the Drizzle adapter in `packages/app/src/lib/auth.ts`.
The adapter provider is `sqlite`.

Numbered SQL lives in `packages/common/src/db/migrations/`.
`createDB` in `packages/common/infra/index.ts` constructs Alchemy `Cloudflare.D1.Database("db", { name, migrations })`.
The `migrations` field is that directory.
Alchemy applies the migrations.
Worker code queries D1.
It does not apply schema on read.
There is no `ensureD1Schema`.
Do not flag that absence.

`MonitorTrigger` in `packages/api/src/monitor-trigger.ts` is a Durable Object.
Its stored state is the alarm schedule: monitor id, monitor type, and check interval.
Endpoint monitor rows and check results stay in D1.
Do not treat the Durable Object state as a second database.
Do not move monitor rows into the Durable Object.

Better Auth also uses KV secondary storage.
`secondaryStorage` in `packages/app/src/db/secondaryStorage.ts` reads and writes `SESSIONS_KV`.
`createSessionsStorageKV` in `packages/common/infra/index.ts` creates that namespace.
D1 holds the auth tables (`user`, `session`, `account`, `verification`).
KV holds the Better Auth secondary storage.
Do not flag those two stores as a name collision.

There is no PlanetScale database in this repository.
Do not add one.

### Better Auth

Stay on better-auth.
`auth` in `packages/app/src/lib/auth.ts` is the server instance.
It uses the email OTP plugin.
No mailer is configured.
The worker log is the local OTP delivery path.
Do not add a mail provider as a drive-by change.

`dispatchApi` in `packages/app/src/lib/dispatch-api.ts` sends `/api/auth` and `/api/auth/*` to Better Auth.
Every other `/api` request requires a Better Auth session.
Do not remove that session check.

`BETTER_AUTH_SECRET` is required.
The CLI in `src/index.ts` generates a secret when neither the flag nor the environment variable is set, and appends it to `.env`.
Do not commit a static secret, including a test fixture or a fallback value.
Local development reads the secret from `.env`.

### Scripts and release

Root scripts run through Nub.
There is no turbo.
The script names are `dev`, `build`, `typecheck`, `lint`, `lint:fix`, `format`, `format:fix`, `test`, and `test:e2e:*`.
`nub run dev` starts the TanStack Start app on port 3000 and the monitor workers on ports 8787 and 8788, with local D1 and KV, through `alchemy dev`.
Do not add a mock API or a stub for `cloudflare:workers`.

The CLI is the Effect 4 stack in `src/index.ts`.
It imports `effect/cli`.
Do not move it to Effect 3 or to `@effect/cli`.

The release publishes the `solstatus` package to the alchemy.new registry, under the `solzero` org.
The workspace packages are private.
They are not published to npm.
Tegami tracks the release as `release:solstatus`.
`docs/releasing.md` and `CONTRIBUTING.md` describe that flow.

`.github/workflows/release.yml` versions and publishes after Validate on a master push.
The registry job publishes to alchemy.new when the version tag does not already exist.
It uses environment `alchemy-new` and `id-token: write`.
It uses `SolZeroAI/alchemy-new-publish-action@v1`.
Do not pin that action to a commit SHA or an exact version.
The job does not deploy production Cloudflare infrastructure.

`.github/workflows/registry-dry-run.yml` packs the same archive and does not upload it.
It has `contents: read` only.
It does not use the `alchemy-new` environment or `id-token`.
Keep its `exclude` list identical to the registry job.

This public repository runs jobs on `ubuntu-latest`.
Do not add a self-hosted runner label.
Do not add a workflow that deploys production Cloudflare infrastructure.
Do not add production deploy secrets.

A docs-only change with no observable effect on a deployment uses the pull request label `release:none`.
Do not edit `VERSION`, `CHANGELOG.md`, or `.tegami/publish-lock.yaml` to cut a release on a feature branch.
The version pull request owns those files.

### Tests

`solzero/no-colocated-tests` comes from `oxlint-plugin-solzero`.
`*.test.*` and `*.spec.*` must live under `test`, `tests`, or `__tests__`.
Automated tests use tester-army/e2e.
They live in `tests/**/*.e2e.ts`.
Helpers live in `tests/support/`.
`nub run test` is that suite.
Do not add Vitest, mocks, request interception, or a second runner.

`nub run test` boots `alchemy dev` on ports 3000, 8787, and 8788.
Run state stays in `.e2e/runs/<uuid>/.alchemy`, and the launcher removes it on exit.
The suite does not deploy or destroy remote Cloudflare resources.
It does not use `CLOUDFLARE_API_TOKEN`.

`scripts/e2e/models.ts` and `scripts/e2e/filters.ts` stay identical in every SolZero repository.
Do not edit them in this repository.
`models.ts` selects the decision model and the language model through official AI SDK providers.
CI reads `E2E_DECISION_MODEL` and `E2E_LANGUAGE_MODEL` from organization Actions variables.

End-to-end tests on a pull request run only for a ready pull request from this repository.
Fork pull requests do not receive the e2e credentials.
Draft pull requests do not run the e2e job.

### Stack versions

Master uses Cloudflare Workers, D1, KV, and a Durable Object for monitor alarms.
Declared versions on this master:

- Effect `4.1.4`
- Alchemy `2.0.0-beta.85`
- better-auth `^1.2.12` in `@solstatus/app`
- wrangler `^4.22.0`
- drizzle-orm `1.0.0-rc.5-ab785fc`
- Zod `4.6.7`
- TypeScript `7.0.2`
- Nub `0.11.1`

There is no Clerk.
Do not recommend Clerk.
Do not recommend Effect 3.x.
Do not recommend turbo.
Do not bump Alchemy, Effect, Wrangler, Better Auth, or Drizzle in a drive-by pull request.

### Observability

Handlers wrap D1 and RPC calls with `attempt` in `packages/app/src/server/api/handlers.ts`.
A failure becomes `InternalServerError` with a log and a span.
Prefer that path over an uncaught exception.

Never log bearer tokens, authorization headers, cookies, or secret values.
Log names, ids, counts, and boolean flags.
Do not add an ad hoc debug endpoint.

The email OTP plugin writes the one-time code to the worker log because no mailer is configured.
That log line is the local delivery path.
Do not replace it with a committed secret or a third-party mail account in a drive-by change.

## Flag these

### Auth and sessions

Flag auth or session breakage.
Flag a cookie or trusted-origin change that breaks sign-in.
When an `/api` route other than `/api/auth` and `/api/auth/*` no longer requires a session, flag it.
When Better Auth stops using the D1 Drizzle adapter, flag it.
When `SESSIONS_KV` secondary storage is removed or pointed at D1, flag it.
When a static `BETTER_AUTH_SECRET` is committed, flag it.

### Database and migrations

When a PR adds PlanetScale, Postgres, or a second control-plane database, flag it.
When a PR applies D1 SQL from Worker code on read, flag it.
When numbered D1 migrations are broken, flag it.
When monitor rows move out of D1 into Durable Object storage, flag it.
Do not flag `MonitorTrigger` alarm state as a missing D1 table.

### Secrets and release

Flag secret leakage in source, logs, or public GitHub Actions.
When a PR publishes a workspace package to npm, flag it.
When a PR pins a GitHub Action to a commit SHA or an exact version, flag it.
When a PR adds a self-hosted runner, flag it.
When a PR adds a production Cloudflare deploy to a workflow, flag it.
When the registry job drops environment `alchemy-new` or `id-token: write`, flag it.
When the dry-run job uploads to the registry or requests `id-token: write`, flag it.
When fork pull requests receive e2e credentials, flag it.

### Tests

Flag colocated tests.
Automated tests use tester-army/e2e in `tests/**/*.e2e.ts`.
When a behavior change lacks a genuine end-to-end regression case, flag it.
Flag a unit or component runner, mocked providers, or a separate browser test driver.
When a pull request edits `scripts/e2e/models.ts` or `scripts/e2e/filters.ts`, flag it.
When a PR recommends Clerk, Effect 3.x, turbo, npm publish, or moving off Cloudflare D1, flag it.

## Paths that often confuse reviewers

`packages/common/src/db/index.ts` is `useDrizzle`.
`packages/common/src/db/migrations/` is numbered D1 SQL.
`packages/common/infra/index.ts` is the Alchemy D1 database and the sessions KV namespace.
`packages/app/src/lib/auth.ts` is Better Auth on D1, with KV secondary storage.
`packages/app/src/db/secondaryStorage.ts` is `SESSIONS_KV`.
`packages/app/src/lib/dispatch-api.ts` sends auth routes to Better Auth and requires a session for every other `/api` route.
`packages/app/src/server/api/` is the Effect `HttpApi`.
`packages/api/src/monitor-trigger.ts` is the Durable Object alarm schedule.
`src/index.ts` is the Effect CLI.
`tests/**/*.e2e.ts` is the only automated test suite.
`scripts/e2e/models.ts` and `scripts/e2e/filters.ts` stay identical across SolZero repositories.
`.github/workflows/release.yml` publishes the alchemy.new package. It does not deploy Cloudflare.
`.github/workflows/registry-dry-run.yml` packs the archive and does not upload it.
`.github/workflows/validate.yml` runs typecheck, lint, format, and the e2e job. Fork pull requests do not receive e2e credentials.
