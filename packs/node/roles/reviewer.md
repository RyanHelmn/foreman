# node · reviewer
Applies when: an Express, Fastify, Hono, Koa, tRPC or GraphQL server dependency is present (not NestJS)
Read order: node-trpc-protected-procedure, node-route-schema, node-async-handler-errors, node-error-handler, node-graphql-limits, node-body-limit, node-helmet, node-graceful-shutdown, node-router-per-domain

## Blocker vs should-fix
- Blocker: a public procedure or resolver that reads or writes user data; a route without a schema on body, params or query it uses; an unwrapped async handler on Express 4; an error response carrying `err.message` or `err.stack` from an unknown error.
- Should-fix: a globally raised body limit; a route mounted on `app` outside its domain router; a new GraphQL type reachable without a depth limit in place.

## Obstacles to report
- Two error shapes in responses (handler-built and central): name both files.
