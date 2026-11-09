# redis · reviewer
Applies when: `ioredis`, `redis`, `@upstash/redis` or `go-redis` is a dependency
Read order: redis-auth-not-public, redis-ttl-cache, redis-no-keys, redis-key-namespace, redis-small-values, redis-stream-consumer-ack

## Blocker vs should-fix
- Blocker: Redis published without auth or on a public interface; `KEYS` on a request path; a cache key without the tenant serving tenant-scoped data.
- Should-fix: a cache-like key without a TTL, or a TTL set in a separate command; an unbounded value or list; ack before handling.
- Nit: a key outside the namespace helper.
