---
id: nest-config-validated
title: Load env through ConfigModule with a validate function and read it via ConfigService
impact: HIGH
impactDescription: "a missing or malformed env var boots fine and fails on the first request that reads it"
roles: [implementer, reviewer]
check: "rg -n 'process\.env\.' src/ --glob '!**/main.ts' --glob '!**/*config*'"
tags: config, nestjs
---
`ConfigModule.forRoot({ isGlobal: true, validate })` with a schema (zod, class-validator, or Joi via `validationSchema`) makes the app refuse to start on bad config. Providers inject `ConfigService<Env, true>` and call `get(key, { infer: true })` for a typed, validated value; `process.env` in a provider skips validation and can't be overridden in tests with `overrideProvider(ConfigService)`. Modules configured from env use `forRootAsync({ inject: [ConfigService], useFactory })`. A new env var lands in the schema in the same change.

**Incorrect:**

```ts
@Injectable()
export class MailService {
  send(to: string) { return resend(process.env.RESEND_KEY!).send(to) }
}
```

**Correct:**

```ts
ConfigModule.forRoot({ isGlobal: true, validate: (raw) => EnvSchema.parse(raw) })

@Injectable()
export class MailService {
  constructor(private config: ConfigService<Env, true>) {}
  send(to: string) { return resend(this.config.get('RESEND_KEY', { infer: true })).send(to) }
}
```

Reference: https://docs.nestjs.com/techniques/configuration#custom-validate-function
