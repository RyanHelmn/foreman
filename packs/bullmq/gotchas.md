# bullmq gotchas

- [gotcha] The Redis behind BullMQ must run with maxmemory-policy noeviction; any eviction policy can delete job keys and corrupt queues · paths: **/docker-compose*.yml
- [gotcha] Worker connections need maxRetriesPerRequest: null in the ioredis options · paths: **/*.ts
- [gotcha] A custom jobId stops deduplicating once removeOnComplete deletes the finished job; the same id can then be added and run again · paths: **/*.ts
- [gotcha] Workers killed without worker.close() (Nest: app.enableShutdownHooks()) leave active jobs to be picked up again as stalled · paths: **/main.ts
- [gotcha] Long CPU-bound work in a processor blocks the event loop past the lock duration; the job is marked stalled and run a second time · paths: **/*.processor.ts
