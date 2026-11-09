---
id: go-http-server-timeouts
title: Construct http.Server with ReadHeaderTimeout, ReadTimeout, WriteTimeout and IdleTimeout
impact: HIGH
impactDescription: "slow clients hold connections open forever (Slowloris) and exhaust the server"
roles: [implementer, reviewer, security]
check: "rg -n 'http\\.ListenAndServe(TLS)?\\(' --type go"
tags: go, http
---
`http.ListenAndServe` and a zero-value `http.Server` have no timeouts. Build the server explicitly with all four set; long streaming handlers extend their own deadline with `http.NewResponseController(w).SetWriteDeadline`. Also cap request bodies with `http.MaxBytesReader`.

**Incorrect:**

```go
log.Fatal(http.ListenAndServe(":8080", router))
```

**Correct:**

```go
srv := &http.Server{
	Addr:              ":8080",
	Handler:           router,
	ReadHeaderTimeout: 5 * time.Second,
	ReadTimeout:       15 * time.Second,
	WriteTimeout:      30 * time.Second,
	IdleTimeout:       120 * time.Second,
}
log.Fatal(srv.ListenAndServe())
```

Reference: https://pkg.go.dev/net/http#Server
