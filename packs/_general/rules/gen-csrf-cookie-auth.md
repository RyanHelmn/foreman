---
id: gen-csrf-cookie-auth
title: Protect cookie-authenticated mutations with a CSRF token or an origin check
impact: HIGH
impactDescription: "another site submits forms or requests as the signed-in user"
roles: [implementer, reviewer, security]
tags: general
---
Source: a cross-site request carrying the user's cookies. Sink: any state-changing endpoint authenticated by cookie. Use the framework's CSRF protection, or verify `Origin` against an allowlist, and set `SameSite=Lax` or stricter. Bearer-token APIs are exempt.

**Incorrect:**

```ts
app.post('/account/email', requireSession, updateEmail)
```

**Correct:**

```ts
app.post('/account/email', requireSession, verifyOrigin(config.appOrigins), updateEmail)
```
