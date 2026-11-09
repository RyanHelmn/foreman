---
id: gen-tls-no-bypass
title: Never turn off TLS certificate verification outside test code
impact: CRITICAL
impactDescription: "anyone on the network path reads and rewrites the traffic, tokens included"
roles: [implementer, reviewer, security]
check: "rg -n -e 'rejectUnauthorized:\s*false' -e 'verify\s*=\s*False' -e 'InsecureSkipVerify:\s*true' -e 'NODE_TLS_REJECT_UNAUTHORIZED'"
tags: general
---
Source: a network attacker. Sink: an outbound connection with verification off. A self-signed or internal certificate is fixed by trusting its CA, not by disabling checks.

**Incorrect:**

```ts
const agent = new https.Agent({ rejectUnauthorized: false })
```

**Correct:**

```ts
const agent = new https.Agent({ ca: fs.readFileSync(config.internalCaPath) })
```
