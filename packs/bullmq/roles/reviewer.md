# bullmq · reviewer
Applies when: `bullmq` or `@nestjs/bullmq` is a dependency
Read order: bull-small-payload, bull-dashboard-auth, bull-idempotent-processor, bull-job-data-validated, bull-attempts-backoff, bull-retention-bounded

## Blocker vs should-fix
- Blocker: tokens, secrets or full personal records in job data; a dashboard reachable without admin auth; a processor whose side effect (charge, email, external create) repeats on a rerun.
- Should-fix: a queue with no attempts or backoff; no retention limits; `job.data` used without parsing; retrying errors that can never succeed.
