# php · reviewer
Applies when: composer.json present
Read order: php-sql-prepared, php-unserialize-input, php-include-input, php-escape-output, php-symfony-voter, php-doctrine-fetch-join

## Blocker vs should-fix
- Blocker: php-sql-prepared, php-unserialize-input, php-include-input or php-escape-output on any input path; a Symfony controller acting on a route entity with no voter or ownership check.
- Should-fix: php-doctrine-fetch-join on list endpoints; Symfony form or DTO input without `#[Assert\...]` constraints and a `isValid()`/`validate()` call.
