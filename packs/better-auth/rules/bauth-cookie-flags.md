---
id: bauth-cookie-flags
title: Keep session cookies secure, httpOnly and sameSite lax or strict
impact: HIGH
impactDescription: "the session cookie goes out over plain HTTP, to scripts, or on cross-site requests"
roles: [implementer, reviewer, security]
check: "rg -n -e 'useSecureCookies' -e 'defaultCookieAttributes' -e 'crossSubDomainCookies' --glob '!node_modules'"
tags: auth, better-auth
---
better-auth's defaults (`httpOnly`, `secure` on HTTPS, `sameSite: 'lax'`) are correct. Flag any override in `advanced`: `useSecureCookies: false`, `defaultCookieAttributes` with `httpOnly: false` or `sameSite: 'none'`, or `crossSubDomainCookies` on a parent domain whose subdomains include hosts you don't control (user content, marketing site builders, preview deploys).

**Incorrect:**

```ts
advanced: {
  defaultCookieAttributes: { sameSite: 'none', httpOnly: false },
  crossSubDomainCookies: { enabled: true, domain: '.example.com' },
}
```

**Correct:**

```ts
advanced: { defaultCookieAttributes: { sameSite: 'lax' } }
```

Reference: https://www.better-auth.com/docs/concepts/cookies
