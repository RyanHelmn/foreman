# laravel · reviewer
Applies when: laravel/framework in composer.json, or an artisan file present
Read order: lara-policy-authorize, lara-mass-fillable, lara-raw-bindings, lara-blade-unescaped, lara-validate-form-request, lara-eager-with, lara-env-in-config

## Blocker vs should-fix
- Blocker: lara-policy-authorize, lara-mass-fillable, lara-raw-bindings, lara-blade-unescaped on user content; `$request->all()` passed to `create`/`update`.
- Should-fix: lara-eager-with on lists; `env()` outside `config/`; a queued job with side effects and no idempotency guard; a migration without `down()`.
