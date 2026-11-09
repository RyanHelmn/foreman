# redis · implementer
Applies when: `ioredis`, `redis`, `@upstash/redis` or `go-redis` is a dependency
Read order: redis-ttl-cache, redis-no-keys, redis-key-namespace, redis-small-values, redis-stream-consumer-ack, redis-auth-not-public

## Output additions
- Keys added: pattern, TTL, and what invalidates them.

## Obstacles to report
- One instance shared by BullMQ (needs `noeviction`) and a cache (wants an LRU policy): the policy is per instance; report it rather than changing it.
- Redis Cluster: multi-key commands and `MULTI` need all keys in one hash slot; say if a new command spans slots.
