# bullmq · verifier
Applies when: `bullmq` or `@nestjs/bullmq` is a dependency

## Commands
- Processor unit tests call `process()` with a stub `Job` (`{ data, id, attemptsMade }`); no Redis needed.
- Integration tests need a real Redis (Testcontainers or compose `redis` service) and must `await worker.close()` and `await queue.close()` in teardown, or the runner hangs.

## Known false negatives
- Calling `process()` directly skips attempts, backoff, `jobId` dedupe and stalled-job reruns; idempotency is only shown by a test that runs the processor twice on the same job and asserts one side effect.
