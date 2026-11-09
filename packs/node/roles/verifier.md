# node · verifier
Applies when: an Express, Fastify, Hono, Koa, tRPC or GraphQL server dependency is present (not NestJS)

## Commands
- HTTP tests import the app without listening: Supertest `request(app)`, Fastify `app.inject()`, Hono `app.request()`, tRPC `appRouter.createCaller(ctx)`. Subset them by file like any other test.
- Jest hangs after tests: rerun once with `--detectOpenHandles` and report the open handle (server, pool, timer).

## Known false negatives
- A test that mocks the auth middleware or builds the tRPC caller with a hand-made `ctx.user` proves nothing about auth; list such tests as weak when the diff changes auth.
- `EADDRINUSE` in parallel workers: INCONCLUSIVE (port collision), not a regression.
