---
id: gen-query-parameterised
title: Build queries and commands with parameters, never string concatenation
impact: CRITICAL
impactDescription: "SQL or shell injection from any user-controlled string"
roles: [implementer, reviewer, security]
tags: general
---
Source: any request value. Sink: a raw SQL string, a shell command, a file path. Use bound parameters, argument arrays (no shell), and resolve paths against a fixed root, rejecting `..`.

**Incorrect:**

```ts
await db.query(`SELECT * FROM users WHERE email = '${email}'`)
exec(`convert ${req.query.file} out.png`)
```

**Correct:**

```ts
await db.query('SELECT * FROM users WHERE email = $1', [email])
execFile('convert', [safePath(req.query.file), 'out.png'])
```
