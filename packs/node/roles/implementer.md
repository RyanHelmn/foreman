# node · implementer
Applies when: an Express, Fastify, Hono, Koa, tRPC or GraphQL server dependency is present (not NestJS)
Read order: node-trpc-protected-procedure, node-route-schema, node-async-handler-errors, node-error-handler, node-graphql-limits, node-body-limit, node-helmet, node-graceful-shutdown, node-router-per-domain

## Iron laws
- Every tRPC procedure and GraphQL resolver that touches user data derives the user from context and rejects when absent. Thinking "the frontend only calls this after login"? That is the bug.

## Deviation rules
- Check the installed major of `express` before writing async handlers: Express 4 needs the wrapper, Express 5 doesn't.
- New routes go in the domain router with the schema in the route definition; never add a route directly on `app`.

## Output additions
- Routes or procedures added: method + path (or procedure name), schema yes/no, auth yes/no.

## Obstacles to report
- The entry file calls `listen()` at import time, so the app can't be tested without a port.
- Middleware the new route depends on (auth, body parser) is mounted after the router.
