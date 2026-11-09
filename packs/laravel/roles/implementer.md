# laravel · implementer
Applies when: laravel/framework in composer.json, or an artisan file present
Read order: lara-policy-authorize, lara-mass-fillable, lara-raw-bindings, lara-blade-unescaped, lara-validate-form-request, lara-eager-with, lara-env-in-config

## Iron laws
- Every action on a route-bound or looked-up model runs a policy check or a user-scoped query. Thinking "it's behind the auth middleware"? That is the bug.

## Deviation rules
- Schema changes go in a new migration (`php artisan make:migration`) with a working `down()`; never edit one that has run.
- Queued jobs are retried (`$tries`, `retry_after`): guard charges and emails with a state check, `ShouldBeUnique`, or `WithoutOverlapping`.
- Generate classes with `php artisan make:*` so they land where the project expects.

## Output additions
- Migration added: file name, or none.

## Obstacles to report
- A cached config (`bootstrap/cache/config.php`) present locally makes new config keys invisible: report it; don't delete it unless the brief allows.
