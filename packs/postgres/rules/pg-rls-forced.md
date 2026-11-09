---
id: pg-rls-forced
title: Where RLS isolates tenants, FORCE it, connect as a non-owner role, and set the tenant per transaction
impact: CRITICAL
impactDescription: "every policy is skipped for the app's queries, or a pooled connection serves tenant B with tenant A's setting"
roles: [implementer, reviewer, security]
tags: tenancy, postgres
---
Source: the tenant setting on the connection. Sink: every query on an RLS table. Table owners skip policies unless the table has `FORCE ROW LEVEL SECURITY`; superusers and `BYPASSRLS` roles always skip them, so the app role is neither. Set the tenant with `set_config('app.org_id', $1, true)` inside the same transaction as the queries: a session-level `SET` stays on the pooled connection (PgBouncer transaction mode, ORM pools) into the next request. A new tenant table without `ENABLE`, `FORCE` and a policy is the finding.

**Incorrect:**

```sql
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant ON documents USING (org_id = current_setting('app.org_id')::uuid);
SET app.org_id = '6f1c…';
```

**Correct:**

```sql
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant ON documents
  USING (org_id = current_setting('app.org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.org_id', true)::uuid);

BEGIN;
SELECT set_config('app.org_id', $1, true);
SELECT id, title FROM documents;
COMMIT;
```

Reference: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
