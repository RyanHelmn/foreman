---
id: bauth-verify-before-privileged
title: Require a verified email before sign-in or privileged actions
impact: HIGH
impactDescription: "anyone can register with someone else's address and inherit invites, org membership or billing"
roles: [implementer, reviewer, security]
tags: auth, better-auth
---
Source: an email address typed at sign-up. Sink: anything granted by email match (org invitations, domain-based roles, admin allowlists, billing contacts). Set `emailAndPassword.requireEmailVerification: true` with `emailVerification.sendVerificationEmail`, or check `session.user.emailVerified` before the privileged action.

**Incorrect:**

```ts
if (session.user.email.endsWith('@acme.com')) await grantRole(session.user.id, 'admin')
```

**Correct:**

```ts
if (session.user.emailVerified && session.user.email.endsWith('@acme.com')) {
  await grantRole(session.user.id, 'admin')
}
```

Reference: https://www.better-auth.com/docs/concepts/email
