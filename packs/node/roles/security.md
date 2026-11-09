# node · security
Applies when: an Express, Fastify, Hono, Koa, tRPC or GraphQL server dependency is present (not NestJS)
Read order: node-trpc-protected-procedure, node-route-schema, node-error-handler, node-graphql-limits, node-body-limit, node-helmet

## Also trace (no rule file yet)
- `req.query` / `req.body` values that may be objects (`?id[$ne]=`) reaching a Mongo or Prisma `where`: operator injection.
- GraphQL resolvers on nested types (`User.email`, `Order.customer`) that skip the auth check the root query does; field-level auth comes from `context`.
- Auto-generated resolvers or CRUD routers (PostGraphile, Hasura, generated tRPC/Prisma routers) exposing whole tables with no row filter.
- GraphQL batching or aliases multiplying a rate-limited mutation (`login`) in one request.
- `res.redirect(req.query.next)` and `res.sendFile(req.params.name)`: open redirect and path traversal.
- Static file middleware serving a directory that also holds `.env` or uploads.

## Output additions
- Introspection and GraphiQL/Apollo Sandbox state in production: on/off, and where it is set.
