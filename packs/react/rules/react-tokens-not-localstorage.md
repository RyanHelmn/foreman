---
id: react-tokens-not-localstorage
title: Keep session tokens in httpOnly cookies, not localStorage
impact: HIGH
impactDescription: "one XSS anywhere on the origin exfiltrates every visitor's long-lived token"
roles: [implementer, reviewer, security]
check: "rg -n \"(localStorage|sessionStorage)\\.setItem\\(.*(token|jwt|session)\" -i"
tags: security, auth, react
---
Source: any script running on the origin (XSS, a compromised dependency). Sink: a bearer token in `localStorage`/`sessionStorage`, readable by that script and replayable from anywhere. When the API is same-site, use an `httpOnly; Secure; SameSite` cookie set by the server. Keep a token in JavaScript memory only when the API is cross-site and cookies are impossible, and say so.

**Incorrect:**

```ts
const { accessToken } = await login(form)
localStorage.setItem('accessToken', accessToken)
```

**Correct (server sets the cookie; the client never sees the token):**

```ts
await fetch('/api/login', { method: 'POST', body: JSON.stringify(form), credentials: 'include' })
```
