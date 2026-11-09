---
id: bauth-no-hand-rolled
title: Use better-auth's endpoints and plugins instead of hand-rolled tokens or cookie parsing
impact: CRITICAL
impactDescription: "a home-made reset token or session decode skips expiry, single-use and signature checks"
roles: [implementer, reviewer, security]
check: "rg -n -e 'jwt\\.(verify|decode)' -e 'better-auth\\.session_token' -e 'resetToken' src/ app/"
tags: auth, better-auth
---
Source: a cookie, bearer token or reset link. Sink: the session or password it unlocks. better-auth's session, password reset (`sendResetPassword`), email verification and OAuth flows already issue signed, expiring, single-use tokens, and its OAuth flows handle `state` and PKCE. Code that reads the session cookie directly, decodes it, or stores its own reset tokens bypasses all of that.

**Incorrect:**

```ts
const token = crypto.randomUUID()
await db.passwordReset.create({ data: { token, userId } })
await sendEmail(user.email, `${APP_URL}/reset?token=${token}`)
```

**Correct:**

```ts
emailAndPassword: {
  enabled: true,
  sendResetPassword: async ({ user, url }) => sendEmail(user.email, url),
}
```

Reference: https://www.better-auth.com/docs/authentication/email-password
