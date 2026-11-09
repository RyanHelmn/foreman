---
id: redis-auth-not-public
title: Require credentials and TLS for Redis, and never expose its port publicly
impact: CRITICAL
impactDescription: "anyone who finds the port reads every cached session and job, or writes keys the app trusts"
roles: [implementer, reviewer, security]
tags: access, redis
---
Source: any host that can reach the Redis port. Sink: the whole keyspace, plus `CONFIG SET` and `MODULE LOAD` on self-managed servers. Connection URLs carry a password or ACL user and use `rediss://` across networks; the server listens on a private network, keeps `protected-mode yes`, and compose files deployed beyond a laptop don't publish `6379` on all interfaces. Give the app an ACL user limited to the commands and key patterns it needs.

**Incorrect:**

```yaml
redis:
  image: redis:7
  ports: ["6379:6379"]
```

**Correct:**

```yaml
redis:
  image: redis:7
  command: ["redis-server", "--requirepass", "${REDIS_PASSWORD}"]
  expose: ["6379"]
```

Reference: https://redis.io/docs/latest/operate/oss_and_stack/management/security/
