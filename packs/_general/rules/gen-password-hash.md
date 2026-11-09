---
id: gen-password-hash
title: Hash passwords with argon2, bcrypt or scrypt; make tokens with a CSPRNG
impact: CRITICAL
impactDescription: "leaked hashes are cracked in minutes; guessable reset tokens take over accounts"
roles: [implementer, reviewer, security]
tags: general
---
Fast hashes (MD5, SHA-1, SHA-256) are not password hashes. Reset, invite and API tokens come from a cryptographic random source, are stored hashed, and expire.

**Incorrect:**

```ts
user.password = sha256(password)
const resetToken = Math.random().toString(36).slice(2)
```

**Correct:**

```ts
user.password = await argon2.hash(password)
const resetToken = randomBytes(32).toString('base64url')
```
