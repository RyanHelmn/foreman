---
id: go-crypto-rand
title: Generate tokens, ids and codes with crypto/rand, never math/rand
impact: CRITICAL
impactDescription: "reset links, session ids and OTPs become predictable and guessable"
roles: [implementer, reviewer, security]
check: "rg -n '\"math/rand(/v2)?\"' --type go"
tags: security, go
---
Source: `math/rand` or `math/rand/v2` output. Sink: anything an attacker must not guess (session ids, password-reset tokens, API keys, OTPs, nonces). Use `crypto/rand`; on Go 1.24+ `rand.Text()` returns a ready-made token. `math/rand` is fine for jitter and sampling.

**Incorrect:**

```go
import "math/rand"

token := fmt.Sprintf("%x", rand.Int63())
```

**Correct:**

```go
import "crypto/rand"

b := make([]byte, 32)
if _, err := rand.Read(b); err != nil {
	return "", err
}
token := base64.RawURLEncoding.EncodeToString(b)
```

Reference: https://pkg.go.dev/crypto/rand
