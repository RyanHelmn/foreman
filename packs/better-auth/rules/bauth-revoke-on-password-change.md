---
id: bauth-revoke-on-password-change
title: Revoke other sessions when the password changes or is reset
impact: HIGH
impactDescription: "a stolen session stays valid after the victim changes their password"
roles: [implementer, reviewer, security]
check: "rg -n -e 'changePassword' -e 'revokeSessionsOnPasswordReset' --glob '!node_modules'"
tags: auth, better-auth
---
Pass `revokeOtherSessions: true` to `changePassword` and set `emailAndPassword.revokeSessionsOnPasswordReset: true`. Neither is the default.

**Incorrect:**

```ts
await authClient.changePassword({ currentPassword, newPassword })
```

**Correct:**

```ts
await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true })
```

Reference: https://www.better-auth.com/docs/authentication/email-password
