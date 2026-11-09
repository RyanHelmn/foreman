# bullmq · implementer
Applies when: `bullmq` or `@nestjs/bullmq` is a dependency
Read order: bull-small-payload, bull-dashboard-auth, bull-idempotent-processor, bull-job-data-validated, bull-attempts-backoff, bull-retention-bounded

## Iron laws
- Job data carries ids, never tokens, secrets or whole records. Thinking "the processor needs it and Redis is private"? That is the bug.

## Output additions
- Queues and job names added: attempts, backoff, retention, and the `jobId` scheme if any.

## Obstacles to report
- Processors registered in the API's module run in every API replica; say so if the brief assumed a separate worker process.
- A job shape change while old jobs may still be queued: say how the processor handles both.
