---
id: bauth-account-linking-verified
title: Link accounts only through providers that verify email
impact: HIGH
impactDescription: "an attacker signs in with an unverified provider email and takes over the existing account"
roles: [implementer, reviewer, security]
check: "rg -n -A4 'accountLinking' --glob '!node_modules'"
tags: auth, better-auth, oauth
---
Source: the email an OAuth provider returns. Sink: automatic linking to the existing user with that email. `account.accountLinking.trustedProviders` links without checking the provider's email-verified flag, so list only providers that verify ownership. Leave `allowDifferentEmails` off.

**Incorrect:**

```ts
account: {
  accountLinking: { enabled: true, trustedProviders: ['google', 'github', 'my-sso'], allowDifferentEmails: true },
}
```

**Correct:**

```ts
account: { accountLinking: { enabled: true, trustedProviders: ['google'] } }
```

Reference: https://www.better-auth.com/docs/concepts/users-accounts
