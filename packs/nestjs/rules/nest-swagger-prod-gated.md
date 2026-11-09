---
id: nest-swagger-prod-gated
title: Serve Swagger UI only outside production or behind auth, with placeholder examples
impact: HIGH
impactDescription: "the full route map, schemas and any example credentials are public on the production host"
roles: [implementer, reviewer, security]
check: "rg -n 'SwaggerModule\.setup' src/"
tags: openapi, security, nestjs
---
Source: an anonymous request to the docs path. Sink: `SwaggerModule.setup`, which mounts directly on the HTTP adapter, so `APP_GUARD` never runs for it. Call it only outside production, or put an auth middleware on the docs path before `setup`. `example:` values and bearer-auth defaults are placeholders, never a real API key, JWT or customer record.

**Incorrect:**

```ts
SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, docConfig))
```

**Correct:**

```ts
if (config.get('NODE_ENV', { infer: true }) !== 'production') {
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, docConfig))
}
```
