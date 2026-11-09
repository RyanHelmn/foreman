# laravel · verifier
Applies when: laravel/framework in composer.json, or an artisan file present

## Commands
- Subset: `php artisan test --filter=InvoiceTest` or `php artisan test tests/Feature/InvoiceTest.php`.
- Full: `php artisan test`, plus `vendor/bin/pint --test` and `vendor/bin/phpstan analyse` (Larastan) when configured.

## Obstacles to report
- Tests reading a cached config (`bootstrap/cache/config.php`) ignore `phpunit.xml` env values and may hit the real database: run `php artisan config:clear` first, and report it.
- A missing `.env` or `APP_KEY` ("No application encryption key"): INCONCLUSIVE, not FAILED.
