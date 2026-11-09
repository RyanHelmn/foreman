---
id: pg-timestamptz
title: Store instants as timestamptz, never timestamp without time zone
impact: HIGH
impactDescription: "times shift by hours when the server, session or driver timezone differs, and DST creates duplicate or missing hours"
roles: [implementer, reviewer]
tags: types, postgres
---
`timestamp` stores wall-clock digits with no zone, so its meaning depends on whichever session wrote it. `timestamptz` stores an absolute instant and converts on output. Use `timestamptz` for anything that happens at a point in time (`created_at`, `expires_at`, `scheduled_for`); use `date` for calendar dates, and a separate IANA zone column when local wall time matters (a recurring 9am meeting).

**Incorrect:**

```sql
ALTER TABLE sessions ADD COLUMN expires_at timestamp NOT NULL;
```

**Correct:**

```sql
ALTER TABLE sessions ADD COLUMN expires_at timestamptz NOT NULL;
```

Reference: https://wiki.postgresql.org/wiki/Don't_Do_This#Don.27t_use_timestamp_.28without_time_zone.29
