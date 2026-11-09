# redis gotchas

- [gotcha] maxmemory-policy is per instance: BullMQ needs noeviction while caches want allkeys-lru, so give them separate instances · paths: **/docker-compose*.yml
- [gotcha] ioredis keyPrefix is not applied to KEYS or SCAN MATCH patterns; include the prefix in the pattern yourself · paths: **/*.ts
- [gotcha] A plain SET on an existing key removes its TTL unless it passes EX or KEEPTTL · paths: **/*.ts
- [gotcha] In Redis Cluster, multi-key commands and MULTI need all keys in one hash slot; use a {hash-tag} in the key names · paths: **/*.ts
- [gotcha] SCAN on a Redis Cluster covers only the node it runs on; scan each master (ioredis cluster.nodes('master')) · paths: **/*.ts
