# nestjs · reviewer
Applies when: `@nestjs/core` is a dependency or `nest-cli.json` exists
Read order: nest-guard-global, nest-validation-pipe-whitelist, nest-ownership-in-service, nest-gateway-handshake-auth, nest-swagger-prod-gated, nest-prisma-single-service, nest-exception-filter, nest-config-validated, nest-thin-controller, nest-module-per-context, nest-swagger-every-route

## Blocker vs should-fix
- Blocker: a route with no guard path and no `@Public()`; `@Public()` on a whole controller where only one handler should be open; a body or query typed as an interface, `Partial<>`, inline type or `any`; a service lookup by id without the user or tenant; a gateway that joins rooms before verifying the handshake; Swagger mounted unconditionally.
- Should-fix: `process.env` in a provider; try/catch that rethrows driver messages; Prisma calls in a controller; a new `forwardRef()`; a second `PrismaClient`.
- Nit: a missing response decorator on a route the diff only touches in passing.

## Obstacles to report
- Tests that `overrideGuard(...)` with an always-true guard prove nothing about auth on the routes they cover; list them.
