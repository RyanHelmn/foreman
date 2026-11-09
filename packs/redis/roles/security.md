# redis · security
Applies when: `ioredis`, `redis`, `@upstash/redis` or `go-redis` is a dependency
Read order: redis-auth-not-public

## Also trace (no rule file yet)
- Values read back from Redis treated as trusted: deserialising with `pickle.loads`, `Marshal.load` or `eval` lets anyone who can write a key run code.
- Cache keys built without the user or tenant for per-user responses: one user's data served to another.
- Lua scripts (`EVAL`) built by concatenating input; pass values through `KEYS`/`ARGV`.
- Session stores: unguessable session keys, TTL equal to the session lifetime, deletion on logout.

## Commands
- `redis-cli -u "$REDIS_URL" ACL WHOAMI` and `CONFIG GET protected-mode` (managed providers may block `CONFIG`).
- `redis-cli -u "$REDIS_URL" --bigkeys` to find oversized values (it scans the keyspace; run it against a replica or non-production).
