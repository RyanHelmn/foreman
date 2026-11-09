# nestjs · implementer
Applies when: `@nestjs/core` is a dependency or `nest-cli.json` exists
Read order: nest-guard-global, nest-validation-pipe-whitelist, nest-ownership-in-service, nest-gateway-handshake-auth, nest-swagger-prod-gated, nest-prisma-single-service, nest-exception-filter, nest-config-validated, nest-thin-controller, nest-module-per-context, nest-swagger-every-route

## Iron laws
- Every new route sits behind the global guard or carries an explicit `@Public()`. Thinking "it's internal, nobody knows the URL"? That is the bug.
- Every `@Body()` and `@Query()` is typed as a DTO class with validators. Thinking "`Partial<Dto>` is the same type"? The pipe skips it; that is the bug.

## Deviation rules
- A service method you touch that loads by id without the acting user: add the user parameter, update its callers in your files, and say so.
- A new env var: add it to the config schema in the same change, or report BLOCKED if the schema file isn't yours.

## Output additions
- Routes added or changed: method, path, `@Public()` or guarded, DTO class.
- OpenAPI spec or generated client regenerated: yes / no / none in repo.

## Obstacles to report
- Pipes, guards or filters registered in `main.ts` (`useGlobal*`) instead of `APP_*` providers: e2e tests won't apply them; name which.
- A `Scope.REQUEST` provider you inject: it makes your provider request-scoped too.
