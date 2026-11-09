---
id: dj-raw-params
title: Pass values to raw(), extra(), RawSQL and cursor.execute as params, never formatted in
impact: CRITICAL
impactDescription: "a query string parameter reads or deletes any table (SQL injection)"
roles: [implementer, reviewer, security]
check: "rg -n '\\.(raw|extra)\\(|RawSQL\\(|\\.execute\\(' --type py"
tags: security, django, sql
---
Source: request values. Sink: `Model.objects.raw`, `.extra(where=...)`, `RawSQL`, `connection.cursor().execute`. Django escapes only values passed in the params list with `%s` placeholders; f-strings, `%` formatting and `.format()` are injection even when the value "looks numeric". Do not quote the placeholder (`'%s'`). Prefer the ORM and annotations over `.extra()`.

**Incorrect:**

```python
Order.objects.raw(f"SELECT * FROM shop_order WHERE status = '{request.GET['status']}'")
```

**Correct:**

```python
Order.objects.raw("SELECT * FROM shop_order WHERE status = %s", [request.GET["status"]])
```

Reference: https://docs.djangoproject.com/en/stable/topics/db/sql/#passing-parameters-into-raw
