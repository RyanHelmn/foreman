# Stack practices — built-in sections

`/foreman:map` copies **General** plus the sections matching the detected stack into `.foreman/stack-guide.md`. Installed skills in `.claude/skills/` take precedence where they are more specific. Each section is a checklist, not a tutorial.

## General (always included)

- Match the neighbouring code: naming, folder layout, error handling, test style. Consistency beats personal preference.
- Validate at boundaries (HTTP, queue, CLI, file, third-party response); trust types inside.
- Errors: fail loudly with context; never swallow; one error-handling strategy per layer; no stack traces to users.
- No speculative abstractions, drive-by refactors, or new dependencies outside the brief. Prefer the standard library and what the project already uses.
- Small, reversible changes; migrations and config changes separated from logic changes when practical.
- Tests assert behaviour through public interfaces, use factories not shared fixtures, and cover the error path. Unit for logic, integration for data/auth, e2e only for critical journeys.
- Logging: structured, with correlation/request ids, no secrets or PII.
- Config from the environment, validated at startup, with one typed accessor; no scattered `env` reads.
- Concurrency: make handlers idempotent; bound retries with backoff; put timeouts on every outbound call.
- Performance: measure before optimising; avoid N+1 and unbounded queries; paginate; cache with explicit keys and invalidation.

## JavaScript / TypeScript

- `strict`; `unknown` over `any`; discriminated unions over boolean flags; `satisfies` for config; no floating promises.
- Package `exports` maps; no deep imports into `src/` across packages; one tsconfig/eslint base in monorepos (Turborepo/Nx/pnpm: declare `inputs`/`outputs`, `dependsOn: ["^build"]`).
- Runtime validation with zod/valibot/class-validator at boundaries; share schemas between client and server where possible.
- **Next.js (App Router)**: Server Components by default, `"use client"` at the leaf; data in Server Components/Route Handlers with explicit cache mode; Server Actions validate input and check auth inside; only `NEXT_PUBLIC_*` reaches the client; `loading.tsx`/`error.tsx` per fetching segment; `next/image`, `next/font`, `generateMetadata`.
- **Remix / React Router / SvelteKit / Nuxt / Astro**: loaders/actions validate and authorise per route; server-only modules isolated; form actions progressive by default; same env-exposure rule (`PUBLIC_`/`VITE_` prefixes are public).
- **React**: derive, don't duplicate state; colocate state; memoise only measured hot paths; stable keys; hooks per domain wrapping data access.
- **TanStack Query / SWR**: array keys via a key factory; intentional `staleTime`; narrow invalidation; optimistic updates only with rollback; no copying query data into local state.
- **State (Zustand/Redux/Jotai)**: one store per domain, selectors to avoid re-renders, no derived data stored.
- **Styling**: **Tailwind** — theme tokens, `cva`/`tailwind-variants` + `cn()`, no dynamic class strings Tailwind can't see, focus-visible and contrast; **CSS modules / styled-components / vanilla-extract** — follow the existing approach, no mixing.
- **Node servers**: **NestJS** — one module per bounded context, thin controllers, `ValidationPipe({ whitelist, forbidNonWhitelisted, transform })`, guard or explicit `@Public()` on every route, ownership checks in services, `ConfigService` with validated schema, global exception filter, Swagger decorators on every route with generated spec, single `PrismaService`, BullMQ processors idempotent with bounded attempts and small job payloads; **Express/Fastify/Hono/Koa** — router per domain, schema validation middleware, central error handler, async handlers wrapped; **tRPC** — procedures validated with zod, context carries auth, routers per domain.
- **Electron / Tauri**: no Node integration in renderers, context isolation on, IPC validated, auto-update signed.
- **Testing**: Vitest/Jest unit; Testing Library for components; Supertest/injected app for HTTP; Playwright for e2e; `--filter`/path args for subsets.

## Mobile — Expo / React Native, Flutter, native

- **Expo/RN**: Expo Router with typed routes; secrets only in `expo-secure-store`/EAS secrets (`EXPO_PUBLIC_*` is public); FlashList/FlatList with stable keys and memoised rows; Reanimated worklets for gestures; `Platform.select`/platform files; lazy permission requests with denial paths; OTA never carries native-module changes (bump runtime version); Testing Library RN for components, Maestro/Detox for critical flows only.
- **Flutter**: one state approach (Riverpod/Bloc) consistently; `const` widgets; isolates for heavy work; `flutter_secure_storage` for secrets; golden tests for key widgets.
- **iOS (Swift/SwiftUI)**: Keychain for secrets; `@MainActor` discipline; structured concurrency; no force unwraps in production paths; XCTest unit + a few UI tests.
- **Android (Kotlin/Compose)**: EncryptedSharedPreferences/Keystore; coroutines with structured scopes; `remember`/`derivedStateOf` correctly; Hilt modules per layer; JUnit + Compose UI tests.

## Python

- `pyproject.toml` with pinned deps (uv/poetry/pip-tools lock); type hints + mypy/pyright; ruff for lint/format.
- Pydantic (v2) models at boundaries; dataclasses/attrs internally; no mutable default args.
- **FastAPI**: dependencies for auth/db, response models, routers per domain, async only with async drivers; **Django**: fat models/thin views, QuerySet `select_related`/`prefetch_related`, migrations reviewed, `settings` split by env; **Flask**: blueprints, app factory.
- Celery/RQ/Dramatiq tasks idempotent, small payloads, retries bounded.
- pytest with fixtures/factories (factory_boy), `pytest -k`/path for subsets; no tests hitting the network.

## Go

- `gofmt`/`goimports`, `golangci-lint`; errors wrapped with `%w` and checked; `context.Context` first arg and propagated with deadlines.
- Packages by domain, not by layer; small interfaces defined by consumers; no global state.
- `net/http` or chi/echo/gin consistently; middleware for auth/logging; structured logging (`slog`).
- `sqlc`/`pgx` or an ORM consistently; migrations via `goose`/`migrate`.
- Table-driven tests; `-run` for subsets; race detector in CI.

## Rust

- `cargo fmt`, `clippy -D warnings`; `thiserror` for libraries, `anyhow` for binaries; no `unwrap` outside tests/setup.
- Axum/Actix handlers extract typed state; `serde` at boundaries with `deny_unknown_fields` where appropriate; `sqlx` compile-time checked queries or `sea-orm`/`diesel` consistently.
- Tokio: no blocking in async; `spawn_blocking` for CPU work; bounded channels.

## JVM — Java / Kotlin

- Spring Boot: constructor injection, `@Validated` DTOs, `@Transactional` at service boundaries, profiles per env, Actuator health; Kotlin: data classes, sealed types, coroutines with structured scopes.
- JPA/Hibernate: explicit fetch plans (avoid N+1), Flyway/Liquibase migrations; or jOOQ/Exposed consistently.
- JUnit 5 + Testcontainers for data; Gradle/Maven task filters for subsets.

## Ruby / Rails

- Rubocop; strong params; service objects for multi-model operations; `includes` to avoid N+1; background jobs idempotent (Sidekiq/ActiveJob); credentials via `rails credentials`.
- RSpec/Minitest with factories; system tests only for critical flows.

## PHP — Laravel / Symfony

- Form requests/validators; policies for authorisation; Eloquent/Doctrine with eager loading; queued jobs idempotent; `.env` via config cache; Pest/PHPUnit with factories.

## .NET

- Minimal APIs or controllers consistently; DI by constructor; `IOptions<T>` validated; EF Core migrations, `AsNoTracking` for reads, explicit includes; xUnit + Testcontainers.

## Data — SQL / NoSQL / search / cache

- **Postgres/MySQL**: migrations only (no ad-hoc schema changes on shared envs); index FKs and filter/sort columns; composite indexes match query order; `timestamptz`; `numeric` for money; enums or check constraints for closed sets; transactions around multi-write operations; parameterised queries only.
- **Prisma**: `migrate dev`/`migrate deploy`, never `db push` on shared envs; `select`/`include` deliberately; tenancy/soft-delete via extension or repository layer; `$queryRaw` tagged templates only. **Drizzle/Kysely/TypeORM/SQLAlchemy/ActiveRecord**: equivalent rules — generated migrations, explicit loading, no string-built SQL.
- **pgvector / vector DBs**: index embedding columns (HNSW/IVFFlat); filter before vector search; tenant isolation on every query.
- **MongoDB**: schema validation on collections; indexes for every query shape; no unbounded `$in`; transactions for multi-doc writes.
- **Redis**: key namespaces, TTLs on everything cache-like, no large values, idempotent consumers for streams/queues.
- **Search (Elastic/Meilisearch/Typesense)**: index mappings versioned; reindex strategy documented.

## Auth & sessions (library-agnostic)

- Server-side session/token check on every protected action; client auth state is UI only.
- Cookies `httpOnly`, `secure`, `sameSite`; CSRF protection for cookie auth; rate limits on sign-in/up/reset/OTP.
- Roles/permissions checked in the service layer, not only in middleware; ownership checks on every object reference.
- better-auth / NextAuth / Clerk / Passport / Devise / Spring Security: follow the library's documented hardening page; don't hand-roll token verification.

## Infra, CI, containers

- Dockerfiles multi-stage, non-root user, pinned base images, `.dockerignore`; compose for local deps only.
- CI runs typecheck, lint, unit, integration (with real DB via containers), and e2e on a schedule or on main; caches keyed on lockfile.
- Secrets from the CI/host secret store, never in repo; env validated at startup.
- Coolify/Kubernetes/serverless: health checks, resource limits, graceful shutdown handling SIGTERM, migrations as a release step.
