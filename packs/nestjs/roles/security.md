# nestjs · security
Applies when: `@nestjs/core` is a dependency or `nest-cli.json` exists
Read order: nest-guard-global, nest-validation-pipe-whitelist, nest-ownership-in-service, nest-gateway-handshake-auth, nest-swagger-prod-gated

## Also trace (no rule file yet)
- Security headers: `helmet()` (Express) or `@fastify/helmet` registered in bootstrap.
- `app.enableCors({ origin: true, credentials: true })` or a reflected origin: any site makes credentialed requests.
- Role checks reading metadata with `reflector.get(KEY, ctx.getHandler())` only: class-level `@Roles()` is ignored.
- Hybrid apps: `useGlobalPipes`/`useGlobalGuards` don't cover gateways or connected microservices; `@MessagePattern`/`@EventPattern` payloads need their own validation and auth.
- `@Throttle()` limits on login, OTP, password reset and AI endpoints, with `ThrottlerGuard` registered after the auth guard.
- Third-party admin UIs mounted with `app.use(...)` (queue dashboards, GraphQL playground): `APP_GUARD` doesn't run for them.

## Commands
- `npm audit --omit=dev` (or `pnpm audit --prod`).
- `rg -n "@Public\(\)" src/` and compare with the routes the diff adds.
- `rg -n "SwaggerModule.setup|enableCors|useGlobal|app\.use\(" src/main.ts`
