# bullmq · security
Applies when: `bullmq` or `@nestjs/bullmq` is a dependency
Read order: bull-dashboard-auth, bull-small-payload, bull-job-data-validated

## Also trace (no rule file yet)
- Job name, queue name or processor selected from request input (`queue.add(req.body.type, …)`): the client chooses which handler runs.
- Redis connection used by queues: password or ACL user, TLS (`rediss://`) across networks, not reachable from the internet.
- Failed-job reasons and stack traces shown in dashboards or logs that include payload fields.
