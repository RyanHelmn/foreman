---
id: gen-rate-limit-auth
title: Rate-limit sign-in, sign-up, password reset and OTP endpoints in shared storage
impact: HIGH
impactDescription: "credential stuffing and OTP brute force run unthrottled"
roles: [implementer, reviewer, security]
tags: general
---
Source: repeated requests from one IP or for one account. Sink: credential and code checks. Limit per IP and per account, and keep counters in shared storage (Redis, the database): an in-memory limiter resets on deploy and is per instance.

**Incorrect:**

```ts
app.post('/auth/otp/verify', verifyOtp)
```

**Correct:**

```ts
app.post('/auth/otp/verify', rateLimit({ store: redisStore, key: (req) => req.body.phone, max: 5, window: '15m' }), verifyOtp)
```
