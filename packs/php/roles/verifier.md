# php · verifier
Applies when: composer.json present

## Commands
- PHPUnit subset: `vendor/bin/phpunit tests/Unit/InvoiceTest.php`, by name: `vendor/bin/phpunit --filter 'InvoiceTest::testRejectsNegativeTotal'`.
- Pest subset: `vendor/bin/pest tests/Feature/InvoiceTest.php --filter 'rejects negative total'`.
- Static analysis when configured: `vendor/bin/phpstan analyse <paths>` or `vendor/bin/psalm <paths>`.
- Symfony full: `bin/phpunit` if present, else `vendor/bin/phpunit`.

## Obstacles to report
- `--filter` that matches nothing prints "No tests executed!"; report it as no tests run, not PASS.
