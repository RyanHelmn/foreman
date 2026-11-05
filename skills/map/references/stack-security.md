# Stack security — built-in sections

`/foreman:map` copies **General** plus the matching sections into `.foreman/stack-guide.md › Security`. Installed security skills take precedence where more specific. For every item the auditor looks for a concrete source→sink path; only exploitable paths are findings, the rest is hardening.

## General (always included)

- **Secrets**: keys, tokens, DB URLs in code, committed env files, fixtures, logs, error messages, client bundles, API doc examples, container images.
- **AuthN/AuthZ**: every new or changed endpoint, action, job, webhook, socket event — who can call it; ownership checked on every object id (IDOR); admin surfaces gated by role; privilege not assignable via request bodies (mass assignment).
- **Injection**: SQL/NoSQL (string-built queries, raw query helpers), command (`exec`/`spawn`/`subprocess` with `shell=True` and user input), path traversal, template/HTML (unsanitised rendering), header/log (CRLF), LDAP/XPath, **prompt injection** (untrusted text reaching tool-calling LLMs).
- **SSRF**: server-side fetch of user-supplied URLs without allowlist and private-range blocking (webhooks, importers, image proxies, link previews).
- **Open redirects**; **CSRF** on cookie auth; **CORS** with wildcard + credentials.
- **Deserialisation/parsing**: untrusted JSON/YAML/XML without schema validation; `eval`/dynamic code; XML external entities; zip-slip on archives.
- **Crypto**: weak hashes for passwords (use argon2/bcrypt/scrypt), non-CSPRNG tokens, home-rolled JWT checks, `alg:none`, unverified webhook signatures, TLS verification disabled.
- **Rate limiting / abuse**: auth, OTP, password reset, expensive endpoints, AI calls, webhooks; per-user/tenant cost caps.
- **Data exposure**: PII in logs, over-broad serialisation, stack traces in responses, 404 vs 403 leaking existence, verbose errors, directory listings.
- **Uploads**: type/size limits, extension allowlist, stored outside the web root or in object storage with private ACL, signed URLs with expiry, image processing in a sandbox.
- **Dependencies**: new packages (maintainer, install scripts, typosquatting), advisories (`npm audit`, `pip-audit`, `cargo audit`, `bundle audit`, `govulncheck`, `dotnet list package --vulnerable`), lockfile changes.
- **Multi-tenancy**: every tenant-scoped query filters by tenant from the session, never from the request.
- **Infra**: containers as non-root, no secrets in images, debug endpoints/admin UIs (Swagger, Bull Board, GraphiQL, Django admin) disabled or authenticated in production, security headers (CSP, HSTS, frame-ancestors).

## JavaScript / TypeScript

- **Next.js**: Server Actions are public POST endpoints — validate + check session inside; Route Handlers auth per handler; middleware is not the only auth boundary; no per-user data in public caches; `images.remotePatterns` restricted; `dangerouslySetInnerHTML` only with a sanitiser; no secrets in client components or `__NEXT_DATA__`.
- **Remix/SvelteKit/Nuxt**: loaders/actions/`+server` authorise per request; server-only modules not imported by client code; env prefix rules (`PUBLIC_`, `VITE_`, `NUXT_PUBLIC_`).
- **NestJS**: guards on every controller/route or explicit `@Public()`, and the global guard actually registered; `ValidationPipe` with `whitelist`+`forbidNonWhitelisted`; ownership checks in services; Swagger behind auth or off in prod with no real tokens in examples; global exception filter; `helmet`; BullMQ job data validated, no secrets in payloads, dashboards behind auth; gateways authenticate on handshake.
- **Express/Fastify/Hono/Koa**: body-size limits, `helmet`, schema validation on every route, no `eval`/`vm` with input, error handler hides internals.
- **tRPC/GraphQL**: context-based auth per procedure/resolver; query depth/complexity limits; introspection off in prod; no auto-generated resolvers exposing whole tables.
- **React/client**: client checks are UX only; sanitise HTML; validate URLs (`javascript:`); clear sensitive caches on logout; CSP + `sandbox` for third-party frames; no tokens in `localStorage` when cookies are possible.
- **Electron/Tauri**: context isolation, no `nodeIntegration`, validated IPC, restricted navigation/`shell.openExternal`, CSP.
- **Prisma/Drizzle/Kysely/TypeORM**: raw query helpers with interpolation (`$queryRawUnsafe`, `sql.raw`) are findings; `updateMany`/`deleteMany` scoped; migrations don't widen access; seed scripts without plaintext secrets.

## Mobile

- **Expo/RN**: tokens in `expo-secure-store`/Keychain/Keystore, never AsyncStorage; deep/universal links validate params and never auto-perform sensitive actions; OAuth `state`/PKCE; no secrets in the bundle (`EXPO_PUBLIC_*`); proxy third-party keys via backend; `cleartextTraffic` off, ATS on; WebViews with `originWhitelist`, no untrusted `injectedJavaScript`; signed OTA updates with pinned runtime version; screenshot/clipboard protection on sensitive screens.
- **Flutter**: `flutter_secure_storage`; certificate pinning for high-value APIs; no secrets in `--dart-define` for public builds.
- **Native iOS/Android**: Keychain/Keystore; ATS/network security config; exported components/intents restricted; biometric gating where appropriate; no logging of PII (`os_log`/Logcat).

## Python

- Django: `DEBUG=False`, `ALLOWED_HOSTS`, CSRF middleware, ORM over raw SQL (`.raw`/`extra` with input are findings), `SECRET_KEY` from env, admin behind auth/IP; FastAPI: dependencies for auth, Pydantic models with strict types, no `pickle`/`yaml.load` on input, `subprocess` without `shell=True`; Jinja autoescape on.

## Go

- `database/sql` placeholders only; `html/template` not `text/template` for HTML; `exec.Command` without shell; `crypto/rand` for tokens; `http.Server` timeouts set; `govulncheck` clean.

## Rust

- `sqlx` macros or parameterised queries; `serde` `deny_unknown_fields` where mass assignment matters; `unsafe` justified and reviewed; `cargo audit`/`cargo deny` clean.

## JVM

- Spring Security config explicit (CSRF, CORS, method security); JPA/JPQL parameterised (no string concat); Jackson polymorphic typing disabled; Actuator endpoints restricted; no `Runtime.exec` with input.

## Ruby / Rails

- Strong params; `html_safe`/`raw` with input are findings; `where` with string interpolation is a finding; `send`/`constantize` on input; `brakeman` clean; credentials encrypted.

## PHP

- Prepared statements; `htmlspecialchars`/Blade `{{ }}` not `{!! !!}` for input; `unserialize` on input; file inclusion with input; Laravel policies on every resource route.

## .NET

- Parameterised EF/Dapper; `[Authorize]` by default with explicit `[AllowAnonymous]`; anti-forgery on forms; `BinaryFormatter` banned; secrets via user-secrets/KeyVault.

## Data

- DB user least-privilege, SSL to the database, no superuser for the app; backups encrypted; row-level security or application tenant filters; pgvector/vector stores isolated per tenant; Redis authenticated and not public; search indexes without PII unless needed.

## Auth libraries & integrations

- Session cookie flags, CSRF, trusted origins; email verification before privileged actions; single-use expiring reset tokens; OAuth `state`/PKCE; account linking requires verified email; session revocation on password change; impersonation audited.
- **Webhooks (Stripe, Shopify, Klaviyo, GitHub, …)**: verify HMAC on the raw body before parsing; idempotency on event ids; replay windows.
- **Commerce/platform apps (Shopify etc.)**: per-shop tokens encrypted at rest, minimal scopes, app-proxy signatures verified, amounts from server-side prices.
- **AI/LLM features**: model output is untrusted — no execution, no raw HTML, tool calls gated by policy; prompt injection via user/document content; exfiltration via generated URLs; per-user cost limits; tenant isolation in retrieval.
