---
id: prisma-migrate-not-push
title: Change the schema with migrate dev and ship it with migrate deploy; never db push on shared databases
impact: HIGH
impactDescription: "db push leaves no migration for other environments to replay and can drop columns with their data"
roles: [implementer, reviewer]
check: "rg -n 'db push|migrate reset|accept-data-loss' package.json Dockerfile* .github/ scripts/"
tags: migrations, prisma
---
Every `schema.prisma` change in a diff comes with a new folder under `prisma/migrations/` from `prisma migrate dev --name <change>`. Shared and production databases change only through `prisma migrate deploy` in CI or the release step. `db push` (no history) and `migrate reset` (drops the database) are local-only. Never edit a migration that has been applied anywhere: its checksum changes and Prisma reports it as modified; add a new migration instead.

**Incorrect (schema changed, no migration; deploy pushes):**

```json
{ "scripts": { "deploy": "prisma db push --accept-data-loss && node dist/main.js" } }
```

**Correct:**

```json
{ "scripts": { "deploy": "prisma migrate deploy && node dist/main.js" } }
```

Reference: https://www.prisma.io/docs/orm/prisma-migrate/workflows/prototyping-your-schema
